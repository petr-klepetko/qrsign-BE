/** Imports */
const express = require("express");
const {
  createUser,
  getUserById,
  getUserByUUID,
  getCurrentUser,
} = require("../controllers/userController");

/************************************************************************ */

const router = express.Router();

/**
 *  Routes
 *  Relative to "/users..."
 */

router.post("/create", createUser);

router.get("/get-current", getCurrentUser);

router.get("/by-uuid/:uuid", getUserByUUID);

router.get("/:id", getUserById);

/** Exports */
module.exports = router;
