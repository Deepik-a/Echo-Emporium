const Order = require('../../model/orderSchema'); // Assuming you have an Order model
const Product = require('../../model/productSchema'); // Assuming you have a Product model for stock management



// List all orders
const listOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId') // Populating user details
            .populate('items.productId'); // Populating product details within items
        res.render('admin/order', { orders }); // Render orders to the admin page
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Error fetching orders');
    }
};

// Change order status
const changeOrderStatus = async (req, res) => {
    const { orderId, status } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (order) {
            order.status = status; // Update status (e.g., 'Pending', 'Shipped', etc.)
            await order.save();
            res.redirect('/admin/orders');
        } else {
            res.status(404).send('Order not found');
        }
    } catch (error) {
        console.error('Error changing order status:', error);
        res.status(500).send('Error changing order status');
    }
};

// Cancel order and restore stock
const cancelOrder = async (req, res) => {
    const { orderId } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (order) {
            // Update stock for each canceled item
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.productCount }
                });
            }
            order.isCancel = true; // Set the order as canceled
            order.status = 'Cancelled'; // Update status to 'Cancelled'
            await order.save();
            res.redirect('/admin/orders');
        } else {
            res.status(404).send('Order not found');
        }
    } catch (error) {
        console.error('Error canceling order:', error);
        res.status(500).send('Error canceling order');
    }
};




// List products and inventory
const listInventory = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/inventory', { products }); // Render inventory to the admin page
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).send('Error fetching inventory');
    }
};

// Update product stock
const updateStock = async (req, res) => {
    const { productId, stock } = req.body;
    try {
        const product = await Product.findById(productId);
        if (product) {
            product.stock = stock; // Update stock value
            await product.save();
            res.redirect('/admin/inventory');
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).send('Error updating stock');
    }
};




module.exports={
    listOrders,
    changeOrderStatus,
    cancelOrder,
    listInventory ,
    updateStock 
}