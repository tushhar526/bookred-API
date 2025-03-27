const mongoose = require("mongoose");
// const genre = require("./genre");
const author = require("./authors");

const booksSchema = new mongoose.Schema({

    bookname: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    writer: [{
        _id: false,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author', // Refers to the Author collection
            required: true,
        },
        role: {  // Define role for author, translator, or any other contributor
            type: String,
            enum: ['Author', 'Translator'],  // Example roles
            default: 'Author',
        }
    }],
    rating: {
        average: {
            type: Number,
            default: 0,
        },
        count: {
            type: Number,
            default: 0,
        }
    },  
    like: {
        type: Number,
        default: 0,
    },
    dislike: {
        type: Number,
        default: 0,
    },
    publicationDate: {
        type: Date,
    },
    language: {
        type: String,
        default: "English",
    },
    series: {
        name: {
            type: String,
        },
        position: {
            type: Number,
        }
    },            
    synopsis: {
        type: String,
        required: true,
    },
    publisher: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Publisher",
        required: true,
    }],
    genre: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre",
        required: true,
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments",
    }],
    pages: {
        type: Number,
        required: true,
    },
    isbn: {
        type: String,
        unique: true,
        required: true,
    }
    
}
)

booksSchema.methods.addRating = function (newRating) {
    if (newRating <= 5 && newRating >= 0) {
        const totalRating = this.rating.average * this.rating.count;  // Get the total from current average
        const updatedCount = this.rating.count + 1;
        const newAverage = (totalRating + newRating) / updatedCount;

        // Update the rating
        this.rating.average = newAverage;
        this.rating.count = updatedCount;

        return this.save();  // Save the document after updating
    } else {
        throw new Error("Rating must be between 0 and 5");
    }
};

module.exports = mongoose.model("Book", booksSchema);
// module.exports = Books;