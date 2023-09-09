const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Session = require("../models/session");

const authMiddleWare = async (req, res, next) => {
  const AccessTokenCookie = req.cookies.accessToken;

  let claims;
  try {
    claims = jwt.verify(AccessTokenCookie, process.env.JWT_SECRET);
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
      //TODO až bude auth, tak tady se to bude ve skutečnosti nullovat
      req.user = {
        id: null,
        name: null,
        anonymous: true,
      };

      // Ale teď nastavuju defaultního usera
      // try {
      //   req.user = await User.findOne({
      //     uuid: "036ee0a2-807c-4d71-aca0-55a5edfab8a2",
      //   });
      //   req.user.anonymous = false;
      // } catch (err) {
      //   console.log("User from cookie not found");
      //   next();
      // }
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

module.exports = {
  authMiddleWare,
};
