const mongoose = require("mongoose");

let mongoURI;

if (process.env.NODE_ENV === "production") {
    mongoURI =
        "mongodb+srv://Producthuncho:Delphine6718@cluster0.8o6e3pc.mongodb.net/?retryWrites=true&w=majority";
} else {
    mongoURI = "mongodb+srv://Producthuncho:Delphine6718@cluster0.8o6e3pc.mongodb.net/?retryWrites=true&w=majority";
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