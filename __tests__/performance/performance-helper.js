const generateSignupData = (requestParams, ctx, ee, next) => {
  ctx.vars["name"] = "Test PerformanceUser";
  ctx.vars["email"] = "testperformanceuser@test.com";
  ctx.vars["password"] = "12345";
  ctx.vars["address"] = "Somewhere X";
  ctx.vars["role"] = "Admin";

  return next();
}

const generateLoginData = (requestParams, ctx, ee, next) => {
  ctx.vars["email"] = "testperformanceuser@test.com";
  ctx.vars["password"] = "12345";

  return next();
}

const generateOrderData = (requestParams, ctx, ee, next) => {
  ctx.vars["type"] = "Box1";
  ctx.vars["description"] = "{Test Order - Performance}";

  return next();
}

const generateUpdatedOrderData = (requestParams, ctx, ee, next) => {
  ctx.vars["type"] = "Box1";
  ctx.vars["description"] = "{Test Order - Updated}";

  return next();
}
  
module.exports = {
  generateSignupData,
  generateLoginData,
  generateOrderData,
  generateUpdatedOrderData
};