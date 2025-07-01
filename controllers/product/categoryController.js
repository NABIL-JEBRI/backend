// backend/src/controllers/product/categoryController.js
const Category = require('../../models/Category'); // Directement sur le modèle si la logique est simple
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Récupérer toutes les catégories
 * @route   GET /api/v1/categories
 * @access  Public
 */
exports.getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find();

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
    });
});

/**
 * @desc    Récupérer une catégorie par son ID
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
exports.getCategoryById = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
        return next(new ApiError('Catégorie non trouvée.', 404));
    }

    res.status(200).json({
        success: true,
        data: category,
    });
});

/**
 * @desc    Créer une nouvelle catégorie
 * @route   POST /api/v1/admin/categories
 * @access  Private/Admin
 */
exports.createCategory = catchAsync(async (req, res, next) => {
    const { name, description, image } = req.body;

    if (!name) {
        return next(new ApiError('Le nom de la catégorie est requis.', 400));
    }

    // Vérifier si une catégorie avec le même nom existe déjà
    const existingCategory = await Category.findOne({ name: new RegExp(name, 'i') });
    if (existingCategory) {
        return next(new ApiError('Une catégorie avec ce nom existe déjà.', 400));
    }

    const category = await Category.create({ name, description, image });

    res.status(201).json({
        success: true,
        message: 'Catégorie créée avec succès.',
        data: category,
    });
});

/**
 * @desc    Mettre à jour une catégorie
 * @route   PUT /api/v1/admin/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const category = await Category.findById(id);

    if (!category) {
        return next(new ApiError('Catégorie non trouvée.', 404));
    }

    // Vérifier si le nouveau nom entre en conflit avec une autre catégorie existante
    if (name && name !== category.name) {
        const existingCategory = await Category.findOne({ name: new RegExp(name, 'i') });
        if (existingCategory && existingCategory._id.toString() !== id) {
            return next(new ApiError('Une catégorie avec ce nom existe déjà.', 400));
        }
        category.name = name;
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    await category.save();

    res.status(200).json({
        success: true,
        message: 'Catégorie mise à jour avec succès.',
        data: category,
    });
});

/**
 * @desc    Supprimer une catégorie
 * @route   DELETE /api/v1/admin/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
        return next(new ApiError('Catégorie non trouvée.', 404));
    }

    // Optionnel: Gérer les produits associés à cette catégorie (ex: les décatégoriser, les supprimer)
    // await Product.updateMany({ category: id }, { $unset: { category: 1 } });

    res.status(200).json({
        success: true,
        message: 'Catégorie supprimée avec succès.',
    });
});