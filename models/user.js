const mongo = require("mongoose");

const Schema = mongo.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  userType: Number,
  lastseen: Date,
});

module.exports = mongo.model("User", userSchema);
