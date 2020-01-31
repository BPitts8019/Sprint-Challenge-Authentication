const server = require("../api/server");
const superTest = require("supertest");
const db = require("../database/dbConfig");

const url = {
   LOGIN: "/api/auth/login",
   JOKES: "/api/jokes"
}
const status = {
   OK: 200,
   CREATED: 201,
   BAD_REQ: 400,
   UNAUTHENTICATED: 401,
   FORBIDDEN: 403
};
const AUTH_HEADER = "authorization";
const APP_JSON = "application/json";
const MSG_NOT_PASS = "shall not pass!";
const TEST_USER = {
   username: "Booris Boons",
   password: "pas1234"
};

const register_user = (userData) => {
   return superTest(server)
      .post("/api/auth/register")
      .send(userData);
}

beforeEach(async () => {
   await db.migrate.latest()
   await db("users").truncate();
});

describe("Test /api/jokes", () => {
   test("No Authentication", async () => {
      const regiser_res = await register_user(TEST_USER);
      expect(regiser_res.status).toBe(status.CREATED);

      const response = await superTest(server)
         .get(url.JOKES);
      expect(response.status).toBe(status.UNAUTHENTICATED);
      expect(response.type).toBe(APP_JSON);
      expect(response.body.you).toBe(MSG_NOT_PASS);
   });

   test("Not Authenticated - Bad Token", async () => {
      const BAD_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkJvb3JpcyBCb29ucyIsImV4dHJhLWRhdGEiOiJCQUQgVE9LRU4ifQ.xKIbtXlnD0udPtVcFPCuzALltQjrFFYlaL5jSRlziHk";

      const regiser_res = await register_user(TEST_USER);
      expect(regiser_res.status).toBe(status.CREATED);

      const res = await superTest(server)
         .get(url.JOKES)
         .set(AUTH_HEADER, BAD_TOKEN);
      expect(res.status).toBe(status.UNAUTHENTICATED);
      expect(res.type).toBe(APP_JSON);
      expect(res.body.you).toBe(MSG_NOT_PASS);
   });

   test("Authenticated", async () => {
      const regiser_res = await register_user(TEST_USER);
      expect(regiser_res.status).toBe(status.CREATED);

      //login with good credentials
      const login_res = await superTest(server)
         .post(url.LOGIN)
         .send(TEST_USER);
      expect(login_res.status).toBe(status.OK);
      expect(login_res.body.token).toBeTruthy();

      //test jokes endpoint
      const jokes_res = await superTest(server)
         .get(url.JOKES)
         .set(AUTH_HEADER, login_res.body.token);
      expect(jokes_res.status).toBe(status.OK);
      expect(jokes_res.type).toBe(APP_JSON);
      expect(jokes_res.body.length).toBeGreaterThanOrEqual(0);
   });
});