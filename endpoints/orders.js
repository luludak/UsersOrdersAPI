require('dotenv').config();

const {authenticateToken} = require("./auth");

const user = require("../models/user");
const User = user.User;

const order = require("../models/order");
const Order = order.Order;

module.exports = (app) => {

  /* Get orders of any user. */
  app.get("/orders/user/:userID", authenticateToken, async (req, res) => {
    try {

      // This is an admin-only operation.
      if(req.user.role !== "Admin") {
        return res.status(403).json({
          "message": "Unauthorized Access."
        });
      }
      const {userID} = req.params;
      const allOrders = await Order.find({user: userID});

      return res.status(200).json(allOrders);
    } catch(error) {
      console.log(error);
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* Get orders of user. */
  app.get("/orders/all", authenticateToken, async (req, res) => {
    try{
      let allOrders = await Order.find({ user : req.user.id });
      return res.status(200).json(allOrders);
    } catch(error) {
      console.log(error);
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* Get a single order info. */
  app.get("/order/:orderID", authenticateToken, async (req, res) => {
    try{
      const {orderID} = req.params;
      const orderFound = await Order.findOne({ _id: orderID });

      if(orderFound) {
        // Admin can see orders of any person, including himself/herself.
        // Simple users can only access their orders.
        if(req.user.role !== "Admin" && orderFound.user.toString() !== req.user.id) {
          return res.status(403).json({
            "message": "Unauthorized Access."
          });
        }
        return res.status(200).json(orderFound);
      } else {
        return res.status(404).json({
          "message": "No order found."
        });
      }    
    } catch(error) {
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* Add a new order. Admins can NOT add orders for other members. */
  app.post("/order", authenticateToken, async (req, res) => {
    try {
      const newOrder = new Order({ ...req.body });
      newOrder.user = req.user.id;
      const userExists = await User.exists({ _id: req.user.id });
      // Obtain orders only if respective user exists.
      if(userExists) {
        const insertedOrder = await newOrder.save();
        return res.status(201).json(insertedOrder);
      } else {
        return res.status(400).json({
          "message": "No user associated with order."
        });
      }
    } catch(error) {
      console.log(error);
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* Update an *EXISTING* order. Admins CAN update orders of other members. */
  app.put("/order", authenticateToken, async (req, res) => {
    try {
      const id = req.body._id;
      const orderFound = await Order.findOne({ _id: id });
      // If the user is not admin, then no access to other user orders
      // should be allowed.
      if(req.user.role !== "Admin" && orderFound.user.toString() !== req.user.id) {
        return res.status(403).json({
          "message": "Unauthorized Access."
        });
      }

      if(orderFound) {
        const updatedOrder = await Order.findByIdAndUpdate(id, req.body, {"new": true});
        return res.status(201).json(updatedOrder);
      } else {
        return res.status(404).json({
          "message": "No order found."
        });
      }
    } catch(error) {
      console.log(error);
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* Delete an order. */
  app.delete("/order/:orderID", authenticateToken, async (req, res) => {
    try{
      const { orderID } = req.params;
      const orderFound = await Order.findOne({ _id: orderID });

      if(req.user.role !== "Admin" && orderFound.user.toString() !== req.user.id) {
        return res.status(403).json({
          "message": "Unauthorized Access."
        });
      }

      const orderDeleted = await Order.findByIdAndDelete(orderID);
      return res.status(200).json(orderDeleted);
    } catch(error) {
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });
}