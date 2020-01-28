const server = require("../api/server");
const superTest = require("supertest");
const db = require("../database/dbConfig");
const users_db = require("../auth/auth-model");

afterEach(async () => {
   await db("users").truncate();
});

describe("Test /api/auth/register", () => {
   test("No Username", async () => {
      const response = await superTest(server)
         .post("/api/auth/register")
         .send({
            password: "pass1234"
         });

      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
      expect(response.body.message).toBe("Please provide a username and password.");
   });

   test("Good Data", async () => {
      const response = await superTest(server)
         .post("/api/auth/register")
         .send({
            username: "Booris",
            password: "pass1234"
         });

      expect(response.status).toBe(201);
      expect(response.type).toBe("application/json");
      expect(response.body).toEqual({
         id: 1,
         username: "Booris"
      });
   });
});

describe("Test /api/auth/login", () => {
   const INVALID = "Invalid Username or password";

   test("Bad Password", async () => {
      const rtnUser = await users_db.add({
         username: "Booris",
         password: "pass1234"
      });
      console.log(`Created User: ${JSON.stringify(rtnUser)}`);

      const response = await superTest(server)
         .post("/api/auth/login")
         .send({
            username: "Booris",
            password: "bad#password"
         });

      expect(response.status).toBe(403);
      expect(response.type).toBe("application/json");
      expect(response.body.message).toBe(INVALID);
   });
   test("Good Data", async () => {
      const rtnUser = await users_db.add({
         username: "Booris",
         password: "pass1234"
      });
      console.log(`Created User: ${JSON.stringify(rtnUser)}`);

      const response = await superTest(server)
         .post("/api/auth/login")
         .send({
            username: "Booris",
            password: "pass1234"
         });

      expect(response.status).toBe(200);
      expect(response.type).toBe("application/json");
      expect(response.body).toMatch({
         token: expect.stringContaining("$2a$14$"),
         message: "Welcome back Booris!"
      });
   });
});