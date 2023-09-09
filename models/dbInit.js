const mongoose = require("mongoose");

// require("dotenv").config();

const dbInit = () => {
  /** Connect to monogdob */
  const dbURI = process.env.DB_URL;
  // "mongodb+srv://petrklepetko:Ahoj123@cluster0.zzivd0t.mongodb.net/node-tuts?retryWrites=true&w=majority";
  mongoose
    .connect(dbURI)
    .then((result) => {
      console.log("connected to db");
    })
    .catch((err) => {
      console.log("err: ", err);
    });
};

module.exports = {
  dbInit,
};
