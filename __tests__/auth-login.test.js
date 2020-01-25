const server = require("../api/server");
const superTest = require("supertest");
const db = require("../database/dbConfig");
const user_db = require("../auth/auth-model");

beforeEach(async () => {
   await db.migrate.rollback();
   await db.migrate.latest();
   await user_db.add({
      username: "Booris",
      password: "pass1234"
   });
});

describe("Test /api/auth/login", () => {
   test("Empty Object", async () => {
      const response = await superTest(server)
         .post("/api/auth/Login")
         .send({});

      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
      expect(response.body.message).toBe("Please provide a username and password.");
   });
   test("No Username", async () => {
      const response = await superTest(server)
         .post("/api/auth/login")
         .send({
            password: "pass1234"
         });

      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
      expect(response.body.message).toBe("Please provide a username and password.");
   });
   test("No Password", async () => {
      const response = await superTest(server)
         .post("/api/auth/login")
         .send({
            username: "Booris"
         });

      expect(response.status).toBe(400);
      expect(response.type).toBe("application/json");
      expect(response.body.message).toBe("Please provide a username and password.");
   });
   test("Good Data", async () => {
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