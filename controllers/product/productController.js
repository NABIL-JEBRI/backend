// backend/src/controllers/product/productController.js
const productManagementService = require('../../services/productManagementService');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

/**
 * @desc    Récupérer tous les produits (avec filtres, tri et pagination)
 * @route   GET /api/v1/products
 * @access  Public
 */
exports.getAllProducts = catchAsync(async (req, res, next) => {
    // Les paramètres de requête comme 'category', 'brand', 'minPrice', 'maxPrice', 'search', 'sort', 'page', 'limit'
    // seront passés directement au service.
    const queryParams = req.query;

    // Par défaut, nous ne voulons afficher que les produits approuvés au grand public
    if (queryParams.isApproved === undefined) {
        queryParams.isApproved = true;
    }

    const { products, pagination } = await productManagementService.getProducts(queryParams);

    res.status(200).json({
        success: true,
        count: products.length,
        pagination,
        data: products,
    });
});

/**
 * @desc    Récupérer un produit par son ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
exports.getProductById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const product = await productManagementService.getProductById(id);

    // Vérifiez si le produit est approuvé avant de le retourner au public,
    // sauf si l'utilisateur est un admin ou le vendeur propriétaire.
    // Cette logique peut aussi être gérée dans le service si vous voulez une application plus stricte.
    // Pour l'instant, le service retourne tous les produits, le contrôleur filtre pour le public.
    if (!product.isApproved && (!req.user || (req.user.role !== 'admin' && product.seller.toString() !== req.user.id.toString()))) {
        return next(new ApiError('Produit non approuvé ou non trouvé.', 404));
    }

    res.status(200).json({
        success: true,
        data: product,
    });
});

// Note : Les opérations de création, mise à jour, suppression de produits
// seront gérées par sellerProductController (pour les vendeurs)
// et productManagementController (pour les administrateurs) afin de séparer les responsabilités.