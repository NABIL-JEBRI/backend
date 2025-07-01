// backend/src/models/DeliverySlot.js
const mongoose = require('mongoose');

const DeliverySlotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'La date du créneau de livraison est requise']
    },
    startTime: { // Heure de début du créneau (ex: '09:00')
        type: String,
        required: [true, 'L\'heure de début du créneau est requise'],
        match: [/^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/, 'Format horaire invalide (HH:MM)']
    },
    endTime: { // Heure de fin du créneau (ex: '12:00')
        type: String,
        required: [true, 'L\'heure de fin du créneau est requise'],
        match: [/^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/, 'Format horaire invalide (HH:MM)']
    },
    maxCapacity: { // Nombre maximum de livraisons pour ce créneau
        type: Number,
        default: 10, // Valeur par défaut, à ajuster
        min: [0, 'La capacité maximale ne peut pas être négative']
    },
    currentBookings: { // Nombre de livraisons déjà réservées pour ce créneau
        type: Number,
        default: 0,
        min: [0, 'Le nombre de réservations ne peut pas être négatif']
    },
    isAvailable: { // Indique si le créneau est encore disponible
        type: Boolean,
        default: true
    },
    // Zones de livraison couvertes par ce créneau (peut être par gouvernorat, délégation, ou code postal)
    // C'est un tableau de gouvernorats/délégations, ou IDs si vous avez des modèles pour ça
    coveredAreas: [
        {
            governorate: { type: String, trim: true },
            delegation: { type: String, trim: true },
            zipCode: { type: String, trim: true }
            // Ou une référence à un modèle de Zone si vous les modélisez
        }
    ],
    priceModifier: { // Coût additionnel pour ce créneau (ex: livraison rapide)
        type: Number,
        default: 0.0
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

// Middleware pour mettre à jour la disponibilité si la capacité est atteinte
DeliverySlotSchema.pre('save', function(next) {
    if (this.currentBookings >= this.maxCapacity) {
        this.isAvailable = false;
    } else {
        this.isAvailable = true;
    }
    next();
});

module.exports = mongoose.model('DeliverySlot', DeliverySlotSchema);