require('dotenv').config({ path: '.env' });

module.exports = {
  prepare: (endpoint) => {
    return `${process.env.BASE_URL}:${process.env.PORT}${process.env.URL_POSTFIX}${endpoint}`;
  }
};