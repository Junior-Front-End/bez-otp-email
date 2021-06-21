const sendOTPEmail = require('./otp');
var jwt = require("jsonwebtoken");
const models = require("../models"); 
const User = models.user;
const Role = models.role;

// --------------------------------------
//              otp
// -------------------------------------- 
var rand; 

exports.form_otp_email = (req,res) => {

  var email = req.query.email;

  rand = sendOTPEmail(email);

  // part 2  
  if(req.cookies['Content-Type'] != undefined){
    var message = req.cookies['Content-Type'].message || null; 
  }else{
    var message =  null; 
  }

  res.render('index',{
    pageTitle:"OTP Email",
    message: message, 
    email: email,
    pageID:'otpemail'
  }) // render

} 

exports.verify_otp_email = (req,res) =>  {
  // --------------------------------------------
  //              options
  // --------------------------------------------
  // refuse after 90 sec 
  // enable resend after 90 sec
  // JWT not in .env file (instead in process) 
  // --------------------------------------------

  if(
    req.body.num1 == rand.num1 &&
    req.body.num2 == rand.num2 &&
    req.body.num3 == rand.num3 &&
    req.body.num4 == rand.num4 
    ) { 

      User.findOne({email: req.body.email}).exec((err, user) => {

        if (err) { res.status(500).send({ message: err }); return; }
    
        if (user) { 
           // already registered?
           signin(req,res) 
        } else { 
          // not registered?
          signup(req,res) 
        } 
        
      });
      
      
    } else { 
      res.cookie('Content-Type', {message: 'password-is-not-true'})
      res.redirect('/form_otp_email?email=' + req.body.email);
    }
  
}
// --------------------------------------
//              signup
// --------------------------------------
const signup = (req,res) => {

  // part 1
  const user = new User({
    firstname: '',
      lastname: '',
      birthDate: 20210101,
      country: '',
      city: '',
      mobile: '',
      username: '',
      email: req.body.email
  });

  // part 2
  Role.findOne({title: 'user'}, (err, role) => {

    if (err) { res.status(500).send({ message: err }); return; }

    user.role = role._id 

    user.save( err => { 

      if (err) { res.status(500).send({ message: err }); return; } 

      generateToken(user.id, res);
      res.redirect('/dashboard'); 

    }); // user.save

  }); // Role.findOne


}
// --------------------------------------
//              signin
// --------------------------------------
const signin = (req, res) => { 
  
  User.findOne({email: req.body.email})
  .populate("role", "-__v")
  .exec((err,user) => execution(err, user));
  
  
  function execution(err, user){ 

    if (err) {res.status(500).send({ message: err }); return ; }
    
    generateToken(user.id, res);
    res.redirect('/profile')

  } // execution

};

const generateToken = (id,res) => {

  //  token 
  var token = jwt.sign(
    {id: id},
    process.env.JWT_SECRET,
    {expiresIn: 1000*60*60*24}
    );

  // options
  let options = {
     sameSite:true, 
     maxAge:1000*60*60*24, 
     httpOnly: true, 
  }

  // 3 cookie
  res.cookie('x-access-token',token, options) 

}
// --------------------------------------
//              home
// --------------------------------------   
exports.home = (req,res) => {

  let token = req.cookies["x-access-token"] || false; 

  if (!token){return Views('home');}

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err){return Views('home');}
    Views('homeAuth');
  });

  // Views
  function Views(pageID) {
    return res.render('index',{
      pageTitle: 'خانه',
      pageID: pageID}
      );
  }

}
// --------------------------------------
//              dashboard
// --------------------------------------   
exports.dashboard = (req,res) => { 

  let token = req.cookies["x-access-token"] || false;

  if (!token){return res.redirect('/login-register')}
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err){ return res.redirect('/login-register');}
    FindUser(decoded.id)
  });

  // FindUser
  function FindUser(userID){ 

    User.findById(userID).exec((err, user) => { 

      if(err){Err(err);return;}

      Role.findById(user.role).exec((err, role) => { 

        if(err){Err(err);return;}  

        switch (role.title) {
          case 'admin': Views('dashboard-admin'); break; 
          case 'moderator': Views('dashboard-mod'); break;  
          case 'user': Views('dashboard-user'); break; 
        }

        // Views
        function Views(pageID) {
          return res.render('index',{
            pageTitle: 'داشبورد', 
            pageID: pageID}
            );
        } 

        // Err
        function Err(err) { res.status(500).send({ message: err }); }

      }); // Role 

    }); // User

  } // FindUser

}
// --------------------------------------
//              profile
// --------------------------------------   
exports.profile = (req,res) => {

  let token = req.cookies["x-access-token"] || false;

  if (!token){return res.redirect('/login')}

  jwt.verify(
    token, 
    process.env.JWT_SECRET,
    (err, decoded) => {

    if (err){ return res.redirect('/login');}

    User.findById(decoded.id).exec((err, user) => { 

      if(err){ Err(err); return; }

      res.render('index',{   
        data: user,
        pageID: 'profile',
        pageTitle: 'profile'
      })  

    }); // User

  }); // jwt

}
// --------------------------------------
//              signout
// --------------------------------------   
exports.signout = (req,res) => { 
  res.cookie('Content-Type', '')
  res.cookie('x-access-token', '')
  res.redirect('/login-register')
}
// --------------------------------------
//              login_register
// --------------------------------------   
exports.login_register = (req, res) => {
  
  let message = null;
  if(req.cookies["Content-Type"]){
    message = req.cookies["Content-Type"].message || null;
    res.cookie('Content-Type', '')
  }
  
  res.render('index',{
    pageTitle: 'ورود /ثبت نام', 
    message: message, 
    pageID: 'login-register'
  });

} 
