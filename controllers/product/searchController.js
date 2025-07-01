// backend/src/controllers/product/searchController.js
const searchService = require('../../services/searchService');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

/**
 * @desc    Effectuer une recherche globale sur les produits
 * @route   GET /api/v1/products/search
 * @access  Public
 */
exports.searchProducts = catchAsync(async (req, res, next) => {
    const { keyword, category, minPrice, maxPrice, brand, sort, page, limit } = req.query;

    if (!keyword && !category && !minPrice && !maxPrice && !brand) {
        return next(new ApiError('Veuillez fournir au moins un critère de recherche (mot-clé, catégorie, prix, marque).', 400));
    }

    const searchCriteria = {
        keyword,
        category,
        minPrice: parseFloat(minPrice),
        maxPrice: parseFloat(maxPrice),
        brand,
        sort,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        isApproved: true // Par défaut, la recherche publique n'inclut que les produits approuvés
    };

    const { products, pagination } = await searchService.globalSearch(searchCriteria);

    res.status(200).json({
        success: true,
        count: products.length,
        pagination,
        data: products,
    });
});

// Vous pouvez ajouter d'autres fonctions de recherche spécialisées ici si nécessaire,
// par exemple pour les "produits similaires", "recherche par tags", etc.