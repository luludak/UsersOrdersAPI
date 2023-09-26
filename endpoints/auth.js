require('dotenv').config();

var jwt = require("jsonwebtoken");

const user = require("../models/user");
const User = user.User;

/* Auth User module. */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null){
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.API_SECRET, (error, user) => {
    
    if (error) {
      console.log(error)
      return res.status(403).send({"message": "Unauthorized access."});
    }

    User.findOne({_id: user.id}).then(userFound => {
      // If the token does not belong to an existing user,
      // then block access.
      if (!userFound) {
        return res.status(403).send({"message": "Unauthorized access."});
      }
      user.role = userFound.role;
      req.user = user;
      next();
    });
  });
}

module.exports = {
  authenticateToken: authenticateToken
};
