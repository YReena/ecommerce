const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");

exports.isAuthenticateduser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    const decordedData = jwt.verify(token, "ABCDEFGHTIJHLMINOUTBULANKUN");

    req.user = await User.findById(decordedData.id);

    next();

})

exports.authorizedRoles = (... roles)=>{
    return (req, res, next)=>{
        if(! roles.includes(req.user.role)){
            return next(
            new ErrorHandler(`Role : ${req.user.role} is not allowed to access this resource`, 403)
        )}
        next();
    }
}