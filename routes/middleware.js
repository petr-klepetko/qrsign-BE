/** Imports */
const express = require("express");
const { authMiddleWare } = require("../controllers/authController");
const { logReqest } = require("../controllers/utils");

/************************************************************************ */

const middleware = express.Router();

/**
 *  Middleware functions
 */

/** Parse json body */
middleware.use(express.json());

/** Add "user" object to req */
middleware.use(authMiddleWare);

/** Log the request to the console */
middleware.use(logReqest);

/** Exports */
module.exports = middleware;
