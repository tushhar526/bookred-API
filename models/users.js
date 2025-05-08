const mongoose = require("mongoose");
const Schema = mongoose;
const books = require("./books");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    profilePicture: {
        type: String,
    },
    username: {
        type: String,
        required: [true, "Please enter a username"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        sparse: true,
        unique: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please enter a valid email",
        ],
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true,
        match: [
            /^[0-9]{10}$/,
            "Please enter a valid phone number",
        ],
    },
    password: {
        type: String,
        required: [true, "Please enter password"],
        select: false,
    },
    role: {
        type: String,
        enum: ["User", "Admin"],
        default: "User",
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    },
    readbooks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Book",
        },
    ],
    currentlyReading: {
        book: {
            type: Schema.Types.ObjectId,
            ref: "Book"
        },
        completionDate: {
            type: Date
        }
    },
    followedauthors: [
        {
            type: Schema.Types.ObjectId,
            ref: "Author"
        }
    ],
    likedbooks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Book",
        },
    ],
    dislikedbooks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Book",
        },
    ],
    bookmarks: [
        {
            type: Schema.Types.ObjectId,
            ref: "Book",
        },
    ],
});

userSchema.methods.getResetPasswordCode = function () {
    const resetCode = crypto.randomInt(100000, 999999).toString(); // 6-digit random code

    this.resetPasswordCode = resetCode;
    this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes

    return resetCode;
};

userSchema.pre("validate", function (next) {
    if (!this.email && !this.phoneNumber) {
        return next(new Error("Either email or phone number is required"));
    }
    next();
});

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });


module.exports = mongoose.model("User", userSchema);