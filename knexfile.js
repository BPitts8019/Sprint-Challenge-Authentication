module.exports = {
   development: {
      client: 'sqlite3',
      connection: { filename: './database/auth.db3' },
      useNullAsDefault: true,
      migrations: {
         directory: './database/migrations',
         tableName: 'dbmigrations',
      },
      seeds: { directory: './database/seeds' },
   },
   test: {
      client: 'sqlite3',
      connection: { filename: './database/test.db3' },
      useNullAsDefault: true,
      migrations: {
         directory: './database/migrations',
         tableName: 'dbmigrations',
      },
      seeds: { directory: './database/seeds' },
      pool: {
         min: 2,
         max: 10
      }
   },
};
