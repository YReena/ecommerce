const ErrorHandler = require("../utils/errorHandler");

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";


    // wrong mongodb id error
    if(err.name === 'CastError'){
        const message = `Resource not found. Invalid : ${err.path}`
    }

    res.status(err.statusCode).json({
        succes : false,
        message:err.message
    });
}
