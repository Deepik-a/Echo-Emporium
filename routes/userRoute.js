const express=require('express')
const route=express.Router()
const passport = require('passport');


const activeUser = require('../middleware/userSession');
const checkUser= require('../middleware/checkUserSession');

const userController=require("../controller/userController/userController")
const User=require("../model/userSchema")
const productController=require("../controller/userController/productController")
const categoryController=require("../controller/userController/categoryController")
const profileController=require('../controller/userController/profileController')
const cartController=require('../controller/userController/cartController')
const navbarController=require('../controller/userController/navbarcontroller')
const categorySchema=require('../model/categorySchema')
const checkoutPageController=require('../controller/userController/checkoutcontroller')
const forgotPassword=require('../controller/userController/forgotPassword')
const walletController=require('../controller/userController/walletController')
const orderController=require('../controller/userController/orderController')






//-------------------------------- home -------------------------------

route.get('/' ,navbarController.home);

/*-------------------------------------signup-----------------*/
route.get('/signup',userController.signup)
route.post('/signup',userController.signupPost)


route.get('/otp',userController.otp)
route.post('/otp',userController.otppost)

route.get('/resend',userController.otpResend)


route.get('/login',userController.login)

route.post('/login',userController.loginpost)

route.get('/logout',userController.logout)
//------------------------ login using google ------------------------

// route.get('/auth/google',userController.googleAuth);

// route.get('/auth/google/callback',userController.googleAuthCallback);
route.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
route.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  async(req,res) => {
  const categories=await categorySchema.find({isDeleted:false})

    try {
      const user =await User.findOne({email:req.user.email});
      console.log(user)
     if(user.is_blocked){
      res.render('user/signup',{message:'Your Account has Been blocked'})
     }else{
     res.render('user/Landingpage',{categories})
     }

    } catch (error) {
      console.log(error.message);
      
    } 
  }
);


// //---------------------------------- Cart ------------------------

route.post('/cart/add/:id/:finalPrice',checkUser,cartController.addToCart);
route.get('/cart',checkUser, cartController.getCart);
route.get('/cart/remove/:id', checkUser ,cartController.removeFromCart);
route.post('/cart/increment',checkUser ,cartController.increment);
route.post('/cart/decrement',checkUser ,cartController.decrement);


// //---------------------------------- wishlist------------------------

// route.get('/wishlist',wishlistController.wishlistPage)



// //---------------------------------- Order  ------------------------

route.post('/place-order', checkUser,checkoutPageController.placeOrder);
route.get('/orders', checkUser, orderController.orderPage);
route.get('/cancelOrder/:id', checkUser , orderController.cancelOrder);








//---------------------------------- Category and main page------------------------
// route.get('/categories', checkUser ,categoryController.getAllCategories);
route.get('/product/:id', checkUser ,productController.getProductDetail)
route.get('/all-products', checkUser ,productController.getAllProducts);
route.get('/products',checkUser,productController.sortAllproducts)
route.get('/product/zoom/:id',productController.imageZoom)
route.get('/categories/:categoryName',checkUser , productController.getProductsByCategory);
route.post('/search',checkUser,productController.searchbyProducts)


 //--------------------------------UserProfile----------------------------
route.get('/userprofile',checkUser,profileController.profile)
route.post('/update-profile',  checkUser,profileController.updatedProfile);
route.post('/add-address',checkUser, profileController.addAddress);
route.post('/delete-address/:index',checkUser,profileController.removeAddress)
route.post('/edit-address/:index',checkUser,profileController.editAddress)



//----------------------------- wallet route --------------------------

route.get('/wallet', activeUser , walletController.walletPage);


 //--------------------------------CheckoutPage----------------------------
 route.get('/checkout',checkUser,checkoutPageController.checkout)
 route.get('/failed-order', checkUser, checkoutPageController.failedOrder);


//------------------------- forgot password ---------------------------

route.get('/forgotpassword' , forgotPassword.forgotPassword);

route.post('/forgotpassword' , forgotPassword.forgotPasswordPost);

route.get('/forgotpasswordotp' , forgotPassword.forgotPasswordOtp);

route.post('/forgotpasswordotp' , forgotPassword.forgotPasswordOtpPost);
route.post('/resetpassword' , forgotPassword.resetPasswordPost);

route.get('/forgotpassword-resend/:email' , forgotPassword.forgotResend);

module.exports = route;