const service = require("../services/itemServices");

exports.create = async (req, res, next) => {
  try {
    const item = await service.createItem(req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await service.listItems({ page, limit });
    res.json(result);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await service.getItemById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await service.updateItem(req.params.id, req.body);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await service.deleteItem(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) { next(err); }
};

exports.decrementStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }
    
    const item = await service.decrementStock(req.params.id, quantity);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    if (err.message === 'Insufficient stock') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};