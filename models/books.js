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
            ref: 'Author',
            required: true,
        },
        role: {
            type: String,
            enum: ['Author', 'Translator'],
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
});

// Add method to handle ratings
booksSchema.methods.addRating = function (newRating) {
    if (newRating <= 5 && newRating >= 0) {
        const totalRating = this.rating.average * this.rating.count;
        const updatedCount = this.rating.count + 1;
        const newAverage = (totalRating + newRating) / updatedCount;

        this.rating.average = newAverage;
        this.rating.count = updatedCount;

        return this.save();
    } else {
        throw new Error("Rating must be between 0 and 5");
    }
};

// 🧠 Fix: Ensure average is always sent as a float to frontend
booksSchema.set('toJSON', {
    transform: function (doc, ret) {
        if (ret.rating && typeof ret.rating.average === 'number') {
            ret.rating.average = parseFloat(ret.rating.average.toFixed(1));
        }
        return ret;
    }
});

module.exports = mongoose.model("Book", booksSchema);
