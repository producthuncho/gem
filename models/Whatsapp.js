const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WhatsappSchema = new Schema({
    whatsapp_number: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

module.exports = Whatsapp = mongoose.model('Whatsapp', WhatsappSchema);