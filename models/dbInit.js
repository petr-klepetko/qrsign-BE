const mongoose = require("mongoose");

const dbInit = () => {
  /** Connect to monogdob */
  const dbURI = process.env.DB_URL;
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
