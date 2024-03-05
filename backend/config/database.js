const mongoose = require('mongoose');

const Url = 'mongodb+srv://reena_123:Reena%40123@cluster0.4aylb5q.mongodb.net/schooldatabase?retryWrites=true&w=majority';

mongoose.connect(Url)
.then(()=>{console.log("connection is created")})
.catch((error)=>{
 console.log(error)
})

