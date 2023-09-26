const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const { generateKeyPem } = require("./signing");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Session = require("../models/session");

const authMiddleWare = async (req, res, next) => {
  const accessTokenCookie = req.cookies.accessToken;

  let claims;
  try {
    claims = jwt.verify(accessTokenCookie, process.env.JWT_SECRET);
  } catch (err) {
    try {
      console.log("Access token is not OK, trying refreshToken");
      const refreshTokenCookie = req.cookies.refreshToken;
      claims = jwt.verify(refreshTokenCookie, process.env.JWT_SECRET);
      console.log("Refresh token successfully parsed, email: ", claims.email);

      const session = await Session.findOne({ uuid: claims.sessionID });

      const treshold = 1000 * 60 * 5;

      const isValid = Date.now() - Date.parse(session.createdAt) <= treshold;
      console.log("session isValid: ", isValid);

      if (isValid) {
        const { _id, email, name, uuid, publicKey, ...userInfo } = claims;
        const accessToken = jwt.sign(
          { _id, email, name, uuid, publicKey },
          process.env.JWT_SECRET
        );
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
          maxAge: 1000 * 60,
        });
      } else {
        claims = null;
      }
    } catch (error) {
      // console.log("error: ", error);

      console.log("error while parsing cookie, continuing as anonymous");

      req.user = {
        id: null,
        name: null,
        anonymous: true,
      };
      next();
      return;
    }
  }

  if (!claims) {
    req.user = {
      id: null,
      name: null,
      anonymous: true,
    };
    next();
  }

  try {
    req.user = await User.findOne({ uuid: claims.uuid });
    req.user.anonymous = false;
  } catch (err) {
    console.log("User from cookie not found");
    next();
  }

  console.log(`Successfully authenticated as user ${req.user.email}`);
  // console.log("req.user: ", req.user);
  next();
};

const register = async (req, res) => {
  const newUUID = uuidv4();
  const newKeyPair = await generateKeyPem();
  const salt = await bcrypt.genSalt(10);

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const result = await User.create({
      email: req.body.email,
      name: req.body.name,
      uuid: newUUID,
      password: hashedPassword,
      keys: [
        {
          private: newKeyPair.privatePem,
          public: newKeyPair.publicPem,
        },
      ],
    });

    const { password, ...data } = result.toJSON();
    res.send(data);
  } catch (err) {
    res.status(400).send(err);
  }
};

const login = async (req, res) => {
  let user;

  if (typeof req.body.email === "undefined") {
    res.status(404).send({ message: "No email found" });
    return;
  }

  if (typeof req.body.password === "undefined") {
    res.status(404).send({ message: "No password found" });
    return;
  }

  try {
    user = await User.findOne({ email: req.body.email });
    if (typeof user.name === "undefined") {
      res.status(404).send({ message: "User was not found" });
      return;
    }
  } catch (err) {
    res.status(404).send({ message: "User was not found", err });
    return;
  }

  const correctPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!correctPassword) {
    res.status(404).send({ message: "Wrong password" });
    return;
  }

  const { email, name, uuid, keys, ...userInfo } = user.toJSON();

  const accessToken = jwt.sign(
    { _id: user._id, email, name, uuid, publicKey: keys[0].public },
    process.env.JWT_SECRET
  );

  const session = await Session.create({ email, uuid: uuidv4() });

  const refreshTokenPayload = {
    _id: user._id,
    email,
    name,
    uuid,
    sessionID: session.uuid,
  };

  const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_SECRET);

  console.log("refreshTokenPayload: ", refreshTokenPayload);
  console.log("refreshToken: ", refreshToken);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 1000 * 60,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 1000 * 60 * 5,
  });

  res.send({
    message: "success",
  });
};

const logout = async (req, res) => {
  res.cookie("accessToken", "", { maxAge: 0 });
  res.cookie("refreshToken", "", { maxAge: 0 });
  res.send({ message: "success" });
};

const getUserInfoFromCookie = (req, res) => {
  let = accessTokenCookie = false;
  try {
    accessTokenCookie = req.cookies.accessToken;
  } catch (error) {
    console.log("Couldn't get the access token cookie.");
  }

  if (!accessTokenCookie) {
    res.send({
      anonymous: true,
    });
    return;
  }

  try {
    const claims = jwt.verify(accessTokenCookie, process.env.JWT_SECRET);
    const { _id, iat, publicKey, ...data } = claims;
    data.anonymous = false;
    res.send(data);
  } catch (error) {
    console.log("Error while getting the user info");
    res.status(400).send(error);
  }
};

const logRequest = async (req, res, next) => {
  console.log("req.url: ", req.url);
  next();
};

module.exports = {
  register,
  login,
  logout,
  getUserInfoFromCookie,
  authMiddleWare,
  logRequest,
};
