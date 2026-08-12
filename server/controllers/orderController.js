const OrderModel = require('../models/orderModel');

// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'ኦርደሮችን ማምጣት አልተቻለም።', error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await OrderModel.getByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'የእርስዎን ኦርደሮች ማምጣት አልተቻለም።', error: error.message });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await OrderModel.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'ኦርደሩ አልተገኘም።' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'የኦርደሩን ዝርዝር ማምጣት አልተቻለም።', error: error.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { shipping_address_id, total_amount, note, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'እባክዎ ቢያንስ አንድ እቃ ይምረጡ።' });
    }

    const newOrder = await OrderModel.create({
      user_id: req.user.id,
      shipping_address_id,
      total_amount,
      note,
      items,
    });

    res.status(201).json({
      message: 'ኦርደሩ በተሳካ ሁኔታ ተመዝግቧል!',
      ...newOrder,
    });
  } catch (error) {
    res.status(500).json({ message: 'ኦርደሩን መመዝገብ አልተቻለም።', error: error.message });
  }
};

// @desc    Update order status (Admin / Seller)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!status) {
      return res.status(400).json({ message: 'እባክዎ አዲሱን Status ያስገቡ።' });
    }

    await OrderModel.updateStatus(orderId, status, req.user.id);

    res.json({ message: `የኦርደር status ወደ ${status} ተቀይሯል!` });
  } catch (error) {
    res.status(500).json({ message: 'የኦርደሩን status መቀየር አልተቻለም።', error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getMyOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
};
