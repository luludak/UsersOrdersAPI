const axios = require("axios");
const mongoose = require("mongoose");
const {prepare} = require("../setup/test-helper");
require('dotenv').config({ path: '.env' });


describe("Basic Unit Tests.", () => {  
  it("should check system is on", async () => {
    const response = await axios.get(prepare("/"));
    expect(response.status).toEqual(200);
  });

  it("should check env vars is properly loaded", async () => {
    expect(process.env.TEST_FLAG === "true").toEqual(true);
  });
});

/* Included Mocking test as a sample.
*  Consider in case of project extension to test components
*  utilizing them.
*/
describe("Mock Endpoints Demo", () => {

  let axiosMocked = null;

  beforeAll(() => {
    jest.mock('axios');
    axiosMocked = require("axios");
    axiosMocked.get.mockResolvedValue({
      data: {},
      status: 200
    });
    
  });

  it("Check mock endpoints.", async () => {
    const response = await axiosMocked.get(prepare("/users"));
    expect(response.status).toEqual(200);
  });

  afterAll(() => {
    jest.unmock('axios');
  });
});