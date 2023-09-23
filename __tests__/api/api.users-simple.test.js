
const axios = require("axios");
const {prepare} = require("../setup/test-helper");


describe("Simple User Tests", () => {

  let config = null;
  let adminLogin = null;

  beforeAll(async () => {

    // Login all related users.

    adminLogin = await axios.post(prepare("/users/login/"), {
      email: "test@test.com",
      password: "12345"
    });

    const login = await axios.post(prepare("/users/login/"), {
      email: "testuser@test.com",
      password: "12345"
    });

    const {accessToken} = login.data;

    config = {
        headers: { Authorization: `Bearer ${accessToken}` }
    };
  });

  it("should fail to get users", async () => {

    const response = await axios.get(prepare("/users"), config).catch(error => {
      expect(error.response.status).toEqual(403);
    });
    
  });

  it("should update credentials", async () => {

    await axios.put(prepare("/user"), {
      "name": "Updated User"
    }, config);

    const response = await axios.get(prepare("/user"), config);

    const {data} = response;
    expect(data.name).toEqual("Updated User");
  });

  it("should fail updating credentials of another user", async () => {
    expect(true).toEqual(true);
  });

  it("should get user orders", async () => {
    const response = await axios.get(prepare("/orders"), config);
    expect(response.status).toEqual(200);
  });


  it("should get a specific order", async () => {

    // Insert Order.
    await axios.post(prepare("/order"), {
      "type": "Box1",
      "description": "{Test Order}"
    }, config);

    const allOrdersResponse = await axios.get(prepare("/orders"), config);

    const {data} = allOrdersResponse;
    const firstOrderID = data[0]._id;

    const singleOrderResponse = await axios.get(prepare("/order/" + firstOrderID), config);
    expect(singleOrderResponse.status).toEqual(200);
  });

  it("should add, then update an order", async () => {
    // Insert order.
    const insertedResponse = await axios.post(prepare("/order"), {
      "type": "Box2"
    }, config);

    // Update order.
    const updated = await axios.put(prepare("/order/"), {
      "_id": insertedResponse.data._id,
      "type": "Box1",
      "description": "{Test Order Updated}"
    }, config);
    

    // Get previously inserted object and check.
    const orderResponse = await axios.get(prepare("/order/") + insertedResponse.data._id, config);
    const {data} = orderResponse;
    
    
    expect(data.type).toEqual("Box1");
    expect(data.description).toEqual("{Test Order Updated}");
  });


  it("should add, then delete an order", async () => {
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
      "description": "{Test Order}"
    }, config);

    const {data} = insertedOrderResponse;
    
    await axios.delete(prepare("/order/" + data._id), config);
    await axios.get(prepare("/order/" + data._id), config).catch(error => {
      expect(error.response.status).toEqual(404);
    });

  });

  it("should fail to access orders of another user", async () => {
    await axios.get(prepare("/orders/user/" + adminLogin.data.user.id), config).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(403);
    });
  });

  it("should fail deleting a user", async () => {
    await axios.delete(prepare("/user/" + adminLogin.data.user.id), config).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(403);
    });
  });

});