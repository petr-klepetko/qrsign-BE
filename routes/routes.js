const express = require("express");
// const router_utils = require("./router_utils");
const { generateUUID } = require("../controllers/utils");

const {
  auth,
  renderIndex,
  parameterTest,
  postTest,
} = require("../controllers/mainController");

const {
  generateKeyPair,
  signMessage,
} = require("../controllers/cryptoController");

const router = express.Router();

// router.use(auth);

router.get("/", renderIndex);

router.get("/neco/:id", parameterTest);

router.get("/utils/generate-uuid", generateUUID);

router.post("/neco/:id", postTest);

router.get("/crypto/generate-key-pair", generateKeyPair);

router.post("/crypto/sign-message", signMessage);

module.exports = router;
