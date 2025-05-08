const User = require("../models/users");
const books = require("../models/books");
const path = require("path");
const { deleteUserProfilePictureById } = require("../utility/deleteFromDrive");
const uploadToDrive = require("../utility/uploadToDrive");
const multer = require("multer");
const fs = require('fs');
const mongoose = require("mongoose");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        return cb(null, path.join(__dirname, '..', 'upload', "temp"));

    },
    filename: function (req, file, cb) {

        const userID = req.params.userID;
        const ext = path.extname(file.originalname);
        console.log("this is ext = ", ext);
        return cb(null, `${userID}${ext}`)

    }
});

function extractFileId(url) {
    const regex = /id=([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

const upload = multer({ storage: storage })

const getRandomBooks = async (req, res) => {
    try {
        // Use MongoDB's aggregation to randomly select 10 books
        const randomBooks = await books.aggregate([
            { $sample: { size: 10 } } // Randomly sample 10 documents
        ]);

        if (randomBooks.length === 0) {
            return res.status(404).json({ message: "No books found" });
        }

        return res.status(200).json({ message: "Random books fetched successfully", data: randomBooks });
    } catch (error) {
        console.error("Error fetching random books:", error.message);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

const getbookmarkedbooks = async (req, res) => {
    const userID = req.params.userID;

    try {
        const user = await User.findById(userID);
        if (!user) {
            console.log("No user found")
            return res.status(404).json({ message: "User not found" });
        }
        const userBooks = await User.findById(userID).populate({
            path: "bookmarks",
            populate: {
                path: "writer.author", // If you need the author name from another model
                select: "name role",        // Select only the author's name field
            },
        });

        formattedBooks = userBooks.bookmarks.map((book) => {
            const author = book.writer?.filter((w) => w.role === "Author" && w.author.name).map((w) => w.author.name);
            return {
                _id: book._id,
                bookname: book.bookname,
                image: book.image,
                author: author.length > 0 ? author.join(",") : "Unknown",
            }
        })

        return res.status(200).json(formattedBooks);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

const getreadbooks = async (req, res) => {
    const userID = req.params.userID;

    try {
        const user = await User.findById(userID);
        if (!user) {
            console.log("No user found")
            return res.status(404).json({ message: "User not found" });
        }
        const userBooks = await User.findById(userID).populate({
            path: "readbooks",
            populate: {
                path: "writer.author", // If you need the author name from another model
                select: "name role",        // Select only the author's name field
            },
        });

        formattedBooks = userBooks.readbooks.map((book) => {
            const author = book.writer?.filter((w) => w.role === "Author" && w.author.name).map((w) => w.author.name);
            return {
                _id: book._id,
                bookname: book.bookname,
                image: book.image,
                author: author.length > 0 ? author.join(",") : "Unknown",
            }
        })

        return res.status(200).json(formattedBooks);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

const getFollowedAuthor = async (req, res) => {
    const userID = req.params.userID;

    try {
        // Check if the user exists
        const user = await User.findById(userID);
        if (!user) {
            console.log("No user found")
            return res.status(404).json({ message: "User not found" });
        }

        const userauthor = await User.findById(userID).populate({
            path: "followedauthors",
            select: "_id name image",
        });

        // formattedBooks = userBooks.likedbooks.map((book) => {
        //     const author = book.writer?.filter((w) => w.role === "Author" && w.author.name).map((w) => w.author.name);
        //     return {
        //         _id: book._id,
        //         bookname: book.bookname,
        //         image: book.image,
        //         author: author.length > 0 ? author.join(",") : "Unknown",
        //     }
        // })

        return res.status(200).json(userauthor.followedauthors);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

const getlikedbooks = async (req, res) => {
    const userID = req.params.userID;

    try {
        const user = await User.findById(userID);
        if (!user) {
            console.log("No user found")
            return res.status(404).json({ message: "User not found" });
        }
        const userBooks = await User.findById(userID).populate({
            path: "likedbooks",
            populate: {
                path: "writer.author", // If you need the author name from another model
                select: "name role",        // Select only the author's name field
            },
        });

        formattedBooks = userBooks.likedbooks.map((book) => {
            const author = book.writer?.filter((w) => w.role === "Author" && w.author.name).map((w) => w.author.name);
            return {
                _id: book._id,
                bookname: book.bookname,
                image: book.image,
                author: author.length > 0 ? author.join(",") : "Unknown",
            }
        })

        return res.status(200).json(formattedBooks);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

const uploadProfilePic = async (req, res) => {

    try {
        const { userID } = req.params;
        const filepath = req.file.path;
        const filename = req.file.originalname;

        const isUser = await User.findById(userID);

        if (!isUser) {
            return res.status(404).json({ message: "No Such User found" });
        }

        const publicURL = await uploadToDrive(filepath, filename);

        const updatedUser = await User.findByIdAndUpdate(userID, { profilePicture: publicURL }, { new: true });

        fs.unlinkSync(filepath);

        return res.status(200).json({ message: "User Profile Picture Uploaded Successfully", updatedUser })


    }
    catch (error) {
        console.error("\nError occured = ", error);
        res.status(500).send("Something went wrong");
    }

};

const deleteProfilePicture = async (req, res) => {
    try {
        const { userID } = req.params;

        const isUser = await User.findById(userID);

        if (!isUser) {
            return res.status(404).json({ message: "No Such User found" });
        }

        const fileUrl = isUser.profilePicture;
        const fileId = extractFileId(fileUrl);

        if (!fileId) {
            return res.status(404).json({ message: "No profile picture to delete" });
        }

        const result = await deleteUserProfilePictureById(fileId);

        if (!result.success) {
            return res.status(500).json({ message: result.message });
        }

        const updatedUser = await User.findByIdAndUpdate(userID, { profilePicture: null }, { new: true });

        return res.status(200).json({
            message: "User Profile Picture Deleted Successfully",
            updatedUser,
        });

    } catch (error) {
        console.error("Error occurred while Deleting Profile Picture =", error);
        res.status(500).send("Something went wrong");
    }
};

const changeUsername = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newName } = req.body;

        console.log('Received userId:', userId);
        console.log('Received newName:', newName);

        if (!newName || typeof newName !== 'string' || newName.trim().length === 0) {
            return res.status(400).json({ message: 'Invalid username. Please provide a valid name.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username: newName }, // Check your schema!
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            message: 'Username updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const changeEmail = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newEmail } = req.body;

        console.log('Received userId:', userId);
        console.log('Received newName:', newEmail);

        if (!newEmail || typeof newEmail !== 'string' || newEmail.trim().length === 0) {
            return res.status(400).json({ message: 'Invalid username. Please provide a valid Email.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { email: newEmail }, // Check your schema!
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            message: 'Email updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const AddToCurrentlyReading = async (req, res) => {
    const { userID } = req.params;
    const { bookID, completionDate } = req.body;

    try {
        const user = User.findOne(userID);

        user.currentlyReading = {
            book: bookID,
            completionDate: completionDate ? new Date(completionDate) : new Date(new Date().setDate(new Date().getDate() + 1))
        }

        await user.save();

        return res.status(200).json({ message: "Book Added to Currently Reading", val: true })
    }
    catch (error) {
        console.error("Error occured while adding the currently reading book = ", error),
            res.status(500).json({ message: "Error occured in Adding currently reading book", error: error })
    }
}

const GetCurrentlyReadingBook = async (req, res) => {
    const userID = { _id: new mongoose.Types.ObjectId(req.params.userID) };
    try {
        const user = await User.findOne({ _id: userID }).
            populate({
                path: "currentlyReading.book",
                populate: {
                    path: "writer.author",
                    select: "name"
                },
                select: "bookname writer image"
            });

        if (!user || !user.currentlyReading.book) {
            return res.status(200).json({ message: "No book is currently being read", currentlyReading: null, completionDate: null });
        }

        const CurrentlyReadingBook = user.currentlyReading.book;
        const date = user.currentlyReading.completionDate;
        return res.status(200).json({ currentlyReading: CurrentlyReadingBook, completionDate: date })
    }
    catch (error) {
        console.error("Error Occured while getting currently reading book = ", error);
        res.status(500).json({ message: "Error occured in getting currently reading book", error: error })
    }
}


module.exports = {
    getreadbooks,
    getRandomBooks,
    storage,
    upload,
    getreadbooks,
    getlikedbooks,
    changeEmail,
    changeUsername,
    getFollowedAuthor,
    getbookmarkedbooks,
    deleteProfilePicture,
    uploadProfilePic,
    AddToCurrentlyReading,
    GetCurrentlyReadingBook
}