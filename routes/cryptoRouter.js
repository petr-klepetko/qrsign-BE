/** Imports */
const express = require("express");
const { authMiddleWare } = require("../controllers/auth");
const {
  createSignature,
  getSignatureByUUID,
} = require("../controllers/signatureController");

const {
  generateKeyPair,
  signMessage,
  reSignMessage,
} = require("../controllers/cryptoController");

/************************************************************************ */

const router = express.Router();

router.use(authMiddleWare);

/**
 *  Routes
 *  Relative to "/crypto...""
 */

router.get("/generate-key-pair", generateKeyPair);

router.post("/sign-message", signMessage);

router.post("/sign-message/:uuid", reSignMessage);

router.get("/signature/:id", getSignatureByUUID);

router.post("/signature", createSignature);

/** Exports */
module.exports = router;
