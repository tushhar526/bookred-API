const Comment = require('../models/comments');
const mongoose = require('mongoose');
const Book = require('../models/books');
// const { Message } = require('@mui/icons-material');
const comments = require('../models/comments');


const addComment = async (req, res) => {
    try {
        const { bookID } = req.params;
        const { userId, comment } = req.body;

        // Validate inputs
        if (!bookId || !userId || !comment) {
            console.log("Error bruhh you didn't give me something I needed");
            return res.status(400).json({ message: "bookId, userId, and comment are required.", status: false });
        }

        // Create a new comment
        const newComment = await Comment.create({
            userId,
            bookID,
            comment,
        });

        // Update the book with the new comment
        const updatedBook = await Book.findByIdAndUpdate(
            bookID,
            { $push: { comments: newComment._id } },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found.", status: false });
        }

        // Populate the user details inside the comment (specifically profilePicture)
        const populatedComment = await Comment.findById(newComment._id)
            .populate('userId', 'username profilePicture'); // Replace 'username' if you want more fields

        res.status(200).json({
            message: "Comment added successfully",
            status: true,
            comment: populatedComment
        });

    } catch (error) {
        console.error("Error =", error);
        res.status(500).json({
            message: "Error adding comment",
            status: false,
            error: error.toString()
        });
    }
};


const getallComments = async (req, res) => {    
    try {
        const { bookId } = req.params;

        // Validate if bookId is provided
        if (!bookId) {
            return res.status(400).json({ message: "Book ID is required." });
        }

        // Find the book and populate its comments, also populate user details from the User model
        const book = await Book.findById(bookId).populate({
            path: "comments",
            populate: {
                path: "userId", // This references the User model
                model: "User", // Explicitly mention the model if needed
                select: "username profilePicture", // ✅ Fetch username & profilePicture
            },
        });

        // Handle case when book is not found
        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Format response with necessary details
        const commentsWithUserDetails = book.comments.map(comment => ({
            _id: comment._id,
            comment: comment.comment,
            createdAt: comment.createdAt,
            user: comment.userId
                ? {
                    _id: comment.userId._id,
                    username: comment.userId.username, // ✅ Get username
                    profilePicture: comment.userId.profilePicture || null   , // ✅ Get profile picture
                }
                : null, // Handle case where userId is missing
        }));

        res.status(200).json(commentsWithUserDetails);
    } catch (error) {
        console.error("Error fetching comments =", error);
        res.status(500).json({ message: "An error occurred", error: error.toString() });
    }
};


module.exports = { getallComments, addComment }