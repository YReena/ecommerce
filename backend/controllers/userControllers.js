const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require('../utils/jwtToken');
const sendEmail = require("../utils/sendEmail");
const nodeMailer = require("nodemailer");
const crypto = require("crypto");
const catchAsyncError = require('../middleware/catchAsyncError');
const cloudinary = require('cloudinary');

// Register a User
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    const {name, email, password}= req.body;
    console.log("chitti");
    console.log(req.body.avtar);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avtar, {
      folder: "avtars",
      width: 150,
      crop: "scale",
    });
  

    const user = await User.create({
        name, email, password,
        avtar:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    })
    
    const token = user.getJWTTOKEN();
    const options = {
        expires: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
    
      res.cookie("token", token).json({
        success: true,
        user,
        token,
      });


})

// login
exports.loginUser = catchAsyncErrors(async(req, res, next)=>{

    const {email, password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email & Password", 401));
    }

    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid email or password"));
    }
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password", 401));
    }


    const token = user.getJWTTOKEN();
    const options = {
        expires: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
      console.log(token);
      res.cookie("token", token);
      res.status(201).json({
        success: true,
        user,
        token,
      });


})

// Logout User
exports.logout = catchAsyncErrors(async(req,res,next)=>{
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
    res.status(200).json({
        success: true,
        message:"Logged Out"
      });
})

// forgot Password

exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(! user){
        return next(new ErrorHandler("User not found", 404));
    }

    // get ResetPassword Token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave: false});
    
    // create reset password link
    const resetpasswordUrl = `http://localhost:3000/password/reset/${resetToken}`;
    const message = `Your passsword reset token is : --\n\n ${resetpasswordUrl} \n\n If you have not requested this mail then, please ignore it.`;

    try{
        // await sendEmail({
        //     email: user.email,
        //     subject:`Ecommerce Passsword recovery`,
        //     message ,
        // });

        const transporter = nodeMailer.createTransport({
            host:"smtp.gmail.com",
            port:465,
            server:"gmail",
            auth:{
                user:"yadav1993reena@gmail.com",
                pass:"eqkj clkx uwlk mbuf"
            }
        })
    
        const mailOptions ={
            from:"yadav1993reena@gmail.com",
            to: user.email,
            subject:`Ecommerce Passsword recovery`,
            text:message,
        }
    
         transporter.sendMail(mailOptions,(err) => {
            if (err){
            console.log(err)
                res.json('Opps error occured')
            } else{
                res.json('thanks for e-mailing me');
            }
        });
        res.status(200).json({
            success : true,
            message:`Email send to ${req.email} successfully`,
        })
    }
    catch(err){
        user.resetPasswordToken= undefined;
        user.resetPasswotdExpire = undefined;
    await user.save({validateBeforeSave: false});

    return next(new ErrorHandler(err.message, 500));

    }
});


//reset password

exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
   const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

   const user = await User.findOne({
    resetPasswordToken,
    resetPasswotdExpire : {$gt: Date.now()},
   });

   if(!user){
    return next(new ErrorHandler("Reset token is in valid  or has been expired", 400));
   }

   if(req.body.password !== req.body.confirmPassword){
    return next(new ErrorHandler("Password does not match ", 400));
   }

   user.password = req.body.password;
   user.resetPasswordToken= undefined;
   user.resetPasswotdExpire = undefined;
    await user.save();

    const token = user.getJWTTOKEN();
    const options = {
        expires: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
    
      res.cookie("token", token).json({
        success: true,
        user,
        token,
      });

})

//getuserdetails

exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
  const user=  await User.findById(req.user.id);
  res.status(200).json({
    success:true,
    user,
  })
});

// updatePassword

exports.updatePassword = catchAsyncError(async(req,res,next)=>{
    console.log(req.body);
    const user = await User.findById(req.user.id).select("+password");
     
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHandler("old password is incorrect", 400));
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match with confirmPassword", 400));
    }

    user.password = req.body.newPassword;
    await user.save();
    const token = user.getJWTTOKEN();
    
      res.cookie("token", token).json({
        success: true,
        user,
        token,
      });

});

// updateUserProfile

exports.updateProfile = catchAsyncError(async(req,res,next)=>{
  console.log(req.user.id);
  console.log("update prifile");
    const newUserData= {
        name: req.body.name,
        email: req.body.email
    }
    if (req.body.avtar !== "") {
      const user = await User.findById(req.user.id);
      const imageId = user.avtar.public_id;
  
      await cloudinary.v2.uploader.destroy(imageId);
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avtar, {
        folder: "avtar",
        width: 150,
        crop: "scale",
      });
  
      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true,
        runValidators: true,
    })
    console.log(user);
    res.status(200).json({
        success: true,
    })

});

// get all users
exports.getAllUser = catchAsyncError(async(req,res,next)=>{
 const users = await User.find();
 res.status(200).json({
  success: true,
  users,
})
})

// get indivdual details

exports.getSingleUser = catchAsyncError(async(req,res,next)=>{
  console.log("chitti");
  console.log(req.params.id);
  const user = await User.findById(req.params.id);

  if(! user){
    return next(new ErrorHandler(`User doesn't exists${req.body.id}`, 400)); 
  }
  res.status(200).json({
   success: true,
   user,
 })
 })

 // update user role -- Admin
 exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
  });
});

//delete user profile -- Admin
exports.deleteUser = catchAsyncError(async(req,res,next)=>{
  console.log(req.params.id);
  const user = await User.findById(req.params.id);
  console.log(req.params.id);
  if(!user){
    return next(new ErrorHandler(`User doesn't exists${req.params.id}`, 400)); 
  }
  const imageId = user.avtar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.deleteOne();

  res.status(200).json({
      success: true,
      message:"User deleted Successfully"
  })

});