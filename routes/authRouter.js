/** Imports */
const express = require("express");
const {
  register,
  login,
  logout,
  getUserInfoFromCookie,
} = require("../controllers/authController");

/************************************************************************ */

const router = express.Router();

/**
 *  Routes
 *  Relative to "/crypto...""
 */

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.get("/user-info", getUserInfoFromCookie);

/** Exports */
module.exports = router;
