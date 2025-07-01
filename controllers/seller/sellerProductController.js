// backend/src/controllers/seller/sellerProductController.js
const productManagementService = require('../../services/productManagementService');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get all products belonging to the authenticated seller
 * @route   GET /api/v1/seller/products
 * @access  Private (Seller only)
 */
exports.getSellerProducts = catchAsync(async (req, res, next) => {
    const sellerId = req.user.id;
    // Allow sellers to filter/paginate their own products
    const queryParams = { ...req.query, seller: sellerId };

    const { products, pagination } = await productManagementService.getProducts(queryParams);

    res.status(200).json({
        success: true,
        count: products.length,
        pagination,
        data: products,
    });
});

/**
 * @desc    Get a single product belonging to the authenticated seller
 * @route   GET /api/v1/seller/products/:id
 * @access  Private (Seller only)
 */
exports.getSellerProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Product ID
    const sellerId = req.user.id;

    const product = await productManagementService.getProductById(id);

    if (!product) {
        return next(new ApiError('Product not found.', 404));
    }

    // Ensure the product belongs to the current seller
    if (product.seller.toString() !== sellerId.toString()) {
        return next(new ApiError('Not authorized to access this product.', 403));
    }

    res.status(200).json({
        success: true,
        data: product,
    });
});

/**
 * @desc    Create a new product by the authenticated seller
 * @route   POST /api/v1/seller/products
 * @access  Private (Seller only)
 */
exports.createProduct = catchAsync(async (req, res, next) => {
    const sellerId = req.user.id;
    const productData = req.body;

    // Automatically assign the seller to the product
    productData.seller = sellerId;
    // New products might initially be in a 'pending' or 'draft' status, awaiting admin approval
    productData.isApproved = false; // Or 'pending' depending on your schema

    // Perform basic validation before sending to service
    if (!productData.name || !productData.price || !productData.category || !productData.stock) {
        return next(new ApiError('Product name, price, category, and stock are required.', 400));
    }

    const newProduct = await productManagementService.createProduct(productData);

    res.status(201).json({
        success: true,
        message: 'Product created successfully. Awaiting admin approval.',
        data: newProduct,
    });
});

/**
 * @desc    Update an existing product belonging to the authenticated seller
 * @route   PUT /api/v1/seller/products/:id
 * @access  Private (Seller only)
 */
exports.updateProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Product ID
    const sellerId = req.user.id;
    const updateData = req.body;

    // Prevent sellers from changing ownership or approval status directly
    delete updateData.seller;
    delete updateData.isApproved;

    const updatedProduct = await productManagementService.updateProduct(id, updateData, sellerId); // Service checks ownership

    res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: updatedProduct,
    });
});

/**
 * @desc    Delete a product belonging to the authenticated seller
 * @route   DELETE /api/v1/seller/products/:id
 * @access  Private (Seller only)
 */
exports.deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Product ID
    const sellerId = req.user.id;

    await productManagementService.deleteProduct(id, sellerId); // Service checks ownership

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
    });
});

// You might also add endpoints for managing product images, variations, or stock adjustments.