const productSchema = require('../../model/productSchema');
const cartSchema = require('../../model/cartSchema');
const userSchema = require('../../model/userSchema');
const Razorpay = require('razorpay');
const couponSchema=require('../../model/couponSchema')
const OrderSchema=require('../../model/orderSchema');
const orderSchema = require('../../model/orderSchema');

const checkout = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash('error', "User not found, please log in again");
            return res.redirect('/login');
        }

        const userId = req.session.user;
        const user = await userSchema.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const cartDetails = await cartSchema.findOne({ userId }).populate("items.productId");
        if (!cartDetails) {
            return res.status(404).send('Cart not found');
        }

        const items = cartDetails.items;
        if (items.length === 0) {
            return res.redirect('/cart');
        }

        // Check product availability
        for (const item of items) {
            if (!item.productId.isActive) {
                req.flash("error", "Product is not available, please remove it from the cart");
                return res.redirect("/cart");
            }
        }

        // Retrieve user's saved addresses from the user document
        const addresses = user.address; // Accessing the addresses directly from the user object

        res.render('user/hi', {
            title: 'Checkout',
            user,
            cartDetails,
            userDetails: user,
            addresses, // Pass the addresses to the view
        });
    } catch (err) {
        console.error(`Error while rendering the checkout page: ${err}`);
        res.status(500).send('An error occurred while processing your request');
    }
};



//--------------------------------- checkout order place ----------------------------------


const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        console.log("userId",userId)
        const { selectedAddress, paymentMethod } = req.body;
        console.log("req.body",req.body)
        if (!selectedAddress || !paymentMethod) {
            return res.status(400).send('Invalid address or payment method');
        }

        const cart = await cartSchema.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }
        console.log(" cart", cart)

        const user = await userSchema.findById(userId);
        console.log(" user",user)
        const address = user.address.find(addr => addr._id.toString() === selectedAddress);

        if (!address) {
            return res.status(400).send('Address not found');
        }

        // Create a new order
        const newOrder = new orderSchema({
            userId: userId,
            items: cart.items,
            totalPrice: cart.totalPrice,
            address: `${address.building}, ${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.postalCode}`,
            paymentMethod: paymentMethod,
            status: 'Pending'
        });

        // Save the order
      const orders=  await newOrder.save();

          // Update the stock for each product in the order
          for (const item of cart.items) {
            const product = await productSchema.findById(item.productId);
            if (product) {
                product.stock -= item.productCount; // Reduce the stock by the ordered quantity
                await product.save(); // Save the updated product stock
            }
        }

        // Clear the cart after placing the order
        cart.items = [];
        cart.totalPrice = 0;
        cart.payableAmount = 0;
        await cart.save();
    
        
        res.render('user/conform-order', {orders
        });

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Something went wrong while placing the order', error });
       
    }
};

//------------------------------ failed order page ---------------------------

const failedOrder = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            req.flash('error', 'USER is not found. Login again.');
            return res.redirect('/login');
        }
        res.render('user/Failed-order', { title: "Order Failed" });
    } catch (error) {
        console.log(`Error while rendering the failed order page`, error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};





module.exports = {
    checkout,
    placeOrder,
    failedOrder
};

