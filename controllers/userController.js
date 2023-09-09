const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const { generateKeyPem } = require("./signing");

const createUser = async (req, res) => {
  const newUUID = uuidv4();
  const newKeyPair = await generateKeyPem();
  console.log(newKeyPair);

  try {
    const result = await User.create({
      email: req.body.email,
      name: req.body.name,
      uuid: newUUID,
      keys: [
        {
          private: newKeyPair.privatePem,
          public: newKeyPair.publicPem,
        },
      ],
    });
    res.send(result);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
};

const getUserById = async (req, res) => {
  try {
    let user = await User.findById(req.params.id).select(
      ` email
        name
        uuid
        keys.public
        createdAt
        updatedAt
        `
    );
    res.send(user);
  } catch (err) {
    console.log("err: ", err);
    res.status(400).send(err);
  }
};

const getUserByUUID = async (req, res) => {
  let uuid = false;
  try {
    uuid = req.params.uuid;
    console.log("uuid: ", uuid);
  } catch (error) {
    res.status(400).send({ succes: false, error });
    return;
  }

  try {
    let user = await User.findOne({ uuid: uuid });
    console.log(user);
    res.send({
      name: user.name,
      email: user.email,
      uuid: user.uuid,
      publicKey: user.keys[0].public,
    });
  } catch (err) {
    console.log("err: ", err);
    res.status(400).send(err);
  }
};

const getCurrentUser = async (req, res) => {
  let uuid = false;
  try {
    uuid = req.user.uuid;
    console.log("uuid: ", uuid);
  } catch (error) {
    res.status(400).send({ succes: false, error });
    return;
  }

  try {
    let user = await User.findOne({ uuid: uuid });
    console.log(user);
    res.send({
      name: user.name,
      email: user.email,
      uuid: user.uuid,
    });
  } catch (err) {
    console.log("err: ", err);
    res.status(400).send(err);
  }
};
// const findById = ()

module.exports = {
  createUser,
  getUserById,
  getUserByUUID,
  getCurrentUser,
};
