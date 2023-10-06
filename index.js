/**
 * Imports
 */
/** Utils */
const express = require("express");
const { authMiddleWare } = require("./controllers/authController");
const middleware = require("./routes/middleware");
const cors = require("cors");
const cookieParser = require("cookie-parser");

/** Files */
const usersRouter = require("./routes/usersRouter");
const cryptoRouter = require("./routes/cryptoRouter");
const authRouter = require("./routes/authRouter");
const { dbInit } = require("./models/dbInit");

/** Constants */
require("dotenv").config();
const PORT = process.env.PORT;
const URL = process.env.URL;

/**
 * App start
 */
const app = express();

const onListenStart = () => {
  console.log(`Listening on ${URL}${PORT}`);
  dbInit();
};

app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: `${process.env.FE_URL}${process.env.FE_PORT}`,
  })
);
app.listen(PORT.substring(1), onListenStart);

/**
 * Middleware before the routes
 */
app.use(middleware);

/**
 * Routes
 */
app.use("/crypto", cryptoRouter);

app.use("/users", usersRouter);

app.use("/auth", authRouter);

/**
 * Middleware after the routes
 */
app.use((req, res) => {
  res.status(404);
  res.json({
    status: "error",
    message: "no route caught the url",
    url: req.url,
  });
});
