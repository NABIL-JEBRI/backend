// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Pour le hachage des mots de passe

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: function() { return !this.googleId && !this.facebookId; },
        unique: true,
        trim: true,
        minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
        sparse: true
    },
    email: {
        type: String,
        required: [true, 'L\'adresse email est requise'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Veuillez entrer une adresse email valide']
    },
    password: {
        type: String,
        required: function() { return !this.googleId && !this.facebookId; },
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
        select: false
    },
    role: {
        type: String,
        enum: ['client', 'seller', 'admin'],
        default: 'client'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1/default_avatar.png' // Pensez à remplacer par votre URL par défaut
    },
    phone: { // Numéro de téléphone principal de l'utilisateur
        type: String,
        trim: true,
        match: [/^\d{8}$/, 'Veuillez entrer un numéro de téléphone valide (8 chiffres)']
    },
    // Réfère aux adresses stockées dans le modèle Address.js séparé
    addresses: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Address'
        }
    ],
    // Champs pour l'authentification OAuth (Google, Facebook)
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true
    },
    // Champs spécifiques au vendeur
    sellerInfo: {
        isApproved: { type: Boolean, default: false },
        applicationDate: { type: Date },
        approvedDate: { type: Date },
        // Vous pouvez ajouter d'autres champs ici comme bankAccountDetails, etc.
    }
}, {
    timestamps: true
});

// Middleware Mongoose pour hacher le mot de passe avant de sauvegarder
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.googleId || this.facebookId) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Méthode Mongoose pour comparer les mots de passe
UserSchema.methods.matchPassword = async function (enteredPassword) {
    if (this.googleId || this.facebookId) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);