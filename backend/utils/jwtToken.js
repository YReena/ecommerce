// Create Token and saving in cookie
const user  = require("../models/userModel");

const sendToken = (user, statusCode, res) => {
    console.log(user);
    const token = user.getJWTToken();
    console.log(token);
    // options for cookie
    const options = {
      expires: new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
  
    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });
  };
  
  module.exports = sendToken;