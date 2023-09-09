const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema(
  {
    uuid: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

/** Automaticky to k tomu přidá "s" na konec a najde schéma */
const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
