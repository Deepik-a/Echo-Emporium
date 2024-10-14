const orderSchema = require("../../model/orderSchema");
const productSchema = require("../../model/productSchema");


//--------------------------------- user order page -----------------------------


const orderPage = async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            req.flash('error', "User not found. Please login again.");
            return res.redirect("/login");
        }
        const orderDetails = await orderSchema.find({ userId: user }).populate("items.productId").sort({ updatedAt: -1 });
        res.render("user/myOrder", {
            title: "Orders",
            user,
            orderDetails
        });
    } catch (err) {
        console.error(`Error rendering the order page: ${err}`);
        req.flash("error", "Error rendering the order page, please Try again later.");
        res.redirect("/");
    }
};


const cancelOrder = async (req, res) => {
    try {
        const user = req.session.user;
      
        const orderId = req.params.id;
    
        if (!orderId) {
            req.flash('error', 'Invalid order ID');
            return res.redirect('/orders');
        }
        const order = await orderSchema.findByIdAndUpdate(orderId, { status: "Cancelled", isCancel: true });
       
        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/orders');
        }

        // Update the stock for each product in the canceled order
        for (const item of order.items) {
            const product = await productSchema.findById(item.productId);
            if (product) {
                product.stock += item.productCount; // Increase the stock by the canceled quantity
                await product.save(); // Save the updated product stock
            }
        }

        req.flash('success', 'Order cancelled successfully');
        res.redirect('/orders');
    } catch (error) {
        console.error(`Error while cancelling the order: ${error}`);
        req.flash('error', 'Cannot cancel this order right now, please try again');
        res.redirect('/orders');
    }
};






module.exports = { orderPage, cancelOrder} 