const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const signatureSchema = new Schema(
  {
    uuid: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

/** Automaticky to k tomu přidá "s" na konec a najde schéma */
const Signature = mongoose.model("Signature", signatureSchema);

module.exports = Signature;
