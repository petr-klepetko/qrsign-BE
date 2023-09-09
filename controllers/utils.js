const { v4: uuidv4 } = require("uuid");

const generateUUID = (req, res) => {
  res.json(uuidv4());
};

const logReqest = async (req, res, next) => {
  console.log("req.url: ", req.url);
  next();
};

module.exports = {
  generateUUID,
  logReqest,
};
