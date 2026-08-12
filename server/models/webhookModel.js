const WebhookModel = require('./webhookModel');

const handleChapaWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.status === 'success' || event.event === 'charge.success') {
      const tx_ref = event.tx_ref;

      // በ Model በኩል የ Database ማስተካከያውን መጥራት
      await WebhookModel.updateOrderStatus(tx_ref, 'Paid', 'Processing');

      console.log(`[Webhook Success]: Order ${tx_ref} payment updated to Paid.`);
    }

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return res.status(500).json({ message: 'Webhook processing failed' });
  }
};

module.exports = { handleChapaWebhook };
