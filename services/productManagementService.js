// backend/src/services/productManagementService.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const User = require('models/User'); // Pour vérifier le rôle du vendeur
const ApiError = require('../utils/ApiError');
const uploadService = require('./uploadService'); // Pour supprimer les images si nécessaire

/**
 * Crée un nouveau produit.
 * @param {object} productData - Données du produit.
 * @param {string} sellerId - L'ID du vendeur qui crée le produit.
 * @returns {object} Le produit créé.
 */
exports.createProduct = async (productData, sellerId) => {
    // 1. Vérifier si le vendeur existe et a bien le rôle 'seller'
    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== 'seller') {
        throw new ApiError('Seuls les vendeurs peuvent créer des produits.', 403);
    }

    // 2. Vérifier et assigner la catégorie et la marque
    if (productData.category) {
        const category = await Category.findById(productData.category);
        if (!category) {
            throw new ApiError('Catégorie spécifiée introuvable.', 400);
        }
    }
    if (productData.brand) {
        const brand = await Brand.findById(productData.brand);
        if (!brand) {
            throw new ApiError('Marque spécifiée introuvable.', 400);
        }
    }

    // 3. Assigner le vendeur et le statut initial
    productData.seller = sellerId;
    productData.isApproved = false; // Les produits nécessitent une approbation par défaut

    const product = await Product.create(productData);
    return product;
};

/**
 * Récupère un produit par son ID.
 * @param {string} productId - ID du produit.
 * @returns {object} Le produit.
 */
exports.getProductById = async (productId) => {
    const product = await Product.findById(productId)
        .populate('category', 'name')
        .populate('brand', 'name')
        .populate('seller', 'name email'); // Populer les informations pertinentes

    if (!product) {
        throw new ApiError('Produit non trouvé.', 404);
    }
    return product;
};

/**
 * Met à jour un produit existant.
 * @param {string} productId - ID du produit.
 * @param {object} updateData - Données à mettre à jour.
 * @param {string} userId - L'ID de l'utilisateur effectuant la mise à jour (pour vérification des permissions).
 * @param {string} userRole - Le rôle de l'utilisateur (admin, seller).
 * @returns {object} Le produit mis à jour.
 */
exports.updateProduct = async (productId, updateData, userId, userRole) => {
    let product = await Product.findById(productId);
    if (!product) {
        throw new ApiError('Produit non trouvé.', 404);
    }

    // Vérifier les permissions
    if (userRole === 'seller' && product.seller.toString() !== userId.toString()) {
        throw new ApiError('Vous n\'êtes pas autorisé à modifier ce produit.', 403);
    }
    // Les administrateurs peuvent modifier n'importe quel produit

    // Si la catégorie ou la marque est mise à jour, vérifier leur existence
    if (updateData.category) {
        const category = await Category.findById(updateData.category);
        if (!category) throw new ApiError('Catégorie spécifiée introuvable.', 400);
    }
    if (updateData.brand) {
        const brand = await Brand.findById(updateData.brand);
        if (!brand) throw new ApiError('Marque spécifiée introuvable.', 400);
    }

    // Si le stock est mis à jour ici, s'assurer que c'est géré de manière appropriée
    // (normalement inventoryService gère les incréments/décréments liés aux commandes)

    // Mettre à jour et sauvegarder
    Object.assign(product, updateData);
    await product.save({ runValidators: true }); // Exécute les validateurs Mongoose
    return product;
};

/**
 * Supprime un produit.
 * @param {string} productId - ID du produit.
 * @param {string} userId - L'ID de l'utilisateur effectuant la suppression.
 * @param {string} userRole - Le rôle de l'utilisateur.
 */
exports.deleteProduct = async (productId, userId, userRole) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError('Produit non trouvé.', 404);
    }

    // Vérifier les permissions
    if (userRole === 'seller' && product.seller.toString() !== userId.toString()) {
        throw new ApiError('Vous n\'êtes pas autorisé à supprimer ce produit.', 403);
    }

    // Optionnel: Supprimer les images associées de Cloudinary via uploadService
    // if (product.images && product.images.length > 0) {
    //     for (const image of product.images) {
    //         await uploadService.deleteImage(image.public_id);
    //     }
    // }

    await product.deleteOne(); // Utiliser deleteOne() sur l'instance du document pour les hooks
    return { message: 'Produit supprimé avec succès.' };
};

/**
 * Approuve ou désapprouve un produit (pour les administrateurs).
 * @param {string} productId - ID du produit.
 * @param {boolean} status - True pour approuver, false pour désapprouver.
 * @returns {object} Le produit mis à jour.
 */
exports.approveProduct = async (productId, status) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError('Produit non trouvé.', 404);
    }
    product.isApproved = status;
    await product.save();
    return product;
};

/**
 * Récupère tous les produits avec des options de filtrage, tri et pagination.
 * @param {object} queryParams - Paramètres de requête (filtres, tri, pagination).
 * @returns {object} Objets products et pagination.
 */
exports.getProducts = async (queryParams) => {
    const { category, brand, minPrice, maxPrice, search, sort, page = 1, limit = 10, isApproved } = queryParams;

    const filters = {};
    if (category) {
        const categoryObj = await Category.findOne({ name: new RegExp(category, 'i') });
        if (categoryObj) filters.category = categoryObj._id;
    }
    if (brand) {
        const brandObj = await Brand.findOne({ name: new RegExp(brand, 'i') });
        if (brandObj) filters.brand = brandObj._id;
    }
    if (minPrice) filters.price = { ...filters.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };
    if (search) {
        filters.$or = [
            { name: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') }
        ];
    }
    // Filtrer par statut d'approbation (pour les admins ou si la route publique ne montre que les approuvés)
    if (isApproved !== undefined) {
        filters.isApproved = isApproved === 'true'; // Convertir la chaîne en booléen
    } else {
        filters.isApproved = true; // Par défaut, n'afficher que les approuvés pour les clients
    }


    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = sort ? sort.split(',').join(' ') : '-createdAt'; // Ex: 'price,-name' -> 'price -name'

    const productsQuery = Product.find(filters);
    const totalProducts = await Product.countDocuments(filters);

    const products = await productsQuery
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category', 'name')
        .populate('brand', 'name')
        .populate('seller', 'name email');

    const pagination = {
        total: totalProducts,
        limit: parseInt(limit),
        currentPage: parseInt(page),
        nextPage: totalProducts > (parseInt(page) * parseInt(limit)) ? parseInt(page) + 1 : null,
        prevPage: parseInt(page) > 1 ? parseInt(page) - 1 : null,
        totalPages: Math.ceil(totalProducts / parseInt(limit))
    };

    return { products, pagination };
};