const Author = require("../models/authors");
const Book = require("../models/books");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const Users = require("../models/users");
// const { default: AuthorModel } = require("../../src/AuthorModel");

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        return cb(null, path.join(__dirname, "..", "upload", "author_image"));

    },

    filename: function (req, file, cb) {

        return cb(null, `${Date.now()}-${file.originalname}`);

    }

})

const upload = multer({ storage: storage });

const getAllAuthor = async (req, res) => {

    try {

        const authors = await Author.find();
        res.status(200).json(authors);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Internal Server error" })

    }

}

const deleteAuthor = async (req, res) => {
    try {
        const { id } = req.params;

        const deleteauthor = await Author.findByIdAndDelete(id);

        if (!deleteauthor) {
            return res.status(404).json({ error: "Author Not Found" });
        }

        return res.status(200).json({ message: "Author Deleted successfully" });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const addAuthor = async (req, res) => {
    try {
        const { name, about, follower, facebook, twitter, instagram, website, birthdate } = req.body;
        const image = req.file ? req.file.path : null;

        if (!name || !about || !image) {
            return res.status(400).json({ error: "Name, about, and image are required" });
        }

        const newauthor = await Author.create({
            name,
            image,
            about,
            follower: follower || 0,
            socialMediaLinks: { facebook, twitter, instagram, website },
            birthdate,
        });

        res.status(201).json({ message: "Author Added", author: newauthor });

    } catch (error) {
        console.error("Error = ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const addAuthorApp = async (req, res) => {
    try {
        const { name, about, follower, facebook, twitter, instagram, linkedin, birthdate, image } = req.body;

        // Validate required fields
        if (!name || !about || !image) {
            return res.status(400).json({ error: "Name, about, and image are required" });
        }

        // Create a new author document
        const newAuthor = await Author.create({
            name,
            image,  // Assuming image is passed as a URL or a path to the image
            about,
            follower: follower || 0,
            socialMedia: { facebook, twitter, instagram, linkedin },  // Social media fields
            birthdate,
        });

        // Send a success response
        res.status(201).json({ message: "Author Added", author: newAuthor });

    } catch (error) {
        console.error("Error =", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getBooksByAuthor = async (req, res) => {
    try {
        const { authorID } = req.params;

        // 1. Get the author details
        const author = await Author.findById(authorID).select('_id name');

        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }

        // 2. Get the books written by this author
        const books = await Book.find({
            'writer.author': authorID
        }).select("_id bookname image writer").populate({ path: "writer.author", select: "name role" }).lean(); // <-- lean() makes it plain JS objects so we can modify them easily

        // if (!books || books.length === 0) {
        //     return res.status(404).json({ message: "No books found for this author" });
        // }

        // 3. Add author info inside each book
        const booksWithAuthor = books.map(({ _id, bookname, image, writer }) => {
            const author = writer?.filter((w) => w.role === "Author" && w.author?.name).map((w) => w.author.name);
            return {
                _id,
                bookname,
                image,
                author: author.length > 0 ? author.join(", ") : "Unknown",
            }
        })

        // 4. Send response
        res.status(200).json(booksWithAuthor);

    } catch (error) {
        console.log("Error occurred while getting books by author ID =", error);
        res.status(500).json({ message: error.message });
    }
};

const getRandomAuthor = async (req, res) => {
    try {
        const count = await Author.countDocuments();
        const limit = Math.min(count, 10);

        const randomAuthor = await Author.aggregate([
            { $sample: { size: limit } },
            { $project: { _id: 1, name: 1, image: 1 } }
        ]);

        res.status(200).json(randomAuthor);
    } catch (error) {
        console.error("Error retrieving random Authors:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// const getAuthorapp = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (id) {
//             // Retrieve a single author by ID
//             const author = await Author.findById(id);

//             if (!author) {
//                 return res.status(404).json({ message: 'Author not found' });
//             }

//             return res.status(200).json(author);
//         }

//         // Retrieve all authors
//         const authors = await Author.find();
//         // .populate('genre');
//         return res.status(200).json(authors);
//     } catch (error) {
//         console.error("Error =", error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

const getAuthorById = async (req, res) => {
    try {
        const authorID = req.params.authorID;
        const userID = req.body.userID;

        const user = await Users.findById(userID).select("followedauthors");
        const author = await Author.findById(authorID);

        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        const listedbooks = await Book.countDocuments({ "writer.author": authorID });
        const isauthorfollowed = user.followedauthors.includes(authorID);

        const authorObj = author.toObject();
        authorObj.listedbooks = listedbooks;
        authorObj.isfollowed = isauthorfollowed;

        return res.status(200).json(authorObj);

    }
    catch (error) {
        console.error("Error Occured in getting Author by ID = ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAllAuthorapp = async (req, res) => {
    try {
        const authors = await Author.find().select("_id name image");
        return res.status(200).json(authors);
    } catch (error) {
        console.error("Error =", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const editAuthorApp = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, about, follower, facebook, twitter, instagram, linkedin, birthdate, image } = req.body;

        // Find the author by ID
        const author = await Author.findById(id);
        if (!author) {
            console.log("No author Found in author edit")
            return res.status(404).json({ error: "Author not found" });
        }

        author.name = name || author.name;
        author.about = about || author.about;
        author.image = image || author.image;
        author.follower = follower !== undefined ? follower : author.follower;
        author.birthdate = birthdate || author.birthdate;

        author.socialMedia = {
            facebook: facebook || author.socialMedia.facebook,
            twitter: twitter || author.socialMedia.twitter,
            instagram: instagram || author.socialMedia.instagram,
            linkedin: linkedin || author.socialMedia.linkedin,
        };

        // Save the updated author
        const updatedAuthor = await author.save();

        res.status(200).json({ message: "Author updated successfully", author: updatedAuthor });
    } catch (error) {
        console.error("Error =", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const followAuthor = async (req, res) => {
    const { authorID } = req.params;
    const { isfollowed, userId, follower } = req.body;

    try {
        // Fetch the user first
        const user = await Users.findById(userId).select("followedauthors");
        if (!user) {
            console.log("Yaha Par galat hua hai bhai userID me")
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch the author next
        const author = await Author.findById(authorID).select("follower");
        if (!author) {
            console.log("Yaha Par galat hua hai bhai authorID me")
            return res.status(404).json({ message: "Author not found" });
        }

        const updateUser = {};
        const updateAuthor = { $set: {} };

        const isAlreadyFollowed = user.followedauthors.includes(authorID);

        console.log("Is followed = ", isfollowed, " isAlreadyFollowed = ", isAlreadyFollowed);

        if (isfollowed && isAlreadyFollowed) {
            // Unfollow logic
            updateUser.$pull = { followedauthors: authorID };
            updateAuthor.$set.follower = follower > 0 ? follower - 1 : 0;
        } else if (!isfollowed && !isAlreadyFollowed) {
            // Follow logic
            updateUser.$push = { followedauthors: authorID };
            updateAuthor.$set.follower = follower + 1;
        } else {
            console.log("Yaha Par galat hua hai bhai")
            return res.status(400).json({ message: "Invalid follow state" });
        }

        // Only update if changes are needed
        const updates = [];

        if (Object.keys(updateUser).length)
            updates.push(Users.findByIdAndUpdate(userId, updateUser));

        if (Object.keys(updateAuthor.$set).length)
            updates.push(Author.findByIdAndUpdate(authorID, updateAuthor));

        await Promise.all(updates);

        // Fetch the updated author follower count
        const updatedAuthor = await Author.findById(authorID).select("follower");

        res.json({
            message: "Follow status updated successfully",
            followerCount: updatedAuthor.follower
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

const getAuthorbyid = async (req, res) => {

    try {

        const authorID = req.params.id;

        const author = await Author.findById(authorID);
        if (!author) {
            return res.status(404).json({ message: "Author Not Found" });
        }

        const listedbooks = await Book.countDocuments({ "writer.author": authorID });
        const authorObj = author.toObject();
        authorObj.listedbooks = listedbooks;

        return res.status(200).json(authorObj);

    }
    catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });

    }

}

module.exports = { addAuthor, addAuthorApp, editAuthorApp, getAuthorById, getRandomAuthor, getAllAuthorapp, upload, getAllAuthor, deleteAuthor, getAuthorbyid, getBooksByAuthor, followAuthor };


