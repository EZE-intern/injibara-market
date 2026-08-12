const PaymentModel = require('../models/paymentModel');
const OrderModel = require('../models/orderModel');
const { initializeChapaPayment, verifyChapaPayment } = require('../services/chapaService');

//  Chapa Checkout Link  (Initialize)
const createChapaCheckout = async (req, res) => {
  try {
    const { order_id, amount, email, first_name, last_name } = req.body;
    const user_id = req.user.id;

    if (!order_id || !amount) {
      return res.status(400).json({ message: 'እባክዎ order_id እና amount ያስገቡ።' });
    }

    // Email validation to prevent Chapa validation.email error
    const customerEmail =
      email && email.trim() !== '' && email.includes('@')
        ? email
        : req.user?.email && req.user.email.includes('@')
          ? req.user.email
          : 'customer@gmail.com';

    const tx_ref = `TX-ORD${order_id}-${Date.now()}`;

    const chapaResponse = await initializeChapaPayment({
      amount,
      email: customerEmail,
      first_name: first_name || req.user.first_name || 'Customer',
      last_name: last_name || req.user.last_name || 'User',
      tx_ref,
    });

    console.log('--- CHAPA FULL CHECKOUT URL ---', chapaResponse?.data?.checkout_url);

    if (chapaResponse && chapaResponse.status === 'success') {
      await PaymentModel.create({
        order_id,
        user_id,
        amount,
        payment_method: 'chapa',
        transaction_id: tx_ref,
        status: 'pending',
      });

      return res.status(200).json({
        message: 'የ Chapa ክፍያ ሊንክ በተሳካ ሁኔታ ተፈጥሯል!',
        checkout_url: chapaResponse.data.checkout_url,
        tx_ref,
      });
    }

    return res.status(400).json({
      message: 'የክፍያ ሊንክ ማመንጨት አልተቻለም።',
      details: chapaResponse,
    });
  } catch (error) {
    return res.status(500).json({ message: 'የ Chapa ክፍያ ስህተት', error: error.message });
  }
};

// 2. የ Chapa ክፍያን ማረጋገጫ (Verify Endpoint)
const verifyChapa = async (req, res) => {
  try {
    const { tx_ref } = req.params;

    const verification = await verifyChapaPayment(tx_ref);

    if (
      verification &&
      verification.status === 'success' &&
      verification.data?.status === 'success'
    ) {
      const payment = await PaymentModel.getByTxRef(tx_ref);

      if (payment) {
        if (payment.status !== 'completed') {
          await PaymentModel.updateStatus(payment.order_id, 'completed', tx_ref);
          await OrderModel.updateStatus(payment.order_id, 'paid');
        }
      }

      return res.status(200).json({
        message: 'ክፍያው በተሳካ ሁኔታ ተረጋግጧል!',
        data: verification.data,
      });
    }

    return res.status(400).json({ message: 'ክፍያው አልተጠናቀቀም ወይም አልተረጋገጠም።' });
  } catch (error) {
    return res.status(500).json({ message: 'የማረጋገጥ ስህተት', error: error.message });
  }
};

// 3. Chapa Webhook / Callback Handler
const handleChapaWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log('--- CHAPA WEBHOOK EVENT RECEIVED ---', event);

    if (event && event.status === 'success') {
      const tx_ref = event.tx_ref;
      const payment = await PaymentModel.getByTxRef(tx_ref);

      if (payment) {
        if (payment.status !== 'completed') {
          await PaymentModel.updateStatus(payment.order_id, 'completed', tx_ref);
          await OrderModel.updateStatus(payment.order_id, 'paid');
          console.log(`✅ Webhook: Order ${payment.order_id} updated to completed.`);
        }
      }
      return res.status(200).json({ status: 'success', message: 'Webhook processed' });
    }

    return res.status(200).json({ status: 'ignored', message: 'Event not successful' });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return res.status(500).json({ message: 'Webhook processing error', error: error.message });
  }
};

//  Manual / COD Payment Process
const processPayment = async (req, res) => {
  try {
    const { order_id, amount, payment_method, transaction_id } = req.body;
    const user_id = req.user.id;

    if (!order_id || !amount || !payment_method) {
      return res.status(400).json({ message: 'እባክዎ order_id, amount እና payment_method ያስገቡ።' });
    }

    const order = await OrderModel.getById(order_id);
    if (!order) {
      return res.status(404).json({ message: 'ኦርደሩ አልተገኘም።' });
    }

    let initialStatus =
      payment_method === 'cash_on_delivery' ? 'pending' : transaction_id ? 'completed' : 'pending';

    const paymentId = await PaymentModel.create({
      order_id,
      user_id,
      amount,
      payment_method,
      transaction_id: transaction_id || null,
      status: initialStatus,
    });

    if (initialStatus === 'completed') {
      await OrderModel.updateStatus(order_id, 'processing');
    }

    return res.status(201).json({
      message: `${payment_method.toUpperCase()} ክፍያ በተሳካ ሁኔታ ተመዝግቧል!`,
      paymentId,
      status: initialStatus,
    });
  } catch (error) {
    return res.status(500).json({ message: 'የክፍያ ሂደቱን ማካሄድ አልተቻለም።', error: error.message });
  }
};

//  Get Payment by Order ID
const getPaymentByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await PaymentModel.getByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({ message: 'ለዚህ ኦርደር የተፈጸመ ክፍያ አልተገኘም።' });
    }
    return res.status(200).json(payment);
  } catch (error) {
    return res.status(500).json({ message: 'የክፍያ መረጃውን ማምጣት አልተቻለም።', error: error.message });
  }
};

// 6. Update Status
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, transaction_id } = req.body;
    const updated = await PaymentModel.updateStatus(orderId, status, transaction_id);
    if (!updated) {
      return res.status(404).json({ message: 'ክፍያው አልተገኘም ወይም ሊዘመን አልቻለም።' });
    }
    return res.status(200).json({ message: 'የክፍያ ሁኔታው ተቀይሯል!' });
  } catch (error) {
    return res.status(500).json({ message: 'የክፍያ ሁኔታውን ማዘመን አልተቻለም።', error: error.message });
  }
};

module.exports = {
  createChapaCheckout,
  verifyChapa,
  handleChapaWebhook,
  processPayment,
  getPaymentByOrder,
  updatePaymentStatus,
};
