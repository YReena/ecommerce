const app = require("./app");
const dotenv= require("dotenv");
const path = require("../backend/config/config.env");
const cloudinary = require("cloudinary");

dotenv.config({app:'backend/config/config.env'});


// handling uncaught error
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.messgae}`)
    console.log(`Shutting down the server due to unhandled Promise Rejection`);
    process.exit(1);
})


require('../backend/config/database');

  const PORT = 4000;
app.listen(PORT, ()=>{
    console.log(`server is running on ${PORT}`)
})