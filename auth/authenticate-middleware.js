/* 
complete the middleware code to check if the user is logged in
before granting access to the next middleware/route handler
*/

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
   const {authorization} = req.headers;
   const NO_PASS = () => {
      return res.status(401).json({ 
         you: 'shall not pass!'
      });
   }

   if (!authorization) {
      return NO_PASS();
   }

   //Is user authenticated?
   jwt.verify(
      authorization, 
      process.env.JWT_SECRET, 
      (error, payload) => {
         if (error) {
            return NO_PASS();
         }

         req.tokenPayload = payload;
         next();
      }
   );
};
