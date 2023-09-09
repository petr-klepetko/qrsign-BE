/** Imports */
const express = require("express");
const { authMiddleWare } = require("../controllers/authController");
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

router.post("/sign-message", signMessage);

router.post("/sign-message/:uuid", reSignMessage);

router.get("/signature/:id", getSignatureByUUID);

/*
 * Not necessary, testing
 */

/* Create signature in db, signature is given in ob*/
router.post("/signature", createSignature);

/** Generate Key pair */
router.get("/generate-key-pair", generateKeyPair);

/** Exports */
module.exports = router;
