const app = require("./app");
const dotenv= require("dotenv");
const path = require("../backend/config/config.env");
const cloudinary = require('cloudinary');

dotenv.config({app:'backend/config/config.env'});


// handling uncaught error
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.messgae}`)
    console.log(`Shutting down the server due to unhandled Promise Rejection`);
    process.exit(1);
})
cloudinary.config({
  cloud_name: "drputjjgj",
  api_key: "193181991474174",
  api_secret: "vBwyL4zxAElrn-buiLHTkuY0C7k",
});

require('../backend/config/database');

  const PORT = 4000;
app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT}`)
})