
const axios = require("axios");
const {prepare} = require("../setup/test-helper");

describe("Generic User Tests", () => {

  let adminLogin = null;
  let genericConfig = null;

  beforeAll(async () => {
    // Login admin user.

    adminLogin = await axios.post(prepare("/login"), {
      email: "test@test.com",
      password: "12345"
    });

    const {accessToken} = adminLogin.data;

    // Note we use JWT authentication for the API,
    // therefore we need to authenticate our request for the test.
    genericConfig = {
      headers: { Authorization: `Bearer ${accessToken}` }
    } 
  });

  it("should check system is on", async () => {
    const response = await axios.get(prepare("/"));
    expect(response.status).toEqual(200);
  });


  it("should login user", async () => {
    const userLogin = await axios.post(prepare("/login"), {
      email: "testuser@test.com",
      password: "12345"
    });

    const {accessToken} = userLogin.data;
    expect(userLogin.status).toEqual(200);
    expect(accessToken).not.toEqual(undefined);
  });


  it("should fail to login user (wrong password)", async () => {
    await axios.post(prepare("/login"), {
      email: "testuser@test.com",
      password: "1234567"
    }).catch((error) => {
      const {response} = error;
      const {accessToken} = response.data;
      expect(response.status).toEqual(401);
      expect(accessToken).toEqual(null);
    });
    
  });

  it("should hit random endpoint", async () => {
    await axios.get(prepare("/randomurl/something")).catch(error => {
      // 401 - Unauthorized Access
      expect(error.response.status).toEqual(404);
    });
  });

  it("should fail unauthorized access actions", async () => {

    await axios.get(prepare("/users")).catch(error => {
      // 401 - Unauthorized Access
      expect(error.response.status).toEqual(401);
    });
  
    await axios.get(prepare("/orders/all")).catch(error => {
      // 401 - Unauthorized Access
      expect(error.response.status).toEqual(401);
    });
  
    await axios.get(prepare("/orders/user/" + adminLogin.data.user.id)).catch(error => {
      // 401 - Unauthorized Access
      expect(error.response.status).toEqual(401);
    });

    await axios.post(prepare("/order"), {
      "type": "Box2",
      "description": "{Test Order}"
    }).catch(error => {
      // 401 - Unauthorized Access
      expect(error.response.status).toEqual(401);
    });

    await axios.put(prepare("/order"), {
      "type": "Box1",
      "description": "{Test Order}"
    }).catch(error => {
      // 401 - Unauthorized Access
      expect(error.response.status).toEqual(401);
    });

    await axios.delete(prepare("/order/12345"), {
      "type": "Box2",
      "description": "{Test Order}"
    }).catch(error => {
      // 401 - Unauthorized Access
      expect(error.response.status).toEqual(401);
    });

    await axios.put(prepare("/me"), {
      "name": "ShouldNotUpdate"
    }).catch(error => {
      // 401 - Unauthorized Access
      expect(error.response.status).toEqual(401);
    });

    await axios.delete(prepare("/user/12345"), {
      "type": "Box2",
      "description": "{Test Order}"
    }).catch(error => {
      // 401 - Unauthorized Access
      expect(error.response.status).toEqual(401);
    });
    
  });

  it("should register user", async () => {
    const response = await axios.post(prepare("/register"), {
      "name": "User New",
      "role": "User",
      "email": "testusernew@test.com",
      "password": "12345",
      "address": "Somewhere 10"
    });
    expect(response.status).toEqual(201);
  });

  it("should fail to register user (existing email)", async () => {

    
    const response = await axios.post(prepare("/register"), {
      "name": "User New",
      "role": "User",
      "email": "testuserbrandnew@test.com",
      "password": "12345",
      "address": "Somewhere 10"
    });

    expect(response.status).toEqual(201);

    await axios.post(prepare("/register"), {
      "name": "User New",
      "role": "User",
      "email": "testuserbrandnew@test.com",
      "password": "12345",
      "address": "Somewhere 10"
    }).catch(error => {
      // Conflict - user exists.
      expect(error.response.status).toEqual(409);
    });

    
  });

  it("should fail to register user (malformed email)", async () => {
    await axios.post(prepare("/register"), {
      "name": "User New",
      "role": "User",
      "email": "testuseranothernew",
      "password": "12345",
      "address": "Somewhere 10"
    }).catch(error => {
      expect(error.response.status).toEqual(400);
    });
  });

  it("should fail to register user (no password)", async () => {
    await axios.post(prepare("/register"), {
      "name": "User New",
      "role": "User",
      "email": "testuseranothernew2@test.com",
      "address": "Somewhere 10"
    }).catch(error => {
      expect(error.response.status).toEqual(400);
    });
  });

  it("should fail to register user (no name)", async () => {
    await axios.post(prepare("/register"), {
      "role": "User",
      "email": "testuseranothernew3@test.com",
      "password": "12345",
      "address": "Somewhere 10"
    }).catch(error => {
      expect(error.response.status).toEqual(400);
    });
  });

  it("should fail to register user (no address)", async () => {
    await axios.post(prepare("/register"), {
      "name": "User New",
      "role": "User",
      "email": "testuseranothernew4@test.com",
      "password": "12345",
    }).catch(error => {
      expect(error.response.status).toEqual(400);
    });
  });

  it("should block access by valid auth token of non-existing user", async () => {
    await axios.post(prepare("/register"), {
      "name": "UserToDeleteNow",
      "role": "User",
      "email": "testtodeletenow@test.com",
      "password": "12345",
      "address": "Somewhere 10"
    });

    userToDeleteNow = await axios.post(prepare("/login/"), {
      email: "testtodeletenow@test.com",
      password: "12345"
    });

    const {accessToken} = userToDeleteNow.data
    userToDeletegenericConfig = {
      headers: { Authorization: `Bearer ${accessToken}` }
    }

    await axios.delete(prepare("/user/" + userToDeleteNow.data.user.id), genericConfig);

    // Attempt to get orders of deleted user, while access token still valid.
    await axios.get(prepare("/orders/all"), userToDeletegenericConfig).catch(error => {
      // Unauthorized.
      expect(error.response.status).toEqual(403);
    });
  
  });

});