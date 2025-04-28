const {Sequelize, DataTypes} = require('sequelize') // Format: commonJS module
const databaseConfig = require('../config/dbConfig')
const makeUserTable = require('./userModel')

const sequelize = new Sequelize(databaseConfig.db, databaseConfig.username, databaseConfig.password, { // database name, username bydefault:root, password bydefault: empty string
    host: databaseConfig.host,  // database host 
    port: databaseConfig.port,        // database port bydefault: 3306
    dialect: databaseConfig.dialect,  // database dialect bydefault: mysql
    pool: { 
        max: 5, // Maximum number of connection in pool
        min: 0, // Minimum number of connection in pool
        acquire: 30000, // Maximum time (in milliseconds) that pool will try to get connection before throwing error
        idle: 10000 // Maximum time (in milliseconds) that a connection can be idle before being released
    }
})

sequelize.authenticate() // Authenticate the connection to the database
    .then(() => {
        console.log('Database connection has been established successfully.') // Log a success message if the connection is successful
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err) // Log an error message if the connection fails
    })

    const db = {} // Create an empty object to hold the models
    
    db.Sequelize = Sequelize // Add Sequelize class to the db object  
    db.sequelize = sequelize // Add sequelize  to the db object
     
    // impoting models file
    db.users = makeUserTable(sequelize, DataTypes) // Call the makeUserTable function to create the User model

    db.sequelize.sync({force: false }).then(() => { // Sync the database with the models
        console.log('Synced done!!') // Log a message indicating that the database has been synced
    })
 
module.exports = db // Export the db object so that it can be used in other files





