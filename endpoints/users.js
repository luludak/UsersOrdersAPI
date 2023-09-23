var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

require('dotenv').config();

const user = require("../models/user");
const User = user.User;

const order = require("../models/order");
const Order = order.Order;

const {authenticateToken} = require("./auth");

module.exports = (app) => {

  /****** User Authentication Tasks. ******/

  /* Register a new user */
  app.post("/users/register", async (req, res) => {
  try {
    // TODO: Check if it can be removed.
    // If email is in bad form, return 400.
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      return res.status(400).json({
          "message": "Email is in bad form."
      });
    }
    // If user exists (email), prevent insertion.
    const userExists = await User.exists({ email: req.body.email });
    if(!userExists) {
      let data = { ...req.body };
      data.password = bcrypt.hashSync(req.body.password, 8);
      const newUser = new User(data);  
      const insertedUser = await newUser.save();
      return res.status(201).json(insertedUser);
    } else {
      return res.status(409).json({
          "message": "User Exists."
      });
    }
  } catch(error) {
    console.log(error);
    return res.status(400).json({
    "message": "Bad Request."
    });
  }
  });

  /* Authenticate a user. */
  app.post("/users/login", async (req, res) => {
    try{
      User.findOne({ email: req.body.email }).exec((error, user) => {
        if (error) {
          res.status(500).send({
            message: err
          });
          return;
        }
        if (!user) {
          return res.status(404).send({
            message: "User Not found."
          });
        }

        //Compare passwords.
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );
        // Checking if password was valid and send response accordingly.
        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
          });
        }
        //signing token with user id (utilizing API secret).
        var token = jwt.sign({
          id: user.id
        }, process.env.API_SECRET, {
          expiresIn: 86400
        });

        // Responding to client request with user profile success message.
        res.status(200)
          .send({
            user: {
              id: user._id,
              email: user.email,
              role: user.role,
              name: user.name,
            },
            message: "Login successfull",
            accessToken: token,
          });
      });
    } catch(error) {
      console.log(error);
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* ADMINISTRATOR TASKS. */
  app.get("/users", authenticateToken, async (req, res) => {
    try{
      // This is an admin-only operation.
      if(req.user.role !== "Admin") {
        return res.status(403).json({
          "message": "Unauthorized Access."
        });
      }

      const allUsers = await User.find();
      return res.status(200).json(allUsers);
    } catch(error) {
      console.log(error);
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* Get information of any user. */
  app.get("/users/:userID", authenticateToken, async (req, res) => {
    try{
      // This is an admin-only operation.
      if(req.user.role !== "Admin") {
        return res.status(403).json({
          "message": "Unauthorized Access."
        });
      }
      const { userID } = req.params;
      const userFound = await User.findOne({ user: userID });
      return res.status(200).json(userFound);
    } catch(error) {
      console.log(error);
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* Delete a user. */
  app.delete("/user/:userID", authenticateToken, async (req, res) => {
    try{
      // This is an admin-only operation.
      if(req.user.role !== "Admin") {
        return res.status(403).json({
            "message": "Unauthorized Access."
        });
      }
      const { userID } = req.params;
      const userFound = await User.findOne({ _id: userID });
      if(userFound.role === "Admin") {
        return res.status(403).json({
            "message": "Unauthorized Access - Admins can not delete admins."
        });
      }

      const userDeleted = await User.findByIdAndDelete(userID);
      return res.status(200).json(userDeleted);
    } catch(error) {
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* USER TASKS */

  /* Get information of self user. */
  app.get("/user", authenticateToken, async (req, res) => {
    try {
      const userFound = await User.findOne({ _id: req.user.id });
      return res.status(200).json(userFound);
    } catch(error) {
      console.log(error);
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* Update information of self user. */
  app.put("/user", authenticateToken, async (req, res) => {
    try {
      const userFound = await User.findOne({ _id: req.user.id });
      if(userFound) {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {"new": true});
        return res.status(201).json(updatedUser);
      } else {
        return res.status(400).json({
            "message": "No user found."
        });
      }
    } catch(error) {
      console.log(error);
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });

  /* Get information of a user. */
  app.get("/users/:userID", authenticateToken, async (req, res) => {
    try{

      // This is an admin-only operation.
      if(req.user.role !== "Admin") {
        return res.status(403).json({
          "message": "Unauthorized Access."
        });
      }

      const { userID } = req.params;
      const userFound = await User.findOne({ user: userID });
      return res.status(200).json(userFound);
    } catch(error) {
      console.log(error);
      return res.status(400).json({
        "message": "Bad Request."
      });
    }
  });   
};