const router = require('express').Router();
const authModel = require("./auth-model");

router.post('/register', async (req, res) => {
   const {username, password} = req.body;
   if (!username || !password) {
      return res.status(400).json({
         message: "Please provide a username and password."
      });
   }

   try {
      const newUser = await authModel.add({
         username,
         password
      });
      res.status(201).json(stripPassword(newUser));
   } catch (error) {
      return res.status(500).json({
         data: error.toString()
      });
   }
});

router.post('/login', (req, res) => {
  // implement login
});

module.exports = router;

function stripPassword (user) {
   return {
      id: user.id,
      username: user.username
   }
}