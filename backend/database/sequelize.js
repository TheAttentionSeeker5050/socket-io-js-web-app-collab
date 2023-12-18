// postgressql drivers ----------------------------------------------------

// use the sequelize ORM to connect to the database
const { Sequelize } = require('sequelize');

const CONN_STRING = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

// pass the .env variables to the connection string
if (process.env.NODE_ENV === 'production') {
    // require('dotenv').config();
    CONN_STRING = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?sslmode=require`;
} 

console.log('Connection string: ');
console.log(CONN_STRING);

const sqlConnection = new Sequelize(CONN_STRING,{
    dialect: 'postgres',
    define: {
        timestamps: false
    },
    logging: true,
    // pool: {
    //     max: 5,
    //     min: 0,
    //     idle: 10000
    // }
}) 

// sync the database
async function syncDatabase() {
    try {
        await sqlConnection.sync();
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Unable to sync database:', error);
    }
}


// test the connection function
async function testConnection() {
    try {
        await sqlConnection.authenticate();
        console.log('Connection with the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = {
    sqlConnection,
    testConnection,
    syncDatabase
}
