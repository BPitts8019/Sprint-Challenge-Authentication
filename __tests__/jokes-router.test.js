const server = require("../api/server");
const superTest = require("supertest");
const users_db = require("../auth/auth-model");

(async () => {
   let user = users_db.findBy({username: "Booris Boons"}).first();
   if (!user) {
      user = await users_db.add({
         username: "Booris Boons",
         password: "pas1234"
      });
   }
})();

describe("Test /api/jokes", () => {
   const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTgwMTc4OTUzLCJleHAiOjE1ODAxODI1NTN9.B4wFPxBYc1I1vg4mQ2Ks1F-3RMBXS4_g37I6mNdoazE";

   test("No Authentication", async () => {
      const {token} = await superTest(server)
         .post("/api/auth/login")
         .send({
            username: "Booris Boons",
            password: "bad#password"
         });

      const response = await superTest(server)
         .post("/api/jokes")
         .set("authorization", token);

      expect(response.status).toBe(401);
      expect(response.type).toBe("application/json");
      expect(response.body.you).toBe("shall not pass!");
   });

   test("Authenticated", async () => {
      const {token} = await superTest(server)
         .post("/api/auth/login")
         .send({
            username: "Booris Boons",
            password: "pas1234"
         });

      const response = await superTest(server)
         .post("/api/jokes")
         .set("authorization", token);

      expect(response.status).toBe(200);
      expect(response.type).toBe("application/json");
   });
});