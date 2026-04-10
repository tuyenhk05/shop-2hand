const Product = require('../../models/products.model');

module.exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            data: products
        });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching products'
        });
    }
};

module.exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        console.error('Get product by id error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching product'
        });
    }
};

module.exports.createProduct = async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = await Product.create(productData);
        
        res.status(201).json({
            success: true,
            data: newProduct,
            message: 'Product created successfully'
        });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating product'
        });
    }
};

module.exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while updating product'
        });
    }
};

module.exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: deletedProduct,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting product'
        });
    }
};