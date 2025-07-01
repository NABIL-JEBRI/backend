// backend/src/models/Address.js
const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'L\'utilisateur associé à cette adresse est requis']
    },
    // Nom ou titre de l'adresse (ex: "Adresse Domicile", "Bureau")
    title: {
        type: String,
        trim: true,
        maxlength: [50, 'Le titre de l\'adresse ne peut pas dépasser 50 caractères']
    },
    fullName: { // Nom complet du destinataire
        type: String,
        required: [true, 'Le nom complet du destinataire est requis'],
        trim: true,
        maxlength: [100, 'Le nom complet ne peut pas dépasser 100 caractères']
    },
    phone: { // Numéro de téléphone du destinataire pour la livraison
        type: String,
        required: [true, 'Le numéro de téléphone est requis'],
        trim: true,
        match: [/^\d{8}$/, 'Veuillez entrer un numéro de téléphone valide (8 chiffres)'] // Pour les numéros tunisiens
    },
    street: {
        type: String,
        required: [true, 'La rue et numéro sont requis'],
        trim: true,
        maxlength: [200, 'La rue ne peut pas dépasser 200 caractères']
    },
    buildingDetails: { // Appartement, étage, numéro d'immeuble, etc.
        type: String,
        trim: true,
        maxlength: [100, 'Les détails du bâtiment ne peuvent pas dépasser 100 caractères']
    },
    city: { // Ville ou localité (peut être redondant avec délégation mais utile pour clarté)
        type: String,
        required: [true, 'La ville est requise'],
        trim: true,
        maxlength: [50, 'La ville ne peut pas dépasser 50 caractères']
    },
    governorate: { // Gouvernorat (ex: Sousse, Tunis, Sfax)
        type: String,
        required: [true, 'Le gouvernorat est requis'],
        trim: true,
        // Vous pourriez utiliser un 'enum' ici si vous avez une liste fixe de gouvernorats
        // enum: ['Ariana', 'Béja', 'Ben Arous', ..., 'Zaghouan']
    },
    delegation: { // Délégation (subdivision du gouvernorat)
        type: String,
        required: [true, 'La délégation est requise'],
        trim: true,
        maxlength: [50, 'La délégation ne peut pas dépasser 50 caractères']
    },
    zipCode: {
        type: String,
        required: [true, 'Le code postal est requis'],
        trim: true,
        match: [/^\d{4}$/, 'Veuillez entrer un code postal valide (4 chiffres)'] // Format Tunisien
    },
    country: {
        type: String,
        required: [true, 'Le pays est requis'],
        trim: true,
        default: 'Tunisia' // Par défaut la Tunisie
    },
    isDefault: { // Marquer si c'est l'adresse par défaut pour l'utilisateur
        type: Boolean,
        default: false
    },
    addressType: { // Type d'adresse (livraison, facturation, domicile, travail)
        type: String,
        enum: ['shipping', 'billing', 'home', 'work', 'other'],
        default: 'shipping'
    },
    // Coordonnées géographiques si nécessaire pour les livraisons précises (carte, calcul de distance)
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: { // [longitude, latitude]
            type: [Number],
            index: '2dsphere', // Permet des requêtes géospatiales optimisées
            required: false // Pas toujours requis
        }
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

module.exports = mongoose.model('Address', AddressSchema);