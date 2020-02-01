const server = require("../api/server");
const superTest = require("supertest");
const jwt = require("jsonwebtoken");
const db = require("../database/dbConfig");

const APP_JSON = "application/json";
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
   return superTest(server)
      .get("/api/jokes")
      .set("authorization", token);
};

afterAll(async () => {
   console.log("afterAll - outside");
   await db("users").truncate();
});

describe("Test /api/auth/register", () => {
   const GIVE_NAME_PWD = "Please provide a username and password.";

   beforeEach(async () => {
      console.log("beforeEach - inside describe");
      await db.migrate.latest();
      await db("users").truncate();
   });

   test("No Username", async () => {
      const response = await register_user({
         password: TEST_USER.password
      });
      expect(response.status).toBe(status.BAD_REQ);
      expect(response.type).toBe(APP_JSON);
      expect(response.body.message).toBe(GIVE_NAME_PWD);
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

// describe("Test /api/auth/login", () => {
//    const MSG_INVALID = "Invalid Username or password";

//    beforeAll(async () => {
//       await register_user(TEST_USER);
//    });

//    test("Bad Password", async () => {
//       const login_res = await login_user({
//          username: TEST_USER.username,
//          password: "bad#password"
//       });
//       expect(login_res.status).toBe(status.UNAUTHENTICATED);
//       expect(login_res.type).toBe(APP_JSON);
//       expect(login_res.body.message).toBe(MSG_INVALID);
//    });
//    test("Good Data", async () => {
//       const login_res = await login_user(TEST_USER);
//       expect(login_res.status).toBe(status.OK);
//       expect(login_res.type).toBe(APP_JSON);
//       expect(login_res.body.message).toBe(`Welcome back ${TEST_USER.username}!`);

//       const isValidToken = new Promise((resolve, reject) => {
//          jwt.verify(
//             login_res.body.token, 
//             process.env.JWT_SECRET, 
//             (error, payload) => {
//                if (error) {
//                   resolve(false);
//                } else {
//                   resolve(true);
//                }
//             }
//          );
//       });
//       return expect(isValidToken).resolves.toBe(true);
//    });
// });

// describe("Test /api/jokes", () => {
//    const AUTH_HEADER = "";
//    const APP_JSON = "application/json";
//    const MSG_NOT_PASS = "shall not pass!";

//    beforeAll(async (args) => {
//       console.log(args);
//       await register_user(TEST_USER);
//    });

//    test("No Authentication", async () => {
//          const res = await get_jokes();
//          expect(res.status).toBe(status.UNAUTHENTICATED);
//          expect(res.type).toBe(APP_JSON);
//          expect(res.body.you).toBe(MSG_NOT_PASS);
//    });

//    test("Not Authenticated - Bad Token", async () => {
//       const BAD_TOKEN = "this-is-a-bad-token";

//       const res = await get_jokes(BAD_TOKEN);
//       expect(res.status).toBe(status.UNAUTHENTICATED);
//       expect(res.type).toBe(APP_JSON);
//       expect(res.body.you).toBe(MSG_NOT_PASS);
//    });

//    test("Authenticated", async () => {
//       //login with good credentials
//       const login_res = login_user(TEST_USER);
//       expect(login_res.status).toBe(status.OK);

//       //test jokes endpoint
//       const jokes_res = await get_jokes(login_res.body.token)
//       expect(jokes_res.status).toBe(status.OK);
//       expect(jokes_res.type).toBe(APP_JSON);
//       expect(jokes_res.body.length).toBeGreaterThanOrEqual(0);
//    });
// });