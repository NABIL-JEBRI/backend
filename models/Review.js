// backend/src/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur ayant laissé l\'avis est requis']
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Le produit concerné par l\'avis est requis']
    },
    rating: {
        type: Number,
        required: [true, 'La note est requise'],
        min: [1, 'La note doit être au moins 1'],
        max: [5, 'La note ne peut pas dépasser 5']
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [1000, 'Le commentaire ne peut pas dépasser 1000 caractères']
    },
    title: { // Titre optionnel pour l'avis
        type: String,
        trim: true,
        maxlength: [100, 'Le titre de l\'avis ne peut pas dépasser 100 caractères']
    },
    // Statut de l'avis (pour modération)
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' // Les avis peuvent nécessiter une approbation manuelle
    },
    // Utile pour savoir si l'utilisateur a acheté le produit
    isPurchased: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

// Empêche un utilisateur de laisser plusieurs avis sur le même produit
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Middleware pour mettre à jour les notes moyennes et le nombre d'avis du produit
// après qu'un avis a été sauvegardé, mis à jour ou supprimé.
ReviewSchema.statics.getAverageRating = async function(productId) {
    const obj = await this.aggregate([
        {
            $match: { product: productId, status: 'approved' } // Ne compter que les avis approuvés
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        await this.model('Product').findByIdAndUpdate(productId, {
            ratings: obj.length > 0 ? obj[0].averageRating : 0,
            numOfReviews: obj.length > 0 ? obj[0].numOfReviews : 0
        });
    } catch (err) {
        console.error('Erreur lors de la mise à jour de la note du produit :', err);
    }
};

// Appeler getAverageRating après save
ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.product);
});

// Appeler getAverageRating après remove (pour la suppression via findOneAndDelete, etc.)
ReviewSchema.post('remove', function() {
    this.constructor.getAverageRating(this.product);
});


module.exports = mongoose.model('Review', ReviewSchema);