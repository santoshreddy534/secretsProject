//jshint esversion:6
require("dotenv").config();
const express = require('express')
const ejs = require('ejs');
const mongoose =require('mongoose')
const app = express();
const encrypt = require('mongoose-encryption')

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))

//mongoose connection to db
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// user schema
const userSchema = new mongoose.Schema ({
    email: String,
    password: String
})


//adding ecryption package to the userSchema
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

//user model
const User = new mongoose.model('User', userSchema);

//home
app.get('/', (req, res)=>{
    res.render('home')
});

//login
app.get("/login", (req, res) => {
  res.render("login");
});

//register user -Get
app.get("/register", (req, res) => {
  res.render("register");
});

//register user -Post
app.post('/register', (req, res)=>{
    const email = req.body.username;
    const password = req.body.password;
    const newUser = new User({
        email: email,
        password: password
    })
    newUser.save((err)=>{       ///password get encrypted on save
        if(!err){
            res.render('secrets')
        }else{
            res.send(err);
        }
    })
})

//login user -Post
app.post('/login',(req, res)=>{
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}, (err, foundUser)=>{ //On find password get decrypted to match password
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                if(foundUser.password === password)
                res.render("secrets")
            }
        }
    })
})

app.listen(3000, (req, res)=>{
    console.log('Server running on port 3000');
})