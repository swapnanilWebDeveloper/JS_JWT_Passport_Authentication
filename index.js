require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8080;
const Schema = mongoose.Schema;
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

mongoose.connect("mongodb://127.0.0.1:27017/NewDB");

const userSchema = new Schema({
  username: { type: String, unique: true },
  password: { type: Number },
  name: { type: String },
});

const User = mongoose.model("User", userSchema);

server = express();
const path = require("path");
server.use(express.static(path.join(__dirname, "/Program_2/index.js")));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 },
  })
);

server.use(passport.initialize());
server.use(passport.session());

passport.use(
  new LocalStrategy(async function (username, password, done) {
    console.log(username, password);

    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (!user.password === password) {
        return done(null, false, { message: "Incorrect password" });
      }
      console.log(user);
      return done(null, user);
    } catch (err) {
      done("You have done Something wrong : " + err);
    }
  })
);

passport.serializeUser(function (user, done) {
    if(user){

        return done(null, user.id);
    }
    return done(null, false);
});

passport.deserializeUser( async function (id, done) {
  
        try{
            const user =  User.findById(id);
            if(!user){
                return done(null, false);
            }
            return done(null, user);
        }
        catch(err){
            done("You are doing wrong things : "+err);
        }
     }
);

server.get("/test", async(req, res) => {
  req.session.test ? req.session.test++ : (req.session.test = 1);
  const user = await req.user;
  res.send(req.session.test.toString()+" "+user.username);
});

server.post(
  "/login/password",
  passport.authenticate("local", {
    failureRedirect: "/test",
    failureMessage: true,
  }),
  function (req, res) {
    res.json(req.user);
  }
);

server.listen(PORT, () => {
  console.log("server has been started at : ", PORT);
});
