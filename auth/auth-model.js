const bcrypt = require("bcryptjs");
const db = require("../database/dbConfig");
const users_db = db.bind(db, "users");

const findById = id => {
   return users_db()
      .where({id})
      .first();
};
const findBy = filter => {
   return users_db()
      .where(filter);
};
const add = async newUser => {
   try {
      newUser.password = bcrypt.hashSync(newUser.password, 14);
      console.log(`New password hash: ${newUser.password}`);
   
      const [id] = await users_db().insert(newUser);
      return findById(id);
   } catch (error) {
      return Promise.reject(error);
   }
};

module.exports = {
   add,
   findBy,
   findById
}