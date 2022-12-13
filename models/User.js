const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  profilePic: String,

  // kyc uploads:
  uploadFront: String,
  uploadBack: String,

  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  country: {
    type: String,
  },
  phone: {
    type: String,
  },
  balance: {
    type: Number,
    default: 0,
  },
  wallet: {
    type: String,
    default: "",
  },
  profit: {
    type: Number,
    default: 0,
  },
  bonus: {
    type: Number,
    default: 0,
  },
  active_investment: {
    type: Number,
    default: 0,
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
  },
  twoFA: {
    type: Boolean,
    default: false,
  },

  control: {
    type: Boolean,
    default: false,
  },

  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = User = mongoose.model("User", UserSchema);
