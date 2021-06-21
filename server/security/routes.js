const co = require("./controllers");
const Router = require('express').Router(); 


// public
Router.get(["/","/home"], co.home);

// notAuth  
Router.get('/login-register', co.login_register);

//  dashboard 
Router.get("/dashboard", co.dashboard);
Router.get("/profile", co.profile);
Router.get("/signout", co.signout);

// otp
Router.get('/form_otp_email', co.form_otp_email) 
Router.post('/api/otp-email', co.verify_otp_email) 

// exports
module.exports = Router;