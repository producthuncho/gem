const mongoose = require("mongoose");

let mongoURI;

if (process.env.NODE_ENV === "production") {
    require('dotenv').config();
    mongoURI = process.env.DB_URL
} else {
    require('dotenv').config();
    mongoURI = process.env.DB_URL;
}

module.exports = async function() {
    mongoose.Promise = global.Promise;

    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        console.log("Connected to database: " + mongoURI);
    } catch (error) {
        console.log("Error connnecting to DB: " + error);
    }
};