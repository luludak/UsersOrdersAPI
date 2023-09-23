// @/order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  type: {
    type: String,
    enum : ['Box1','Box2'],
    default: 'Box1',
    required: false,
  },
  description: {
    type: String,
    required: false,
  },

  // Note: We intentionally let this loosely (not required) for DB testing purposes
  // (0-N relationship).
  // Under a normal working environment, this should be mandatory (1-N relationship).
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = { Order };