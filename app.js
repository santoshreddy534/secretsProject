//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//setting session
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

//passport to initialize passport package
app.use(passport.initialize());
//passport to deal with session
app.use(passport.session());

//mongoose connection to db
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//To remove deprecation warning
mongoose.set("useCreateIndex", true);

// user schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// add plugin passportlocalmongoose to hash and salt password also save users
userSchema.plugin(passportLocalMongoose);

//user model
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//home
app.get("/", (req, res) => {
  res.render("home");
});

//login
app.get("/login", (req, res) => {
  res.render("login");
});

//register user -Get
app.get("/register", (req, res) => {
  res.render("register");
});

//secret page gets checked for authentication
app.get("/secrets", (req, res) => {
  // The below line was added so we can't display the "/secrets" page
  // after we logged out using the "back" button of the browser, which
  // would normally display the browser cache and thus expose the
  // "/secrets" page we want to protect. Code taken from this post.
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0"
  );
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/secrets");
  }
});

//logout
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

//register user -Post
app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});

//login user -Post
app.post("/login", passport.authenticate("local"), function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/secrets");
    }
  });
});
/********app.post("/login", (req, res) => { (Bug)
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});************/

app.listen(3000, (req, res) => {
  console.log("Server running on port 3000");
});
