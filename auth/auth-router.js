const router = require('express').Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("./auth-model");

router.post('/register', async (req, res) => {
   const {username, password} = req.body;
   if (!username || !password) {
      return res.status(400).json({
         message: "Please provide a username and password."
      });
   }

   const isDupeUser = await authModel.findBy({username});
   if (isDupeUser.length > 0) {
      return res.status(400).json({message: `${username} already exists!`});
   }

   try {
      const newUser = await authModel.add({
         username,
         password
      });
      res.status(201).json(stripPassword(newUser));
   } catch (error) {
      console.error(`Error during registration: ${error.toString()}`)
      return res.status(500).json({
         data: error.toString()
      });
   }
});

router.post('/login', async (req, res) => {
   const INVALID = "Invalid Username or password";
   const {username, password} = req.body;
   if (!username || !password) {
      return res.status(400).json({
         message: "Please provide a username and password."
      });
   }


   try {
      //find the user
      const user = await authModel.findBy({username}).first();
      //validate user found and password
      if (!user || !bcrypt.compareSync(password, user.password)) {
         return res.status(401).json({
            message: INVALID
         });
      }

      res.json({
         token: signToken(user),
         message: `Welcome back ${username}!`
      });
   } catch (error) {
      console.error(error);
      return res.status(500).json({
         data: error.toString()
      });
   }
});

module.exports = router;

function stripPassword (user) {
   return {
      id: user.id,
      username: user.username
   }
}

function signToken (user) {
   const {id} = user;
   const payload = {id};
   const secret = process.env.JWT_SECRET;
   const options = {
      expiresIn: "24h"
   };

   return jwt.sign(payload, secret, options);
}