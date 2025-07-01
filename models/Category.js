// backend/src/models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom de la catégorie est requis'],
        unique: true,
        trim: true,
        maxlength: [50, 'Le nom de la catégorie ne peut pas dépasser 50 caractères']
    },
    slug: { // Pour des URLs plus propres (ex: "electronique", "smartphones")
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'La description de la catégorie ne peut pas dépasser 500 caractères']
    },
    image: { // Image représentative de la catégorie (ex: icône, bannière)
        public_id: { type: String }, // ID public de l'image sur Cloudinary
        url: { type: String } // URL de l'image sur Cloudinary
    },
    parentCategory: { // Pour la hiérarchie des catégories (sous-catégorie)
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        default: null // Null pour les catégories de niveau supérieur
    },
    isSubCategory: { // Indique si c'est une sous-catégorie
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

// Middleware pour générer le slug avant de sauvegarder
CategorySchema.pre('save', function(next) {
    if (this.isModified('name') && this.name) {
        this.slug = this.name.toLowerCase()
            .replace(/[^a-z0-9 -]/g, '') // Supprime les caractères spéciaux
            .replace(/\s+/g, '-')       // Remplace les espaces par des tirets
            .replace(/-+/g, '-');       // Supprime les tirets multiples
    }
    // Si un parent est défini, c'est une sous-catégorie
    if (this.parentCategory) {
        this.isSubCategory = true;
    } else {
        this.isSubCategory = false;
    }
    next();
});

module.exports = mongoose.model('Category', CategorySchema);