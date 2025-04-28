const databaseConfig = {
      host: process.env.HOST,
      username: process.env.DB_USERNAME,
      password: process.env.PASSWORD,
      db: process.env.DB,
      port: 3306,
      dialect: 'mysql'
    }
    
    module.exports = databaseConfig // Export the databaseConfig object so that it can be used in other files