const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  country: { type: String },
  modified_date: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = Activity = mongoose.model("Activity", ActivitySchema);
