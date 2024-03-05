const nodeMailer = require("nodemailer");

sendEmail = async(options)=>{
    console.log("reena"+ options);
    const transporter = nodeMailer.createTransport({
        server:"gmail",
        auth:{
            user:"yadav1993reena@gmail.com",
            pass:"eqkj clkx uwlk mbuf"
        }
    })

    const mailOptions ={
        from:"yadav1993reena@gmail.com",
        to: options.email,
        subject:options.subject,
        text:options.message,
    }

     transporter.sendMail(mailOptions,(err) => {
        if (err){
        console.log(err)
            res.json('Opps error occured')
        } else{
            res.json('thanks for e-mailing me');
        }
    });


}

exports.module = sendEmail;