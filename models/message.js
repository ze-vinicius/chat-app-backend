const mongo = require("mongoose");

const Schema = mongo.Schema;

const messageSchema = new Schema({
  text: String,
  date: String,
  time: String,
  usersId: String,
});

module.exports = mongo.model("Message", messageSchema);
