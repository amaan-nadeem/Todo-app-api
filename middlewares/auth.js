const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../model/UserSchema");
const JWT_SECRET = process.env.JWT_SECRET || config.get("JWT_SECRET");

module.exports = async (req, res, next) => {
  const token = req.header("x-auth-header");

  // checking if the token exists or not
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token authorization denied"
    });
  }

  try {
    // decoding json web token
    const decoded = jwt.verify(token, JWT_SECRET);

    // checking for the user if exists
    const exsitingUser = User.findOne(decoded.user.id);
    if (!exsitingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid Token"
      });
    }

    // creating user request
    req.user = decoded.user;
    next();
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(401).json({
      success: false,
      message: "Token is not valid"
    });
  }
};
