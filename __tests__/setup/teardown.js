const mongoose = require("mongoose");
const { User } = require("../../models/user");
const { Order } = require("../../models/order");

require('dotenv').config({ path: '.env' });

module.exports = async () => {

  // Contrary to setup, for demonstration purposes,
  // we use Mongoose to cleanup the DB.
  await mongoose.connect(
    process.env.DB_ENDPOINT
  );

  await User.deleteMany({email: /^test/}).catch(e => {
    console.log(e)
  });
  await Order.deleteMany({description: /\{Test\sOrder/});

  await mongoose.connection.close(); 
}