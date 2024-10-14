const productSchema = require('../../model/productSchema');
const categorySchema = require('../../model/categorySchema')
const fs = require('fs');
const path = require('path');
const multer = require("multer") ;  

 const uploadProduct = multer({
    storage :  multer.diskStorage ({  
        destination : "uploads",   
        filename    : (req , file , cb ) =>{ 
            cb(null , Date.now() + file.originalname)   
        }
     })
 }).array( 'productImages' , 10 ) ;   


//--------------------------------------------- Get a Product ---------------------------
const getProduct = async (req, res) => {
    try {
        const categories = await categorySchema.find({isDeleted:false});
        const products= await productSchema.find({ isDeleted: false });
        res.render('admin/Product', { products, error: '',categories });
    } catch (error) {
        res.render('admin/Product', { error: 'Error fetching products', products: [] });
    }
};


const addProduct= async (req, res) => {
    uploadProduct(req, res, async function (err) {
        console.log("addProduct")
        if (err) {
            return res.status(400).json({ error: 'Error uploading files: ' + err.message }) ; 
        }
        
        try {
           
            const { name, price, description, stock, category,discount } = req.body;

              
            console.log("req.files",req.files)

            let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        }



            console.log("imageUrls",imageUrls)
            const categoryName = await categorySchema.findOne({ name: category });
                    if (!categoryName) {
                        return res.status(400).json({ success: false, message: 'Category not found' });
                    }
                        // Calculate the final price after applying the discount
            let finalPrice = price;
            if (discount) {
                // Assuming 'discount' is a percentage, calculate the final price
                finalPrice = price - (price * discount / 100);
            }
            
            const product = new productSchema({
                            name,
                            price,
                            description,
                            stock,
                            category: categoryName._id, // Save category ID
                            imgArray: imageUrls, // Save the array of uploaded image filenames
                            discount: discount || 0 ,
                            finalPrice
                            // Save the discount amount (or 0 if no discount)
                        });
                
             
            
            await product.save().then( savedproduct => console.log( savedproduct )).catch( error => console.log(error) );
            
            res.status(200).json({ message: 'Product added successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error saving product: ' + error.message });
        }
    });
};





const editProduct = async (req, res) => {
    uploadProduct(req, res, async function (err) {
    try {
       
        const { id } = req.params;
        console.log("id",id )
        
        const { name, stock, price, description, category, isActive ,discount} = req.body;

        console.log("Request body:", req.body);

     
        // Find the category by its name
        const categoryName = await categorySchema.find({});

        if (!categoryName) {
            return res.status(404).json({ message: 'Category not found' });
        }


                       // Calculate the final price after applying the discount
                       let finalPrice = price;
                       if (discount) {
                           // Assuming 'discount' is a percentage, calculate the final price
                           finalPrice = price - (price * discount / 100);
                       }
                       
        // Find product by ID and update it
        const updatedProduct = await productSchema.findByIdAndUpdate(
            id,
            {
                name,
                stock,
                price,
                category: categoryName._id,
                description,
                isActive,
                discount: discount || 0 ,
                finalPrice,

            },
            { new: true }
        );
        console.log("updatedProduct",updatedProduct )

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Redirect to product list page with success flag
        res.redirect('/admin/editProduct?success=true');
        console.log("product updated successfully");
        console.log("updatedProduct",updatedProduct )

    } catch (error) {
        console.error('Error updating product:', error);
        res.redirect('/admin/editProduct?error=true');
    }
})
};



//--------------------------------------------- Get Edit Product Page ---------------------------
const geteditProduct = async (req, res) => {
    try {
        
        // Fetch all products and populate the category field
        const product = await productSchema.find({}).populate('category', 'name'); // Populate 'category' with only 'name'
        
        // Fetch all categories
        const categories = await categorySchema.find({}, 'name'); // Fetch only the 'name' field from categories
    
        
        

        // Render the Productlist page with both products and categories
        res.render('admin/Productlist', { product, categories, success: req.query.success, error: req.query.error });
    } catch (error) {
        console.error('Error rendering edit product page:', error);
        res.status(500).send('Internal Server Error');
    }
};


 




//--------------------------------------------- List a Product ---------------------------
const listProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the product by ID and update its isActive status to true
        const updatedProduct = await productSchema.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Redirect back to product management page
        res.redirect('/admin/editProduct?success=true');
    } catch (error) {
        console.error('Error listing product:', error);
        res.redirect('/admin/editProduct?error=true');
    }
};

//--------------------------------------------- Unlist a Product ---------------------------
const unlistProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the product by ID and update its isActive status to false
        const updatedProduct = await productSchema.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Redirect back to product management page
        res.redirect('/admin/editProduct?success=true');
    } catch (error) {
        console.error('Error unlisting product:', error);
        res.redirect('/admin/editProduct?error=true');
    }
};

module.exports = {
    getProduct,
    addProduct,
    geteditProduct,
    editProduct,
    listProduct,
    unlistProduct
};
