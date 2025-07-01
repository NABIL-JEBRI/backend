// backend/src/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom du produit est requis'],
        trim: true,
        maxlength: [100, 'Le nom du produit ne peut pas dépasser 100 caractères']
    },
    miniDescription: { // Nouvelle petite description pour les aperçus
        type: String,
        required: [true, 'Une mini description est requise'],
        trim: true,
        maxlength: [200, 'La mini description ne peut pas dépasser 200 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description complète du produit est requise'],
        maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'] // Augmenté pour une description plus riche
    },
    images: [
        {
            public_id: { type: String, required: true }, // ID public de l'image sur Cloudinary
            url: { type: String, required: true } // URL de l'image sur Cloudinary
        }
    ],
    price: {
        type: Number,
        required: [true, 'Le prix est requis'],
        min: [0, 'Le prix ne peut pas être négatif']
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: [0, 'Le pourcentage de remise ne peut pas être négatif'],
        max: [100, 'Le pourcentage de remise ne peut pas dépasser 100']
    },
    promoPrice: { // Prix après application de la remise
        type: Number,
        // La valeur par défaut est calculée dynamiquement, mais le champ est bien là
        min: [0, 'Le prix promotionnel ne peut pas être négatif']
    },
    stock: {
        type: Number,
        required: [true, 'Le stock est requis'],
        min: [0, 'Le stock ne peut pas être négatif']
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category', // Référence au modèle Category principal
        required: [true, 'La catégorie principale est requise']
    },
    subCategory: { // Nouvelle référence pour la sous-catégorie
        type: mongoose.Schema.ObjectId,
        ref: 'Category', // Référence au même modèle Category, mais comme sous-catégorie
        required: false // Une sous-catégorie n'est pas toujours obligatoire
    },
    brand: {
        type: mongoose.Schema.ObjectId,
        ref: 'Brand', // Référence au modèle Brand
        required: [true, 'La marque est requise']
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Référence à l'utilisateur (vendeur)
        required: [true, 'Le vendeur est requis']
    },
    // Ventes Flash
    isFlashSale: {
        type: Boolean,
        default: false
    },
    flashSaleEndTime: {
        type: Date, // Date de fin de la vente flash
        required: function() { return this.isFlashSale === true; } // Requis si c'est une vente flash
    },
    // Pour la validation admin des produits
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'], // Statut de validation par l'admin
        default: 'pending'
    },
    ratings: { // Note moyenne basée sur les avis
        type: Number,
        default: 0
    },
    numOfReviews: { // Nombre d'avis
        type: Number,
        default: 0
    },
    // Ajout d'un champ pour les mots-clés ou tags
    tags: [
        { type: String, trim: true }
    ]
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

// Middleware pour calculer promoPrice avant de sauvegarder si price ou discountPercentage sont modifiés
ProductSchema.pre('save', function(next) {
    if (this.isModified('price') || this.isModified('discountPercentage')) {
        this.promoPrice = this.price * (1 - this.discountPercentage / 100);
        // Assurez-vous que promoPrice ne soit pas négatif
        if (this.promoPrice < 0) this.promoPrice = 0;
    }
    next();
});

module.exports = mongoose.model('Product', ProductSchema);