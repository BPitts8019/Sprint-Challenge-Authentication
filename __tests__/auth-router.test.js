const server = require("../api/server");
const superTest = require("supertest");
const db = require("../database/dbConfig");

beforeEach(async () => {
   await db.migrate.rollback();
   await db.migrate.latest();
});

describe("Auth Endpoints", () => {
   describe("/api/register", () => {
      test("Empty Object", async () => {
         const response = await superTest(server)
            .post("/api/auth/register")
            .send({});

         expect(response.status).toBe(400);
         expect(response.type).toBe("application/json");
         expect(response.body.message).toBe("Please provide a username and password.");
      });
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
      test("No Password", async () => {
         const response = await superTest(server)
            .post("/api/auth/register")
            .send({
               username: "Booris"
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
         expect(response.body).objectContaining({
            id: 1,
            username: "Booris"
         });
         expect(response.body).toHaveProperty("token");
      });
   
   });
});