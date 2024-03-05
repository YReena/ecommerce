const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required : [true,"Please Enter Your Name"],
        maxLength : [30, "Name  cannort exceed 30 characters"],
        minlength:[4,"Name should have more than 4 characters"]
    },
    email:{
        type : String,
        required : [true,"Please Enter Your Email"],
        unique : true,
        validator: [validator.isEmail,"Please Enter vAlid Email"]
    },
    password :{
        type:String,
        required:[true,"Please Enter Your Password"],
        minlength:[8,"Password should be greater than 8 characters"],
        select : false
    },
    avtar:{
        public_id:{
            type : String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type: String,
        default : "user",
    },
    createdAt:{
        type : Date,
        default : Date.now
    },
    resetPasswordToken: String,
    resetPasswotdExpire : Date,
});


userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);

})

// JWT TOKEN
userSchema.methods.getJWTTOKEN = function(){
    console.log('rtyui');
    return jwt.sign({id: this._id},"ABCDEFGHTIJHLMINOUTBULANKUN");
}

// compare password
userSchema.methods.comparePassword = async function(enteredPassword){
    console.log("reena");
    return  await bcrypt.compare(enteredPassword, this.password);
}
//Generating password reset token
userSchema.methods.getResetPasswordToken = function(){
    //genrating password
    const  resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
     
    this.resetPasswotdExpire = Date.now() + 15*60*1000;
    return resetToken;

}
module.exports = mongoose.model("USER_DATABASE", userSchema);