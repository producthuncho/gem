const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    name: String,
    email: String,
    subject: String,
    phone: String,
    message: String,

    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = Message = mongoose.model('Message', MessageSchema);