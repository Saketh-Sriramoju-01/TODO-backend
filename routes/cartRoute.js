const express = require("express");
const router = express.Router();
const {
  addToCart,
  getAllCartItems,
  removeFromCart,
} = require("../controllers/cartController");

router.route("/addToCart").post(addToCart);
router.route("/getAllCartItems").get(getAllCartItems);
router.route("/removeFromCart/:cart_id").delete(removeFromCart);

module.exports = router;
