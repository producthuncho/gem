const mongoose = require("mongoose");

let mongoURI;

if (process.env.NODE_ENV === "production") {
<<<<<<< HEAD
    require('dotenv').config();
    mongoURI = process.env.DB_URL
} else {
    require('dotenv').config();
    mongoURI = process.env.DB_URL;
=======
    mongoURI =
        "mongodb+srv://Producthuncho:Delphine6718@cluster0.8o6e3pc.mongodb.net/?retryWrites=true&w=majority";
} else {
    mongoURI = "mongodb+srv://Producthuncho:Delphine6718@cluster0.8o6e3pc.mongodb.net/?retryWrites=true&w=majority";
>>>>>>> 77b44267b7ef3f5cc0b702bd24f894b97b27bb8a
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