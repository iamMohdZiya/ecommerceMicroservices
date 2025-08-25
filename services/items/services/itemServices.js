const Item = require("../models/itemModel");
const redisClient = require("../utils/redis");

async function createItem(data) {
  const item = await Item.create({
    name: data.name.trim(),
    qty: data.qty,
    rate: data.rate,
  });
  
  // Clear items list cache since we added a new item
  await redisClient.del('items:list');
  return item;
}

async function listItems({ page = 1, limit = 10 }) {
  page = Math.max(1, Number(page));
  limit = Math.max(1, Math.min(100, Number(limit)));

  // Try to get from cache first
  const cacheKey = redisClient.generateKey('items:list', `${page}:${limit}`);
  const cachedResult = await redisClient.get(cacheKey);
  if (cachedResult) {
    console.log('Cache hit for items list');
    return cachedResult;
  }

  // If not in cache, get from database
  const [items, total] = await Promise.all([
    Item.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Item.countDocuments()
  ]);

  const result = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    items,
  };

  // Cache the result for 5 minutes
  await redisClient.set(cacheKey, result, 300);
  return result;
}

async function getItemById(id) {
  // Try to get from cache first
  const cacheKey = redisClient.generateKey('items:detail', id);
  const cachedItem = await redisClient.get(cacheKey);
  if (cachedItem) {
    console.log('Cache hit for item detail');
    return cachedItem;
  }

  // If not in cache, get from database
  const item = await Item.findById(id);
  if (item) {
    // Cache the item for 10 minutes
    await redisClient.set(cacheKey, item, 600);
  }
  return item;
}

async function updateItem(id, data) {
  const item = await Item.findByIdAndUpdate(id, data, { new: true });
  if (item) {
    // Update cache
    const cacheKey = redisClient.generateKey('items:detail', id);
    await redisClient.set(cacheKey, item, 600);
    await redisClient.del('items:list');
  }
  return item;
}

async function deleteItem(id) {
  const item = await Item.findByIdAndDelete(id);
  if (item) {
    // Clear cache
    const cacheKey = redisClient.generateKey('items:detail', id);
    await redisClient.del(cacheKey);
    await redisClient.del('items:list');
  }
  return item;
}

async function decrementStock(id, quantity) {
  const item = await Item.findById(id);
  if (!item) return null;
  
  if (item.qty < quantity) {
    throw new Error('Insufficient stock');
  }

  item.qty -= quantity;
  const savedItem = await item.save();
  
  // Update cache
  const cacheKey = redisClient.generateKey('items:detail', id);
  await redisClient.set(cacheKey, savedItem, 600);
  await redisClient.del('items:list');
  
  return savedItem;
}

module.exports = {
  createItem,
  listItems,
  getItemById,
  updateItem,
  deleteItem,
  decrementStock,
};
