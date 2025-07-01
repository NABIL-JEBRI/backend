// backend/src/models/RelayPoint.js
const mongoose = require('mongoose');

const RelayPointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom du point relais est requis'],
        trim: true,
        unique: true, // Chaque point relais devrait avoir un nom unique
        maxlength: [100, 'Le nom du point relais ne peut pas dépasser 100 caractères']
    },
    // Adresse détaillée du point relais, basée sur la structure tunisienne
    address: {
        street: {   
            type: String,
            required: [true, 'La rue du point relais est requise'],
            trim: true,
            maxlength: [200, 'La rue ne peut pas dépasser 200 caractères']
        },
        buildingDetails: { // Appartement, étage, numéro d'immeuble, etc.
            type: String,
            trim: true,
            maxlength: [100, 'Les détails du bâtiment ne peuvent pas dépasser 100 caractères']
        },
        city: {
            type: String,
            required: [true, 'La ville du point relais est requise'],
            trim: true,
            maxlength: [50, 'La ville ne peut pas dépasser 50 caractères']
        },
        governorate: { // Gouvernorat (ex: Sousse, Tunis)
            type: String,
            required: [true, 'Le gouvernorat du point relais est requis'],
            trim: true
        },
        delegation: { // Délégation (subdivision du gouvernorat)
            type: String,
            required: [true, 'La délégation du point relais est requise'],
            trim: true,
            maxlength: [50, 'La délégation ne peut pas dépasser 50 caractères']
        },
        zipCode: {
            type: String,
            required: [true, 'Le code postal du point relais est requis'],
            trim: true,
            match: [/^\d{4}$/, 'Veuillez entrer un code postal valide (4 chiffres)'] // Format Tunisien
        },
        country: {
            type: String,
            trim: true,
            default: 'Tunisia'
        }
    },
    contactPhone: {
        type: String,
        required: [true, 'Le numéro de téléphone du contact est requis'],
        trim: true,
        match: [/^\d{8}$/, 'Veuillez entrer un numéro de téléphone de contact valide (8 chiffres)']
    },
    contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Veuillez entrer une adresse email de contact valide']
    },
    openingHours: [ // Tableau des horaires d'ouverture par jour
        {
            dayOfWeek: {
                type: Number, // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
                required: true,
                min: 0,
                max: 6
            },
            openTime: {
                type: String, // Ex: "09:00"
                required: true,
                match: [/^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/, 'Format horaire invalide (HH:MM)']
            },
            closeTime: {
                type: String, // Ex: "18:00"
                required: true,
                match: [/^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/, 'Format horaire invalide (HH:MM)']
            },
            isClosed: { // Pour marquer un jour comme fermé
                type: Boolean,
                default: false
            }
        }
    ],
    maxCapacity: { // Capacité maximale en colis pour ce point relais
        type: Number,
        default: 100, // Valeur par défaut
        min: [0, 'La capacité maximale ne peut pas être négative']
    },
    currentOccupancy: { // Nombre actuel de colis présents
        type: Number,
        default: 0,
        min: [0, 'L\'occupation actuelle ne peut pas être négative']
    },
    images: [ // Photos du point relais (ex: façade)
        {
            public_id: { type: String },
            url: { type: String }
        }
    ],
    location: { // Coordonnées GPS (longitude, latitude) pour la carte et la recherche de proximité
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: { // [longitude, latitude]
            type: [Number],
            required: [true, 'Les coordonnées GPS sont requises'],
            index: '2dsphere' // Pour les requêtes géospatiales
        }
    },
    status: { // Statut du point relais (actif, temporairement fermé, plein)
        type: String,
        enum: ['active', 'temporarily_closed', 'full', 'inactive'],
        default: 'active'
    },
    managedBy: { // Utilisateur (admin ou propriétaire du point relais) qui le gère
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // Peut être géré par des scripts si besoin
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt
});

// Middleware pour mettre à jour le statut 'full' si la capacité est atteinte
RelayPointSchema.pre('save', function(next) {
    if (this.currentOccupancy >= this.maxCapacity && this.status !== 'full') {
        this.status = 'full';
    } else if (this.currentOccupancy < this.maxCapacity && this.status === 'full') {
        this.status = 'active'; // Si des colis sont retirés, il redevient actif
    }
    next();
});

module.exports = mongoose.model('RelayPoint', RelayPointSchema);