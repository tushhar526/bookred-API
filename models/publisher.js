const mongoose = require("mongoose");

const publisherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    website: {
        type: String, 
    },
    country: {
        type: String, 
    },
    establishedYear: {
        type: Number, 
    },
    socialMedia: {
        twitter: {
            type: String, 
        },
        instagram: {
            type: String, 
        }
    },
    description: {
        type: String, 
    },
    logo: {
        type: String, 
    },
});


module.exports = mongoose.model("Publisher", publisherSchema);

