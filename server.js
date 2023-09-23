const mongoose = require("mongoose");
const express = require("express");

require('dotenv').config();

const app = express();
app.use(express.json());

require('./endpoints/users')(app);
require('./endpoints/orders')(app);

app.get("/", async (req, res) => {
  try{
    return res.status(200).json({"message": "OK"});
  } catch(err) {
    console.log(err);
    return res.status(400).json({
      "message": "Bad Request."
    });
  } 
});

const start = async () => {
  try {
    await mongoose.connect(
      process.env.DB_ENDPOINT
    );
    app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}.`));
  } catch (error) {
    await mongoose.connection.close();
    console.error(error);
    process.exit(1);
  }
};

start();