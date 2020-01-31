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
const APP_JSON = "application/json";
const TEST_USER = {
   username: "Booris Boons",
   password: "pas1234"
};

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

beforeEach(async () => {
   await db.migrate.latest()
   await db("users").truncate();
});

describe("Test /api/auth/register", () => {
   const MSG_GIVE_NAME_PWD = "Please provide a username and password.";
   
   test("No Username", async () => {
      const response = await register_user({
         password: TEST_USER.password
      });
      expect(response.status).toBe(status.BAD_REQ);
      expect(response.type).toBe(APP_JSON);
      expect(response.body.message).toBe(MSG_GIVE_NAME_PWD);
   });

   test("Good Data", async () => {
      const response = await register_user(TEST_USER);
      expect(response.status).toBe(status.CREATED);
      expect(response.type).toBe(APP_JSON);
      expect(response.body).toEqual({
         id: 1,
         username: TEST_USER.username
      });
   });
});

describe("Test /api/auth/login", () => {
   const MSG_INVALID = "Invalid Username or password";

   test("Bad Password", async () => {
      const regiser_res = await register_user(TEST_USER);
      expect(regiser_res.status).toBe(status.CREATED);

      const login_res = await login_user({
         username: TEST_USER.username,
         password: "bad#password"
      });
      expect(login_res.status).toBe(status.UNAUTHENTICATED);
      expect(login_res.type).toBe(APP_JSON);
      expect(login_res.body.message).toBe(MSG_INVALID);
   });
   test("Good Data", async () => {
      const regiser_res = await register_user(TEST_USER);
      expect(regiser_res.status).toBe(status.CREATED);

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
      await expect(isValidToken).resolves.toBeTruthy();
   });
});