const Cart = require('../../model/cartSchema');
const Product = require('../../model/productSchema');
const User = require('../../model/userSchema');


const mongoose = require('mongoose'); // Ensure mongoose is required

const addToCart = async (req, res) => {
    const userId = req.session.user;
    if (!userId) {
        res.locals.alertMessage = "User is not logged in, please log in again.";
        // return res.render('user/cart', { cart: [] });
        return res.redirect('/cart');
    }

    const productId = req.params.id;
    const productPrice = parseFloat(req.params.finalPrice);
    const MAX_QUANTITY_LIMIT = 10; // Maximum limit per product

    try {
        const product = await Product.findById(productId);

        if (!product) {
            res.locals.alertMessage = "Product not found.";
            return res.redirect(`/product/${productId}`);
        }

        // Check if the product is out of stock
        if (product.stock <= 0) {
            res.locals.alertMessage = "Product is out of stock.";
            //return res.render('user/cart', { cart: [] });
            return res.redirect('/cart');
        }

        let cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            cart = new Cart({ userId, items: [], payableAmount: 0, totalPrice: 0 });
        }

        let cartItem = cart.items.find(item => item.productId.equals(product._id));

        if (cartItem) {
            if (cartItem.productCount + 1 > product.stock || cartItem.productCount + 1 > MAX_QUANTITY_LIMIT) {
                res.locals.alertMessage = `Cannot add more than ${Math.min(product.stock, MAX_QUANTITY_LIMIT)} items to the cart.`;
                //return res.render('user/cart', { cart });
                return res.redirect('/cart');
            } else {
                cartItem.productCount += 1;
            }
        } else {
            if (1 > MAX_QUANTITY_LIMIT) {
                res.locals.alertMessage = `Cannot add more than ${MAX_QUANTITY_LIMIT} items to the cart.`;
                return res.render('user/cart', { cart });
            }
            cart.items.push({
                productId: product._id,
                productCount: 1,
                productPrice: productPrice,
                productImage: product.imgArray[0] || '/path-to-default-image.jpg',
            });
        }

        // Recalculate total price and payable amount
        cart.totalPrice = cart.items.reduce((total, item) => total + item.productCount * item.productPrice, 0);
        cart.payableAmount = cart.totalPrice;

      await cart.save();
    

        // return res.render('user/cart', { cart });
        return res.redirect('/cart');
    } catch (error) {
        console.error('Error adding to cart:', error.message);
        return res.status(500).send('Server Error');
    }
};





// Get cart
const getCart = async (req, res) => {
   
    const userId = req.session.user;
    if (!userId) {
        return res.render('user/login', { alertMessage: 'User not logged in' });
    }
  
    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');
    
        if (!cart || cart.length === 0) {
            req.flash('info', 'Your cart is empty');
            return res.render('user/cart', { cart: [] ,alertMessage: 'Your cart is empty'});
        }

        res.render('user/cart', { cart });
    } catch (error) {
        console.error('Error fetching cart:', error.message);
        req.flash('error', 'Error fetching cart');
        res.status(500).send('Server error');
    }
};




// Remove product from cart
const removeFromCart = async (req, res) => {
    const productId = req.params.id;
    const userId = req.session.user; // Assuming user session contains userId

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.redirect('/cart');
        }

        // Filter out the product to remove it from the cart
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
       
        // Update total price and payable amount
        cart.totalPrice = cart.items.reduce((total, item) => total + item.productCount * item.productPrice, 0);
        cart.payableAmount = cart.totalPrice;
        await cart.save(); // Save the updated cart
        res.redirect('/cart');
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).send('Server error');
    }
};


//     console.log("updateCartQuantity ")
//     const productId = req.params.id;
//     console.log("productId",productId)
//     const newQuantity = parseInt(req.body.productCount, 10);
//     console.log("req.body.productCount ",req.body.productCount)
//     console.log("newQuantity ",newQuantity )
//     const userId = req.session.user;
//     console.log("userId ",userId)
//     const MAX_QUANTITY_LIMIT = 10; // Maximum limit per product

//     try {
//         const cart = await Cart.findOne({ userId }).populate('items.productId');
//         if (!cart) {
//             return res.json({
//                 success: false,
//                 message: 'Cart not found.',
//             });
//         }

//         const cartItem = cart.items.find(item => item.productId._id.toString() === productId);
//         if (!cartItem) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Product not found in cart.',
//             });
//         }

//         // Fetch product details to check stock availability
//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Product not found.',
//             });
//         }
//         console.log("product ",product )

//         // Check if the new quantity exceeds available stock or the maximum quantity limit
//         if (newQuantity > product.stock || newQuantity > MAX_QUANTITY_LIMIT) {
//             return res.json({
//                 success: false,
//                 message: `You can only add up to ${Math.min(product.stock, MAX_QUANTITY_LIMIT)} items to your cart.`,
//             });
//         }


//         console.log("product.stock ",product.stock )
//         if (newQuantity > 0) {
//             cartItem.productCount = newQuantity;
//         } else {
//             // If quantity is 0 or less, remove the item from the cart
//             cart.items = cart.items.filter(item => item.productId._id.toString() !== productId);
//         }

//         // Recalculate total price and payable amount
//         cart.totalPrice = cart.items.reduce((total, item) => total + item.productCount * item.productPrice, 0);
//         console.log(" cart.totalPrice ", cart.totalPrice )
//         cart.payableAmount = cart.totalPrice;

//         await cart.save();

//         res.json({ success: true }); // Successful update response
//     } catch (error) {
//         console.error('Error updating cart quantity:', error.message);
//         res.status(500).json({
//             success: false,
//             message: 'Server Error',
//         });
//     }
// };
const increment = async (req, res) => {
    try {
        console.log("Increment function called");
        const { productId } = req.body;
        console.log("Request Body: ", req.body);
        const userId = req.session.user;
        console.log("User ID: ", userId);
        const maxQuantity = 10;

        // Validate request
        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        // Find the product in the cart
        const index = cart.items.findIndex(p => p.productId.toString() === productId);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Product not found in cart' });
        }

        // Check current product count
        const currentCount = cart.items[index].productCount;

        // Increment count
        const newCount = currentCount + 1;

        // Validate maximum quantity
        if (newCount > maxQuantity) {
            return res.status(400).json({ success: false, message: `Maximum quantity per product is ${maxQuantity}` });
        }

        // Validate available stock
        if (newCount > product.stock) { // Changed from product.productCount to product.stock
            return res.status(400).json({ success: false, message: `Available quantity of this product is ${product.stock}` });
        }

        // Update the product count in cart
        cart.items[index].productCount = newCount;

        // Calculate the updated total price
        const updatedPrice = cart.items[index].productPrice * cart.items[index].productCount;

        // Save the cart
        await cart.save();

        // Send success response with updated cart information
        res.status(200).json({
            success: true,
            message: 'Product quantity updated successfully',
            updatedCart: cart,
            cartTotal: cart.items.reduce((total, item) => total + (item.productPrice * item.productCount), 0),
            updatedPrice: updatedPrice
        });
    } catch (error) {
        console.error(`Error incrementing product quantity in cart: ${error}`);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// //------------- Decrement Function ---------------

const decrement = async (req, res) => {
    try {
        const userId = req.session.user;
        const { productId } = req.body;
        if (!userId || !productId) {
            return res.status(400).send('Invalid request');
        }
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).send('Cart not found');
        }
        const index = cart.items.findIndex(p => p.productId.toString() === productId);

        if (index > -1) {
            cart.items[index].productCount -= 1;
            if (cart.items[index].productCount <= 0) {
                cart.items[index].productCount = 1;
            }
            await cart.save();
            res.status(200).json({
                success: true,
                cartTotal: cart.items.reduce((total, item) => total + (item.productPrice * item.productCount), 0),
                updatedPrice: cart.items[index]?.productPrice * cart.items[index]?.productCount || 0});
                disableButton: cart.items[index]?.productCount === 1 // Disable button when count is 1
        } else {
            res.status(404).send('Product not found in cart');
        }
    } catch (error) {
        console.error(`Error decrementing product quantity in cart: ${error}`);
        showError(`Error decrementing product quantity in cart: ${error}`);
        res.status(500).send('Internal server error');
    }
};




module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    increment,
    decrement 
};
