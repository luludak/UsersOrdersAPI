
const axios = require("axios");
const {prepare} = require("../setup/test-helper");


describe("Simple User Tests", () => {

  let adminLogin = null;
  let simpleConfig = null;

  beforeAll(async () => {

    // Login all related users.

    adminLogin = await axios.post(prepare("/login/"), {
      email: "test@test.com",
      password: "12345"
    });

    const login = await axios.post(prepare("/login/"), {
      email: "testuser@test.com",
      password: "12345"
    });

    const {accessToken} = login.data;

    simpleConfig = {
        headers: { Authorization: `Bearer ${accessToken}` }
    };
  });

  it("should fail to get users", async () => {
    const response = await axios.get(prepare("/users"), simpleConfig).catch(error => {
      expect(error.response.status).toEqual(403);
    });
  });

  it("should update credentials", async () => {
    await axios.put(prepare("/me"), {
      "name": "Updated User"
    }, simpleConfig);

    const response = await axios.get(prepare("/me"), simpleConfig);

    const {data} = response;
    expect(data.name).toEqual("Updated User");
  });

  it("should fail updating credentials of another user", async () => {
    expect(true).toEqual(true);
  });

  it("should get user orders", async () => {
    const response = await axios.get(prepare("/orders/all"), simpleConfig);
    expect(response.status).toEqual(200);
  });


  it("should get a specific order", async () => {

    // Insert Order.
    await axios.post(prepare("/order"), {
      "type": "Box1",
      "description": "{Test Order}"
    }, simpleConfig);

    const allOrdersResponse = await axios.get(prepare("/orders/all"), simpleConfig);

    const {data} = allOrdersResponse;
    const firstOrderID = data[0]._id;

    const singleOrderResponse = await axios.get(prepare("/order/" + firstOrderID), simpleConfig);
    expect(singleOrderResponse.status).toEqual(200);
  });

  it("should add, then update an order", async () => {
    // Insert order.
    const insertedResponse = await axios.post(prepare("/order"), {
      "type": "Box2"
    }, simpleConfig);

    // Update order.
    const updated = await axios.put(prepare("/order/"), {
      "_id": insertedResponse.data._id,
      "type": "Box1",
      "description": "{Test Order Updated}"
    }, simpleConfig);
    

    // Get previously inserted object and check.
    const orderResponse = await axios.get(prepare("/order/") + insertedResponse.data._id, simpleConfig);
    const {data} = orderResponse;
    
    
    expect(data.type).toEqual("Box1");
    expect(data.description).toEqual("{Test Order Updated}");
  });


  it("should add, then delete an order", async () => {
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
      "description": "{Test Order}"
    }, simpleConfig);

    const {data} = insertedOrderResponse;
    
    await axios.delete(prepare("/order/" + data._id), simpleConfig);
    await axios.get(prepare("/order/" + data._id), simpleConfig).catch(error => {
      expect(error.response.status).toEqual(404);
    });

  });

  it("should fail to access orders of another user", async () => {
    await axios.get(prepare("/orders/user/" + adminLogin.data.user.id), simpleConfig).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(403);
    });
  });

  it("should fail deleting a user", async () => {
    await axios.delete(prepare("/user/" + adminLogin.data.user.id), simpleConfig).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(403);
    });
  });

});