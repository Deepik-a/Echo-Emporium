const express=require('express')
const admin=express.Router()
const adminController=require('../controller/adminController/adminController')
const userController=require('../controller/adminController/usercontroller')
const categoryController = require('../controller/adminController/categoryController');
const  productController = require('../controller/adminController/productController');
const multerUpload = require('../middleware/multer');
const couponController = require('../controller/adminController/couponController');
const orderController = require('../controller/adminController/orderController');
const offerController = require('../controller/adminController/offerController');



const isAdmin = require('../middleware/adminSession');



//--------------------------------admin login----------------------------
admin.get('/login',adminController.admin)
// admin.get('/login',adminController.adminlogin)
admin.post('/login',adminController.adminloginpost)



//--------------------------------UserManagment----------------------------
admin.get('/users',isAdmin,adminController.listuser)
admin.get('/block/:id',isAdmin,adminController.blockUser)
admin.get('/unblock/:ideee',isAdmin,adminController.unblockUser)


//--------------------------------CategoryManagment----------------------------
admin.get('/addCategory', isAdmin,adminController.getCategories);
admin.post('/addCategory', isAdmin,categoryController.addCategory);
admin.get('/editCategory',isAdmin,categoryController.geteditCategories);
admin.get('/editCategory/:id',isAdmin,categoryController.renderEditCategoryForm);
admin.post('/editCategory/:id',isAdmin,categoryController.editCategory);
admin.post('/categories/:id/block',isAdmin,categoryController.blockCategory);
admin.post('/categories/:id/unblock',isAdmin,categoryController.unblockCategory);
admin.get('/categories', isAdmin,categoryController.getCategoriesForUser);


// //--------------------------------ProductManagment----------------------------
admin.get('/addProduct', isAdmin,productController.getProduct);
// admin.post('/addProduct', multerUpload,productController.addProduct);
 admin.post('/addProduct',isAdmin,productController.addProduct);
admin.get('/editProduct', isAdmin,productController.geteditProduct);
admin.post('/editProduct/:id',isAdmin, productController.editProduct);
admin.post('/listProduct/:id', isAdmin,productController.listProduct);
admin.post('/unlistProduct/:id',isAdmin, productController.unlistProduct);


//--------------------------------Order Management Routes----------------------------


admin.get('/orders', orderController.listOrders);
admin.post('/orders/status', orderController.changeOrderStatus);
admin.post('/orders/cancel', orderController.cancelOrder);


//-------------------------------- Inventory Management Routes---------------------------------



admin.get('/inventory', orderController.listInventory);
admin.post('/inventory/update', orderController.updateStock);



admin.get('/coupons/:id?',  couponController.getCoupons);

admin.post('/addcoupon',  couponController.addCoupon);

admin.post('/editcoupon/:id',  couponController.editCoupon);

admin.get('/statuscoupon',  couponController.toggleCouponStatus);

admin.delete('/deletecoupon/:id',  couponController.deleteCoupon);


//-------------------------------- Offer Management---------------------------------
// -------------------------------- offer --------------------------------

admin.get('/offer', isAdmin, offerController.getOffer);

admin.post('/addOffer',isAdmin,offerController.addOffer);

admin.post('/editOffer',isAdmin,offerController.editOffer);

admin.get('/deleteOffer/:id',isAdmin,offerController.deleteOffer);

admin.get('/offerStatus',isAdmin,offerController.offerStatus);







module.exports=admin