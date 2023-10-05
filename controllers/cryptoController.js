const {
  generateKeyPem,
  signMessageB64,
  importPrivateKey,
} = require("../controllers/signing");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/user");
const Signature = require("../models/signature");

/**
 * Functions
 */
const getUser = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (err) {
    return {
      err,
    };
  }
};

const getKeysFromUser = async (id) => {
  const user = await getUser(id);

  if (user?.err) {
    return {
      message: "error while getting the user",
      err: { ...user },
    };
  }

  return user?.keys;
};

const createSignature = async (privateKeyPem, message) => {
  // console.log("message: ", message);
  try {
    const privateKey = await importPrivateKey(privateKeyPem);
    signature = await signMessageB64(privateKey, message);
    return signature;
  } catch (err) {
    console.log("error while signing: ", err);
    return { err };
  }
};

/** Request handlers */

const signMessage = async (req, res) => {
  if (typeof req.body.message === "undefined") {
    res.status(400).send({
      error: "Message is not present",
      reqBody: req.body,
    });
    return;
  }

  if (typeof req.user.uuid === "undefined") {
    res.status(400).send({
      message: "No user ID",
    });
    return;
  }

  const keys = await getKeysFromUser(req.user.id);

  if (typeof keys?.err !== "undefined") {
    res.status(400).send({ ...keys });
    return;
  }

  let signature;
  try {
    signature = await createSignature(keys[0].private, req.body.message);
  } catch (error) {
    res.status(400).send({ ...keys });
    return;
  }

  if (typeof signature.err !== "undefined") {
    res.status(500).send({
      error: "Error while signing the message",
      message: signature.err,
    });
    return;
  }

  const newUUID = uuidv4();

  try {
    const result = await Signature.create({
      value: signature,
      uuid: newUUID,
    });
    res.send({ signatureUUID: result.uuid });
  } catch (err) {
    res.status(400).send(err);
  }

  // res.send({ signature, publicKey: keys?.publicPem });
};

const reSignMessage = async (req, res) => {
  if (typeof req.body.message === "undefined") {
    res.status(400).send({
      error: "Message is not present",
      reqBody: req.body,
    });
    return;
  }

  // console.log("req.params: ", req.params);

  if (typeof req.params.uuid === "undefined") {
    res.status(400).send({
      error: "Signature UUID is not present",
      reqBody: req.body,
    });
    return;
  }

  if (typeof req.user.id === "undefined") {
    res.status(400).send({
      message: "No user ID",
    });
    return;
  }

  const keys = await getKeysFromUser(req.user.id);

  if (typeof keys?.err !== "undefined") {
    res.status(400).send({ ...keys });
    return;
  }

  const signature = await createSignature(keys[0].private, req.body.message);

  if (typeof signature.err !== "undefined") {
    res.status(500).send({
      error: "Error while signing the message",
      message: signature.err,
    });
    return;
  }

  try {
    const result = await Signature.findOneAndUpdate(
      { uuid: req.params.uuid },
      {
        value: signature,
      }
    );
    res.send({ success: true, signatureUUID: result.uuid });
  } catch (err) {
    res.status(400).send({ message: "DB operation failed", err });
  }
};

const generateKeyPair = async (req, res) => {
  const keyPair = await generateKeyPem();
  res.send(keyPair);
};

module.exports = {
  generateKeyPair,
  signMessage,
  reSignMessage,
};
