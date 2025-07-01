// backend/src/services/inventoryService.js
const Product = require('../models/Product'); // Assurez-vous que le modèle Product est défini
const ApiError = require('../utils/ApiError');

/**
 * Décrémente la quantité d'un produit en stock.
 * Utilisé après une commande réussie.
 * @param {string} productId - ID du produit.
 * @param {number} quantity - Quantité à décrémenter.
 */
exports.decrementProductStock = async (productId, quantity) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(`Produit non trouvé avec l'ID ${productId}`, 404);
    }
    if (product.stock < quantity) {
        throw new ApiError(`Stock insuffisant pour le produit ${product.name}. Seulement ${product.stock} disponibles.`, 400);
    }

    product.stock -= quantity;
    await product.save();
    return product;
};

/**
 * Incrémente la quantité d'un produit en stock.
 * Utilisé après l'annulation d'une commande ou un retour.
 * @param {string} productId - ID du produit.
 * @param {number} quantity - Quantité à incrémenter.
 */
exports.incrementProductStock = async (productId, quantity) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(`Produit non trouvé avec l'ID ${productId}`, 404);
    }

    product.stock += quantity;
    await product.save();
    return product;
};

/**
 * Vérifie la disponibilité du stock pour un ou plusieurs produits.
 * @param {Array<object>} items - Tableau d'objets { productId, quantity }.
 */
exports.checkStockAvailability = async (items) => {
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
            throw new ApiError(`Produit non trouvé avec l'ID ${item.productId}.`, 404);
        }
        if (product.stock < item.quantity) {
            throw new ApiError(`Stock insuffisant pour le produit "${product.name}". Seulement ${product.stock} disponibles.`, 400);
        }
    }
    return true; // Tous les stocks sont disponibles
};

/**
 * Récupère les produits dont le stock est faible.
 * @param {number} threshold - Seuil de stock faible.
 * @returns {Array<object>} Liste des produits à faible stock.
 */
exports.getLowStockProducts = async (threshold = 10) => {
    const lowStockProducts = await Product.find({ stock: { $lte: threshold } }).sort({ stock: 1 });
    return lowStockProducts;
};