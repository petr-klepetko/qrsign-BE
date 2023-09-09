const Signature = require("../models/signature");
const { v4: uuidv4 } = require("uuid");

const createSignature = async (req, res) => {
  const newUUID = uuidv4();
  try {
    const result = await Signature.create({
      value: req.body.value,
      uuid: newUUID,
    });
    res.send(result);
  } catch (err) {
    res.status(400).send(err);
  }
};

const getSignatureById = async (req, res) => {
  try {
    let signature = await Signature.findById(req.params.id);
    res.send(signature);
  } catch (err) {
    console.log("err: ", err);
    res.status(400).send(err);
  }
};

const getSignatureByUUID = async (req, res) => {
  try {
    let signature = await Signature.findOne({ uuid: req.params.id });
    res.send(signature);
  } catch (err) {
    console.log("err: ", err);
    res.status(400).send(err);
  }
};

// const updateSignature = async (req, res) => {
//   let signature = false;
//   try {
//     signature = await Signature.findOne({ uuid: req.params.id });
//   } catch (err) {
//     console.log("Error while searching");
//     res.status(400).send(err);
//   }

//   if (!signature) {
//     console.log("no signature");
//     res.status(400).send("signature not found");
//   }

//   try {
//     signature
//   } catch (error) {

//   }
// };

module.exports = {
  createSignature,
  getSignatureById,
  getSignatureByUUID,
};
