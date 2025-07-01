// backend/src/models/Brand.js
const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom de la marque est requis'],
        unique: true,
        trim: true,
        maxlength: [100, 'Le nom de la marque ne peut pas dépasser 100 caractères']
    },
    slug: { // Pour des URLs plus propres (ex: "samsung", "apple")
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    logo: { // Image du logo de la marque (URL Cloudinary)
        public_id: {
            type: String,
            required: [true, 'L\'ID public du logo est requis']
        },
        url: {
            type: String,
            required: [true, 'L\'URL du logo est requise']
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'La description de la marque ne peut pas dépasser 500 caractères']
    },
    // Vous pouvez ajouter d'autres champs ici, comme des liens vers le site web, etc.
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

// Middleware pour générer le slug avant de sauvegarder
BrandSchema.pre('save', function(next) {
    if (this.isModified('name') && this.name) {
        this.slug = this.name.toLowerCase()
            .replace(/[^a-z0-9 -]/g, '') // Supprime les caractères spéciaux
            .replace(/\s+/g, '-')       // Remplace les espaces par des tirets
            .replace(/-+/g, '-');       // Supprime les tirets multiples
    }
    next();
});

module.exports = mongoose.model('Brand', BrandSchema);