const userSchema = require("../../model/userSchema");
const categorySchema=require('../../model/categorySchema')
const bcrypt = require("bcrypt");

const sendOTP = require("../../services/emailSender");
const generateotp = require("../../services/otpgenerator");

const passport = require('passport')
const auth = require('../../services/passport')



const signup = (req, res) => {
  try {
    if (req.session.user) {
      res.render("user/Landingpage");
    } else {
      res.render("user/signup", {
        title: "Please Signup",
        user: req.session.user,
      });
    }
  } catch (error) {
    console.log(`error while renderin the page ${error}`);
  }
};

const signupPost = async (req, res) => {
  console.log(req.body)

  try {
    const details = {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      confirmpassword: await bcrypt.hash(req.body.confirmpassword, 10),
      phone: req.body.phone,

    };

    const check = await userSchema.findOne({ email: details.email });

    if (check) {
      res.render("user/signup");
    } else {
     const otp= generateotp()
      sendOTP(details.email,otp);
      req.session.otp = otp;
      req.session.otpTime = Date.now();
      req.session.email = details.email;
      req.session.name = details.name;
      req.session.phone = details.phone;
      req.session.password = details.password;
      console.log(`Submitted OTP: ${req.body.otp}`);
      console.log(`Session OTP: ${req.session.otp}`);
      res.redirect("/otp");
    }
  } catch (error) {
    console.log(`error while renderin the page ${error}`);
  }


};


const otp=(req,res)=>{
  try{
   res.render('user/otp',{title:'OTP Verified',email: req.session.email,  otpTime: req.session.otpTime,}) 
  }catch(error){
    console.log('error');
  }
}



//------------------------------------ verify the otp -------------------------------

const otppost=async(req,res)=>{
  // console.log("entered post");
  try{
    console.log("entered try");
    if(req.body.otp===req.session.otp){
      console.log("entered 1st if");
      const details = {
        name: req.session.name,
        email: req.session.email,
        password: await bcrypt.hash(req.session.password, 10),
        phone: req.session.phone,
      };
    await userSchema.insertMany([details])
    .then(()=>{
      console.log(`new user registeres successfully`)
      res.redirect('/login')
    }).catch((error)=>{
      console.log(`error while user signup ${error}`)
    })
    console.log("entered await");
    }else{
      res.redirect('/otp')
    }
 
  }catch (error) {
    console.log(`error while renderin the page ${error}`);
  }

}


//-------------------------------------- Otp Resent ---------------------------------

const otpResend=(req,res)=>{

  try{
const email=req.session.email
const otp=generateotp()
sendOTP(email,otp)
req.session.otp=otp
req.session.otpTime=Date.now()
console.log("OTP sent succesfully");
res.redirect('/otp')
  }catch(error){
    console.log(`error while resend otp ${error}`)
  }
}


// GET login page
const login = async(req, res) => {
  const categories=await categorySchema.find({isDeleted:false})

  if (req.session.user) {
         
    res.render('user/Landingpage',{categories}); // Redirect if the user is already logged in
  } else {
    res.render('user/login', { title: 'Login', user: req.session.user });
  }
};

// POST login form handler
const loginpost = async (req, res) => {
  try {
    console.log('loginpost');
    console.log(req.body);

    const { email, password } = req.body;

    // Find user by email
    const user = await userSchema.findOne({ email });
    const categories=await categorySchema.find({isDeleted:false})



    

    if (!user) {
      // If user is not found, redirect to login with an error flag
      return res.redirect('/login?error=userNotFound');
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      console.log("user.isBlocked",user.isBlocked) ;
      // If the user is blocked, redirect to login with the blocked error flag
      return res.redirect('/login?error=blocked');
    }

    req.session.user=user

    // // Check if password matches (assuming bcrypt is used for hashing passwords)
    // const isMatch = await bcrypt.compare(password, user.password); 
    // if (!isMatch) {
    //   // If password does not match, redirect to login with invalid password error
    //   return res.redirect('/login?error=invalidPassword');
    // }

    // // Set session for the logged-in user
    // req.session.user = user;
    console.log('User found and session set:', req.session.user);
    

    // Redirect to the landing page after successful login
    res.render('user/LandingPage',{categories,user});
  } catch (error) {
    console.log(`Error during login: ${error}`);
    // Handle server errors with a generic error flag
    res.redirect('/login?error=serverError');
  }
};


const logout = (req, res) => {
  try {
    req.session.destroy(error => {
      if (error) {
        console.log(`error while logout ${error}`)
      }
    })
    res.redirect('/')
  } catch (error) {
    console.log(`error while logout user ${error}`)
  }
}


// //-------------------------------------- google auth -----------------------------------

// const googleAuth = (req, res) => {
 
//   try {
//     passport.authenticate('google', {
//       scope: ['email', 'profile']
//     })
//   } catch (err) {
//     console.log(`Error on google authentication ${err}`)
//   }
// }


// //----------------------------------- google auth callback  ----------------------------

// const googleAuthCallback = (req, res, next) => {
//   console.log("googleAuthCallback") 
//     passport.authenticate('google', { failureRedirect: '/' }),
//     (req, res) => {
//       res.render("user/home");
//     };
// }






module.exports = {

  signup,
  signupPost,
  otp,
  otppost,
otpResend,
login,
loginpost,
logout,
// googleAuth ,
// googleAuthCallback
};
