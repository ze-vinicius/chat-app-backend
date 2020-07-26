const mongo = require("mongoose");

const Schema = mongo.Schema;

const messageSchema = new Schema(
  {
    text: String,
    usersId: String,
    usersUsername: String,
  },
  { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } }
);

module.exports = mongo.model("Message", messageSchema);
