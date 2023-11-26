require('dotenv').config();
//const  { Component, useEffect, useState } = require("react");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const cors = require("cors");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

console.log(process.env.API_KEY);
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Our Secret.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-sakib:pdcladmin@cluster0.x55l3gi.mongodb.net/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
    username: String,
    specility: String,
    degree: String,
    email: String,
    mobile:String,
    password: String
});
const doctorSchema = new mongoose.Schema ({
  username: String,
  specility: String,
  degree: String,
  email: String,
  mobile:String
});
userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);
const Doctor = new mongoose.model("Doctor", doctorSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());



app.get("/", function(req, res){
    res.render("home");
});
app.get("/login", function(req, res){
    res.render("login");
});
app.get("/register", function(req, res){
    res.render("register");
});
app.get("/secrets", function(req, res){
    if (req.isAuthenticated()){
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
});
app.get("/adddoctors", function(req, res){
  res.render("adddoctors");
})
app.get("/viewdoctors", async function(req, res){
  Doctor.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Doctor.insertMany(Doctor);
      res.redirect("/");
    }else {
      res.render("viewdoctors", { newDoctor: foundItems});
    }
   
  });
  
  
   
    
  
  
});
app.get("/logout", function(req, res){
    
    res.redirect("/");
});

app.post("/register", function(req, res){
    User.register({username: req.body.username, specility: req.body.specility, degree: req.body.degree, email: req.body.email, mobile: req.body.mobile}, req.body.password, function(err, user){
      
      if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
          });
        }
      });
    
});
app.post("/login", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
      });
    
      req.login(user, function(err){
        if (err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req, res, function(){

            const sessUser = { username: user.username, email: user.email };
            req.session.user = sessUser;
            res.redirect("/secrets");
          });
        }
      });
});
app.post("/adddoctors", function(req, res){
  const doctor = new Doctor({
        
    username: req.body.username,
    specility: req.body.specility,
    degree: req.body.degree,
    email: req.body.email,
    mobile: req.body.mobile
  });
  
  

    doctor.save();
    res.redirect("/adddoctors");
  
  
});

app.listen(3010, function() {
    console.log("Server Started on port 3010");
});
