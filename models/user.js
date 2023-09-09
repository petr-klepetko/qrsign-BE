const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const keys = new Schema({
  public: {
    type: String,
    required: true,
    unique: true,
  },
  private: {
    type: String,
    required: true,
    unique: true,
  },
});

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    keys: [keys],
  },
  { timestamps: true }
);

/** Automaticky to k tomu přidá "s" na konec a najde schéma */
const User = mongoose.model("User", userSchema);

module.exports = User;
