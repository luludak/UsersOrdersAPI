
const axios = require("axios");
const mongoose = require("mongoose");
const { User } = require("../../models/user");
const { Order } = require("../../models/order");
require('dotenv').config({ path: '.env' });

describe("Database Tests.", () => {
  beforeAll(async () => {
    await mongoose.connect(
      process.env.DB_ENDPOINT
    );
  });

  it("should check DB connection was successful", async () => {
    const state = mongoose.STATES[mongoose.connection.readyState];
    expect(state).toEqual("connected"); 
  });

  it("Add User", async () => {
    const user = await new User({
      "name": "User New",
      "role": "User",
      "email": "testuserfordb1@test.com",
      "password": "12345",
      "address": "Somewhere 10"
    }).save();

    const userFound = User.findOne({ _id: user._id });
    expect(userFound).not.toEqual(null);
  });

  it("Update User", async () => {
    const user = await new User({
      "name": "User New",
      "role": "User",
      "email": "testuserfordb2@test.com",
      "password": "12345",
      "address": "Somewhere 10"
    }).save();

    const userFound = await User.findByIdAndUpdate(user._id, {"role": "Admin"}, {"new": true});
    expect(userFound.role).toEqual("Admin");
  });

  it("Delete User", async () => {

    const user = await new User({
      "name": "User New",
      "role": "User",
      "email": "testuserfordb3@test.com",
      "password": "12345",
      "address": "Somewhere 10"
    }).save();

    await User.deleteOne({_id: user._id});
    
    const userFound = await User.findOne({ _id: user._id });
    expect(userFound).toEqual(null);
  });

  it("Add Order", async () => {
    const order = await new Order({
      "type": "Box1",
      "description": "{Test Order}"
    }).save();

    const orderFound = Order.findOne({ _id: order._id });
    expect(orderFound).not.toEqual(null);
  });

  it("Update Order", async () => {
    const order = await new Order({
      "type": "Box1",
      "description": "{Test Order}"
    }).save();

    const orderFound = await Order.findByIdAndUpdate(order._id, {"type": "Box2"}, {"new": true});
    expect(orderFound.type).toEqual("Box2");
  });

  it("Delete Order", async () => {
    const order = await new Order({
      "type": "Box1",
      "description": "{Test Order}"
    }).save();

    await Order.deleteOne({_id: order._id});

    const orderFound = await Order.findOne({ _id: order._id });
    expect(orderFound).toEqual(null);
  });


  afterAll(async () => {
    await mongoose.connection.close();
  });
  
});