// backend/src/config/database.js
const mongoose = require('mongoose');

/**
 * @desc Connects to the MongoDB database using Mongoose.
 * The connection URI is retrieved from environment variables.
 * @returns {void}
 * @throws {Error} If the connection fails.
 */
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables. Please check your .env file.');
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;