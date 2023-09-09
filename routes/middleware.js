/** Imports */
const express = require("express");
const { authMiddleWare, logRequest } = require("../controllers/authController");

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
middleware.use(logRequest);

/** Exports */
module.exports = middleware;
