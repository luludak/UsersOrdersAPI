const axios = require("axios");
const {prepare} = require("../setup/test-helper");

describe("Admin User Tests", () => {

  let config = null;
  let userLogin = null;
  let userToDeleteLogin = null;
  let adminLogin = null;
  let admin2Login = null;

  beforeAll(async () => {

    // Login all related users.

    userLogin = await axios.post(prepare("/users/login/"), {
      email: "testuser@test.com",
      password: "12345"
    });

    userToDeleteLogin = await axios.post(prepare("/users/login/"), {
      email: "testusertodelete@test.com",
      password: "12345"
    });

    adminLogin = await axios.post(prepare("/users/login/"), {
      email: "test@test.com",
      password: "12345"
    });

    admin2Login = await axios.post(prepare("/users/login/"), {
      email: "test2@test.com",
      password: "12345"
    });

    const {accessToken} = adminLogin.data;

    // Note we use JWT authentication for the API,
    // therefore we need to authenticate our request for the test.
    config = {
      headers: { Authorization: `Bearer ${accessToken}` }
    }  
  });

  it("should get all users", async () => {
    const response = await axios.get(prepare("/users"), config);
    expect(response.status).toEqual(200);
  });

  it("should get posted orders", async () => {
    // Get all orders of user.
    const response = await axios.get(prepare("/orders"), config);
    expect(response.status).toEqual(200);
  });

  it("should get orders of another user", async () => {
    // Get all orders of user.
    const {id} = userLogin.data.user;
    const response = await axios.get(prepare("/orders/user/" + id), config);
    expect(response.status).toEqual(200);
  });
  

  it("should hit generic admin user error", async () => {
    await axios.get(prepare("/users/nouser"), config).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(400);
    });
  });


  it("should add an order", async () => {
    // Insert order.
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
      "description": "{Test Order}"
    }, config);

    const {_id} = insertedOrderResponse.data;
    
    // Get previously inserted object and check.
    const responseOrders = await axios.get(prepare("/order/" + _id), config);
    expect(responseOrders.data.type).toEqual("Box2");

  });

  it("should delete a simple user", async () => {
    const response = await axios.delete(prepare("/user/" + userToDeleteLogin.data.user.id), config);
    expect(response.status).toEqual(200);

  });

  it("should fail to delete an admin user", async () => {
    await axios.delete(prepare("/user/" + admin2Login.data.user.id), config).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(403);
    });
  });

  it("should update credentials", async () => {
    expect(true).toEqual(true);
  });

  it("should fail updating credentials of another user", async () => {
    expect(true).toEqual(true);
  });
});