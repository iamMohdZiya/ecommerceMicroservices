const axios = require("axios");
const Order = require("../models/orderModel");
const EventEmitter = require("events");
const redisClient = require('../utils/redis');

const orderEmitter = new EventEmitter();



// Event when order placed
orderEmitter.on("ORDER_PLACED", (order) => {
  console.log(`✅ Order placed: ${order._id} for user ${order.userId}`);
});

// ============================
// Get all orders
// ============================
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const cacheKey = redisClient.generateKey(
      'orders:list',
      req.user.id,
      req.user.role,
      status || 'all',
      page,
      limit
    );

    // Try to get from cache
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      console.log('Cache hit for orders list');
      return res.status(200).json(cachedResult);
    }

    // If not in cache, get from database
    let result;
    if (req.user.role === "admin") {
      const query = status ? { status } : {};
      const [orders, total] = await Promise.all([
        Order.find(query)
          .limit(Number(limit))
          .skip((Number(page) - 1) * Number(limit)),
        Order.countDocuments(query)
      ]);
      result = { orders, total, page: Number(page), limit: Number(limit) };
    } else {
      const orders = await Order.find({ userId: req.user.id });
      result = { orders, total: orders.length };
    }

    // Cache the result for 5 minutes
    await redisClient.set(cacheKey, result, 300);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// ============================
// Get order by ID
// ============================
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const cacheKey = redisClient.generateKey(
      'orders:detail',
      orderId,
      req.user.id,
      req.user.role
    );

    // Try to get from cache
    const cachedOrder = await redisClient.get(cacheKey);
    if (cachedOrder) {
      console.log('Cache hit for order detail');
      return res.status(200).json(cachedOrder);
    }

    // If not in cache, get from database
    const query =
      req.user.role === "admin"
        ? { _id: orderId }
        : { _id: orderId, userId: req.user.id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ message: "Order not found or not authorized" });
    }

    // Cache the order for 10 minutes
    await redisClient.set(cacheKey, order, 600);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};


// ============================
// Create new order
// ============================
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items must be a non-empty array" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    let total = 0;
    const orderItems = [];

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization token is required" });
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`;

    for (const item of items) {
      // First check Redis cache for item details
      const itemCacheKey = redisClient.generateKey('items:detail', item.productId);
      let dbItem = await redisClient.get(itemCacheKey);

      if (!dbItem) {
        // If not in cache, fetch from items service
        try {
          const response = await axios.get(
            `${process.env.ITEMS_SERVICE_URL}/api/items/${item.productId}`,
            {
              headers: {
                'Authorization': token
              }
            }
          );
          dbItem = response.data;
          // Cache the item details
          await redisClient.set(itemCacheKey, dbItem, 600);
        } catch (itemError) {
          console.error('Error fetching item:', itemError.response?.data || itemError.message);
          return res.status(400).json({ 
            message: `Error fetching product ${item.productId}`,
            error: itemError.response?.data || itemError.message 
          });
        }
      }

      if (!dbItem) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }
      if (item.quantity > dbItem.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${dbItem.name}` });
      }

      total += dbItem.rate * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: dbItem.rate,
      });

      // Update stock in Items Service
      try {
        await axios.put(
          `${process.env.ITEMS_SERVICE_URL}/api/items/${item.productId}/decrement`,
          { quantity: item.quantity },
          { headers: { 'Authorization': token } }
        );
        
        // Invalidate item cache since stock changed
        await redisClient.del(itemCacheKey);
      } catch (stockError) {
        console.error('Error updating stock:', stockError.response?.data || stockError.message);
        return res.status(400).json({ 
          message: `Error updating stock for product ${item.productId}`,
          error: stockError.response?.data || stockError.message 
        });
      }
    }

    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate that we have prices for all items
    if (orderItems.some(item => !item.price)) {
      return res.status(400).json({ message: "Price is required for all items" });
    }

    const orderData = {
      userId: req.user.id,
      items: orderItems,
      totalAmount: total,
      shippingAddress,
      status: "pending",
    };

    const newOrder = new Order(orderData);
    await newOrder.save();

    // Cache the new order
    const orderCacheKey = redisClient.generateKey('orders:detail', newOrder._id);
    await redisClient.set(orderCacheKey, newOrder, 600);

    // Invalidate the orders list cache for this user
    const userOrdersKey = redisClient.generateKey('orders:list', req.user.id);
    await redisClient.del(userOrdersKey);

    orderEmitter.emit("ORDER_PLACED", newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error in order creation:', error);
    const errorMessage = error.response?.data?.message || error.message;
    const errorDetails = error.response?.data || error;
    res.status(400).json({ 
      message: "Error creating order", 
      error: errorMessage,
      details: errorDetails
    });
  }
};

// ============================
// Update order (Admin only)
// ============================
const updateOrder = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipped"],
      shipped: ["delivered"],
    };

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid transition from ${order.status} to ${status}` 
      });
    }

    order.status = status;
    const updatedOrder = await order.save();

    // Update cache
    const orderCacheKey = redisClient.generateKey('orders:detail', order._id);
    await redisClient.set(orderCacheKey, updatedOrder, 600);

    // Invalidate relevant list caches
    const adminListKey = redisClient.generateKey('orders:list', 'admin');
    const userListKey = redisClient.generateKey('orders:list', order.userId);
    await Promise.all([
      redisClient.del(adminListKey),
      redisClient.del(userListKey)
    ]);

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: "Error updating order", error: error.message });
  }
};

// ============================
// Delete/Cancel order
// ============================
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found or not authorized" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    // Restore stock in Items Service
    for (const item of order.items) {
      try {
        await axios.put(
          `${process.env.ITEMS_SERVICE_URL}/api/items/${item.productId}/increment`,
          { quantity: item.quantity }
        );
        
        // Invalidate item cache since stock changed
        const itemCacheKey = redisClient.generateKey('items:detail', item.productId);
        await redisClient.del(itemCacheKey);
      } catch (error) {
        console.error(`Error restoring stock for item ${item.productId}:`, error);
      }
    }

    await Order.deleteOne({ _id: req.params.id });

    // Clear cache
    const orderCacheKey = redisClient.generateKey('orders:detail', order._id);
    const userListKey = redisClient.generateKey('orders:list', req.user.id);
    await Promise.all([
      redisClient.del(orderCacheKey),
      redisClient.del(userListKey)
    ]);

    res.status(200).json({ message: "Order cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
