const express = require("express");
const ctrl = require("../controllers/itemController");
const validateItem = require("../middlewares/validateItems");
const AuthClient = require("../shared/authClient");

const router = express.Router();
const authClient = new AuthClient({
  authServiceUrl: require('../shared/config').authServiceUrl,
  serviceToken: require('../shared/config').itemsServiceToken
});

// Auth middleware configs
const userAuth = authClient.middleware();
const adminAuth = authClient.middleware({ roles: ['admin'] });

// all users
router.get("/items", userAuth, ctrl.list);
router.get("/items/:id", userAuth, ctrl.getById);

// Admin-only
router.post("/items", adminAuth, validateItem, ctrl.create);
router.put("/items/:id", adminAuth, validateItem, ctrl.update);
router.delete("/items/:id", adminAuth, validateItem, ctrl.remove);

// Special operations
router.put("/items/:id/decrement", userAuth, ctrl.decrementStock);

module.exports = router;
