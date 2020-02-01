const server = require("../api/server");
const superTest = require("supertest");
const jwt = require("jsonwebtoken");
const db = require("../database/dbConfig");

const status = {
   OK: 200,
   CREATED: 201,
   BAD_REQ: 400,
   UNAUTHENTICATED: 401,
   FORBIDDEN: 403
};
const TEST_USER = {
   username: "Booris Boons",
   password: "pas1234"
};
const APP_JSON = "application/json";
const GIVE_NAME_PWD = "Please provide a username and password.";

const register_user = (userData) => {
   return superTest(server)
      .post("/api/auth/register")
      .send(userData);
}
const login_user = (userData) => {
   return superTest(server)
      .post("/api/auth/login")
      .send(userData);
};
const get_jokes = (token) => {
   if (!token) {
      return superTest(server)
         .get("/api/jokes");
   }

   return superTest(server)
      .get("/api/jokes")
      .set("authorization", token);
};



beforeAll(async () => {
   await db("users").truncate();
});

describe("Test /api/auth/register", () => {
   test("Status Code 400 when no username is provided", async () => {
      const response = await register_user({
         password: "No Username"
      });
      expect(response.status).toBe(status.BAD_REQ);
      expect(response.type).toBe(APP_JSON);
      expect(response.body.message).toBe(GIVE_NAME_PWD);
   });

   test("Status Code 400 when no password is provided", async () => {
      const response = await register_user({
         username: "No Password"
      });
      expect(response.status).toBe(status.BAD_REQ);
      expect(response.type).toBe(APP_JSON);
      expect(response.body.message).toBe(GIVE_NAME_PWD);
   });

   test("Status Code 201 with good data", async () => {
      const response = await register_user(TEST_USER);
      expect(response.status).toBe(status.CREATED);
      expect(response.type).toBe(APP_JSON);
      expect(response.body).toEqual({
         id: 1,
         username: TEST_USER.username
      });
   });

   test("Status Code 400 when user already exists", async () => {
      const response = await register_user(TEST_USER);
      expect(response.status).toBe(status.BAD_REQ);
      expect(response.type).toBe(APP_JSON);
      expect(response.body.message).toBe(`${TEST_USER.username} already exists!`);
   });
});

describe("Test /api/auth/login", () => {
   test("Returns status code 400 when no username is provided", async () => {
      const response = await login_user({
         password: "No Username"
      });
      expect(response.status).toBe(status.BAD_REQ);
      expect(response.type).toBe(APP_JSON);
      expect(response.body.message).toBe(GIVE_NAME_PWD);
   });

   test("Returns status code 400 when no password is provided", async () => {
      const response = await login_user({
         username: "No Password"
      });
      expect(response.status).toBe(status.BAD_REQ);
      expect(response.type).toBe(APP_JSON);
      expect(response.body.message).toBe(GIVE_NAME_PWD);
   });

   test("Returns status code 401 when password is wrong", async () => {
      const login_res = await login_user({
         ...TEST_USER,
         password: "bad#password"
      });
      expect(login_res.status).toBe(status.UNAUTHENTICATED);
      expect(login_res.type).toBe(APP_JSON);
      expect(login_res.body.message).toBe("Invalid Username or password");
   });

   test("Returns status Code 200 and a valid token when credentials are good", async () => {
      const login_res = await login_user(TEST_USER);
      expect(login_res.status).toBe(status.OK);
      expect(login_res.type).toBe(APP_JSON);
      expect(login_res.body.message).toBe(`Welcome back ${TEST_USER.username}!`);

      const isValidToken = new Promise((resolve, reject) => {
         jwt.verify(
            login_res.body.token, 
            process.env.JWT_SECRET, 
            (error, payload) => {
               if (error) {
                  resolve(false);
               } else {
                  resolve(true);
               }
            }
         );
      });
      await expect(isValidToken).resolves.toBe(true);
   });
});

describe("Test /api/jokes", () => {
   const MSG_NOT_PASS = "shall not pass!";

   test("Returns status code 401 when no auth token is provided", async () => {
         const res = await get_jokes();
         expect(res.status).toBe(status.UNAUTHENTICATED);
         expect(res.type).toBe(APP_JSON);
         expect(res.body.you).toBe(MSG_NOT_PASS);
   });

   test("Returns status code 401 when auth token is invalid", async () => {
      const BAD_TOKEN = "this-is-a-bad-token";

      const res = await get_jokes(BAD_TOKEN);
      expect(res.status).toBe(status.UNAUTHENTICATED);
      expect(res.type).toBe(APP_JSON);
      expect(res.body.you).toBe(MSG_NOT_PASS);
   });

   test("Returns status code 200 when auth token is valid", async () => {
      //login with good credentials
      const login_res = await login_user(TEST_USER);
      expect(login_res.status).toBe(status.OK);

      //test jokes endpoint
      const jokes_res = await get_jokes(login_res.body.token)
      expect(jokes_res.status).toBe(status.OK);
      expect(jokes_res.type).toBe(APP_JSON);
      expect(jokes_res.body.length).toBeGreaterThanOrEqual(0);
   });
});