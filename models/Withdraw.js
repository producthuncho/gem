const mongoose= require('mongoose');
const Schema = mongoose.Schema;

const WithdrawSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: String,
    wallet: String,

    transaction_type: {
        type: String
    },
    
    // admin set status
    status: {
        type: String,
        default: 'pending...'
    },
    confirmed: {
        type: Boolean,
        default: false
    },

    date: { type: Date, default: Date.now() }
});

module.exports = Withdraw = mongoose.model('Withdraw', WithdrawSchema);