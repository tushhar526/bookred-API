const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },

    actualName: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Author",
        default: null, 
    },

    image: {
        type: String,
        required: true,
    },

    birthdate: {
        type: Date,
    },
    
    about: {
        type: String,
        required: true,
    },
    
    socialMedia: {
        facebook: {
            type: String, // Facebook profile link
        },
        twitter: {
            type: String, // Twitter handle
        },
        instagram: {
            type: String, // Instagram profile
        },
        linkedin: {
            type: String, // LinkedIn profile
        }
    },

    follower: {
        type: Number,
        default: 0,
    }

})

const Author = module.exports = mongoose.model("Author", authorSchema);
module.exports = Author;