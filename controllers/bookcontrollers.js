const Book = require('../models/books');
const author = require("../models/authors")
const mongoose = require('mongoose');
// const genre = require("../models/genre");
const multer = require("multer");
const path = require("path");
const User = require('../models/users');
const transformBooks = require('../transformBooks');
const { response } = require('express');

const getAllBooksweb = async (req, res) => {
  try {

    let books = await Book.find()
      .populate('author')
      .lean();
    books = books.map(book => {
      if (book.image) {
        let imagePath = book.image.split("\\").pop();
        book.image = `${req.protocol}://${req.get('host')}/upload/book_image/${imagePath}`;
      }
      return book;
    });
    res.status(200).json(books);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });

  }
};

const getBookByIdweb = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookid).populate('author').lean();
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Format the image URL
    if (book.image) {
      let imagePath = book.image.split("\\").pop();
      book.image = `${req.protocol}://${req.get('host')}/upload/book_image/${imagePath}`;
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    return cb(null, path.join(__dirname, '..', 'upload', "book_image"));

  },
  filename: function (req, file, cb) {

    return cb(null, `${Date.now()}-${file.originalname}`)

  }
});

const upload = multer({ storage: storage })

const addBook = async (req, res) => {
  try {
    // Destructure the request body
    const {
      bookname,
      image,
      writer, // Change 'author' to 'writer' to match the new structure
      publicationDate,
      language,
      series,
      synopsis,
      publisher,
      genre,
      pages,
      isbn
    } = req.body;

    // Validate required fields
    if (!bookname || !image || !writer || !publisher || !genre || !synopsis || !pages || !isbn) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate writer structure
    if (!Array.isArray(writer) || writer.length === 0) {
      return res.status(400).json({ message: 'Writer must be a non-empty array.' });
    }

    // Ensure each writer entry has an author and role
    for (const w of writer) {
      if (!w.author || !w.role) {
        return res.status(400).json({ message: 'Each writer entry must have an author ID and a role.' });
      }
    }

    // Create a new book instance
    const newBook = new Book({
      bookname,
      image,
      writer, // Use the updated writer structure
      publicationDate: publicationDate ? new Date(publicationDate) : undefined,
      language,
      series,
      synopsis,
      publisher,
      genre,
      pages,
      isbn
    });

    // Save the book to the database
    const savedBook = await newBook.save();

    // Respond with the saved book data
    res.status(201).json({
      message: 'Book added successfully',
      book: savedBook
    });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// const getBookapp = async (req, res) => {
//   try {
//     let books;

//     books = await Book.find()
//       .populate({
//         path: 'writer.author',
//         select: 'name role'
//       })
//       .lean();

//     const responseBooks = transformBooks(books);

//     responseBooks.forEach(book => delete book.writer);

//     return res.status(200).json(responseBooks);
//   } catch (error) {
//     console.error("Error =", error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

const getBookByIdWithUserStatus = async (req, res) => {
  const { bookID, userID } = req.body;

  if (!bookID || !userID) {
    return res.status(400).json({ message: "Both bookID and userID are required" });
  }

  try {
    const [user, book] = await Promise.all([
      User.findById(userID),
      Book.findById(bookID)
        .populate({
          path: 'writer.author', // Populate the author inside writer
          select: 'name role'    // Select only name and role fields
        })
        .lean()
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!book) return res.status(404).json({ message: "Book not found" });

    const isLiked = user.likedbooks.includes(bookID);
    const isDisliked = user.dislikedbooks?.includes(bookID) ?? false;

    // Ensure 'dislike' and 'like' fields exist in the book object
    const likeCount = book.like ?? 0;
    const dislikeCount = book.dislike ?? 0;

    // Transform the book data to include an 'authors' field like in getBookapp
    const authors = book.writer?.filter(writer => writer.role === 'Author' && writer.author?.name)
      .map(writer => ({
        name: writer.author.name,
        role: writer.role
      })) ?? [];

    const transformedBook = {
      ...book,
      like: likeCount,
      dislike: dislikeCount,
      authors // Add authors to the response
    };

    return res.status(200).json({
      isLiked,
      isDisliked,
      book: transformedBook
    });

  } catch (error) {
    console.log("Error we got is this = ", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getBookapp = async (req, res) => {
  try {
    const books = await Book.find()
      .select("_id bookname image writer") // Fetch only necessary fields
      .populate({
        path: "writer.author",
        select: "name role",
      })
      .lean();

    const responseBooks = books.map(({ _id, bookname, image, writer }) => {
      const authors = writer
        ?.filter((w) => w.role === "Author" && w.author?.name) // Filter authors
        .map((w) => w.author.name); // Extract names

      return {
        _id,
        bookname,
        image,
        author: authors.length > 0 ? authors.join(", ") : "Unknown", // Join multiple authors
      };
    });

    return res.status(200).json(responseBooks);
  } catch (error) {
    console.error("Error =", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const getBookByIdWithUserStatus = async (req, res) => {
//   const { bookID, userID } = req.body;

//   if (!bookID || !userID) {
//     return res.status(400).json({ message: "Both bookID and userID are required" });
//   }

//   try {
//     const [user, book] = await Promise.all([
//       User.findById(userID),
//       Book.findById(bookID)
//         .populate({
//           path: 'writer.author',
//           select: 'name role'
//         })
//         .populate({
//           path: 'genre',
//           select: 'name'
//         }).populate({
//           path: 'publisher',
//           select: 'name'
//         })
//         .lean()
//     ]);

//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (!book) return res.status(404).json({ message: "Book not found" });

//     const isLiked = user.likedbooks.includes(bookID);
//     const isDisliked = user.dislikedbooks?.includes(bookID) ?? false;

//     const likeCount = book.like ?? 0;
//     const dislikeCount = book.dislike ?? 0;

//     const authors = book.writer?.filter(writer => writer.role === 'Author' && writer.author?.name)
//       .map(writer => ({
//         name: writer.author.name,
//         role: writer.role
//       })) ?? [];

//     const translators = book.writer?.filter(writer => writer.role === 'Translator' && writer.author?.name)
//       .map(writer => ({
//         name: writer.author.name,
//         role: writer.role
//       })) ?? [];

//     const publisher = book.publisher?.map(p => p.name) ?? []

//     const genres = book.genre?.map(g => g.name) ?? [];

//     const { writer, ...bookWithoutWriter } = book;

//     const transformedBook = {
//       ...bookWithoutWriter,
//       like: likeCount,
//       dislike: dislikeCount,
//       authors,
//       translators,
//       publisher: publisher,
//       genre: genres,
//     };


//     // const transformedBook = {
//     //   ...book,
//     //   like: likeCount,
//     //   dislike: dislikeCount,
//     //   authors,
//     //   translators,
//     //   genre: genres
//     // };

//     return res.status(200).json({
//       isLiked,
//       isDisliked,
//       book: transformedBook
//     });
//   } catch (error) {
//     console.log("Error we got is this = ", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

const getBookByIdWithUserStatus = async (req, res) => {
  const { bookID, userID } = req.body;

  if (!bookID || !userID) {
    return res.status(400).json({ message: "Both bookID and userID are required" });
  }

  try {
    const [user, book] = await Promise.all([
      User.findById(userID).select("likedbooks dislikedbooks bookmarks readbooks"),
      Book.findById(bookID)
        // .select("-name -image -writer.author") // Exclude fields already received from getBookapp
        .populate({ path: "writer.author", select: "name role image" }) // Include author image
        .populate({ path: "genre", select: "name" })
        .populate({ path: "publisher", select: "_id name logo" }) // Include publisher image
        .lean(),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!book) return res.status(404).json({ message: "Book not found" });

    const isLiked = user.likedbooks.includes(bookID);
    const isbookmarked = user.bookmarks.includes(bookID);
    const isread = user.readbooks.includes(bookID);
    const isDisliked = user.dislikedbooks?.includes(bookID) ?? false;

    const transformedBook = {
      ...book,
      like: book.like ?? 0,
      dislike: book.dislike ?? 0,
      authors: book.writer
        ?.filter((writer) => writer.role === "Author" && writer.author?.name)
        .map((writer) => ({
          id: writer.author._id,
          name: writer.author.name,
          role: writer.role,
          // image: writer.author.image || null, // Ensure image is included
        })) ?? [],
      translators: book.writer
        ?.filter((writer) => writer.role === "Translator" && writer.author?.name)
        .map((writer) => ({
          name: writer.author.name,
          role: writer.role,
          image: writer.author.image || null, // Ensure image is included
        })) ?? [],
      publisher: book.publisher?.map((p) => ({
        id: p._id,
        name: p.name,
        image: p.logo || null, // Ensure image is included
      })) ?? [],
      genre: book.genre?.map((g) => g.name) ?? [],
    };

    return res.status(200).json({ isLiked, isDisliked, isbookmarked, isread, book: transformedBook });
  } catch (error) {
    console.error("Error we got is this =", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const bookmarkBook = async (req, res) => {
  const { bookID } = req.params;
  const { isBookmarked, userId } = req.body;

  console.log("Request body = ", req.body)

  try {
    // Fetch the user first
    const user = await User.findById(userId).select("bookmarks");
    if (!user) {
      console.log("User not found with this userId");
      return res.status(404).json({ message: "User not found" });
    }

    const updateUser = {};

    const isAlreadyBookmarked = user.bookmarks.includes(bookID);

    console.log("isBookmarked =", isBookmarked, " isAlreadyBookmarked =", isAlreadyBookmarked);

    if (isBookmarked && isAlreadyBookmarked) {

      updateUser.$pull = { bookmarks: bookID };

    } else if (!isBookmarked && !isAlreadyBookmarked) {

      updateUser.$push = { bookmarks: bookID };

    } else {
      console.log("Invalid bookmark state");
      return res.status(400).json({ message: "Invalid bookmark state" });
    }

    // Update user bookmarks
    await User.findByIdAndUpdate(userId, updateUser);

    // Return the updated state to the client
    res.json({
      message: "Bookmark status updated successfully",
      isBookmarked: !isBookmarked // flipped because we just updated it
    });

  } catch (err) {
    console.error("Error bookmarking the book:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const addToRreadList = async (req, res) => {
  const { bookID } = req.params;
  const { isRead, userId } = req.body;

  console.log("Request body = ", req.body)

  try {
    // Fetch the user first
    const user = await User.findById(userId).select("readbooks");
    if (!user) {
      console.log("User not found with this userId");
      return res.status(404).json({ message: "User not found" });
    }

    const updateUser = {};

    const isAlreadyRead = user.readbooks.includes(bookID);

    console.log("isBookmarked =", isRead, " isAlreadyBookmarked =", isAlreadyRead);

    if (isRead && isAlreadyRead) {

      updateUser.$pull = { readbooks: bookID };

    } else if (!isRead && !isAlreadyRead) {

      updateUser.$push = { readbooks: bookID };

    } else {
      console.log("Invalid bookmark state");
      return res.status(400).json({ message: "Invalid bookmark state" });
    }

    // Update user bookmarks
    await User.findByIdAndUpdate(userId, updateUser);

    // Return the updated state to the client
    res.json({
      message: "Bookmark status updated successfully",
      isRead: !isRead // flipped because we just updated it
    });

  } catch (err) {
    console.error("Error bookmarking the book:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateBook = async (req, res) => {
  const { id } = req.params;
  const { bookname, author, image, publisherId, publisher } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid book ID' });
  }

  const updateFields = {};
  if (bookname) updateFields.bookname = bookname;
  if (author) updateFields.author = author;
  if (image) updateFields.image = image;

  const updateOperation = {};
  if (Object.keys(updateFields).length > 0) {
    updateOperation.$set = updateFields;
  }

  if (publisherId) {
    updateOperation.$addToSet = { publisher: publisherId }; // adds to array
  }

  if (publisher) {
    updateFields.publisher = publisher; // replaces entire array
    updateOperation.$set = updateFields; // overwrites previous $set if necessary
  }

  try {
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      updateOperation,
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(updatedBook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const getRandomBooks = async (req, res) => {
  try {
    const count = await Book.countDocuments();
    const limit = Math.min(count, 10);

    const randomBooks = await Book.aggregate([{ $sample: { size: limit } }]);

    // Populate writer.author to get author details
    const populatedBooks = await Book.populate(randomBooks, {
      path: "writer.author",
      select: "name role",
    });

    // Transform books to extract only bookname, image, and author
    const responseBooks = populatedBooks.map(({ _id, bookname, image, writer }) => {
      const authors = writer
        ?.filter((w) => w.role === "Author" && w.author?.name) // Filter only authors
        .map((w) => w.author.name); // Extract names

      return {
        _id,
        bookname,
        image,
        author: authors.length > 0 ? authors.join(", ") : "Unknown", // Handle multiple authors
      };
    });

    res.status(200).json(responseBooks);
  } catch (error) {
    console.error("Error retrieving random books:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteBookById = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getBooksByLike = async (req, res) => {
  try {
    const top = parseInt(req.query.top, 5);

    const likedBooks = await Book.find()
      .sort({ like: -1 })
      .limit(top);
    res.status(200).json(likedBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const likeBook = async (req, res) => {
  const { id: bookId } = req.params;
  const { isLiked, userID: userId } = req.body;

  try {
    const user = await User.findById(userId).select("likedbooks dislikedbooks");
    if (!user) return res.status(404).json({ message: "User not found" });

    const updateUser = {};
    const updateBook = { $set: {} };

    const isAlreadyLiked = user.likedbooks.includes(bookId);
    const isAlreadyDisliked = user.dislikedbooks.includes(bookId);

    if (isLiked) {
      if (!isAlreadyLiked) {
        updateUser.$push = { likedbooks: bookId };
        updateBook.$set.like = 1; // Ensure like stays at max 1
      }
      if (isAlreadyDisliked) {
        updateUser.$pull = { dislikedbooks: bookId };
        updateBook.$set.dislike = 0; // Ensure dislike is removed
      }
    } else if (isAlreadyLiked) {
      updateUser.$pull = { likedbooks: bookId };
      updateBook.$set.like = 0; // Remove like
    }

    // Only update if changes are needed
    const updates = [];
    if (Object.keys(updateUser).length) updates.push(User.findByIdAndUpdate(userId, updateUser));
    if (Object.keys(updateBook.$set).length) updates.push(Book.findByIdAndUpdate(bookId, updateBook));

    await Promise.all(updates);

    const book = await Book.findById(bookId).select("like dislike");
    res.json({ like: book.like, dislike: book.dislike });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const dislikeBook = async (req, res) => {
  const { id: bookId } = req.params;
  const { isDisliked, userID: userId } = req.body;

  try {
    const user = await User.findById(userId).select("likedbooks dislikedbooks");
    if (!user) return res.status(404).json({ message: "User not found" });

    const updateUser = {};
    const updateBook = { $set: {} };

    const isAlreadyLiked = user.likedbooks.includes(bookId);
    const isAlreadyDisliked = user.dislikedbooks.includes(bookId);

    if (isDisliked) {
      if (!isAlreadyDisliked) {
        updateUser.$push = { dislikedbooks: bookId };
        updateBook.$set.dislike = 1; // Ensure dislike stays at max 1
      }
      if (isAlreadyLiked) {
        updateUser.$pull = { likedbooks: bookId };
        updateBook.$set.like = 0; // Ensure like is removed
      }
    } else if (isAlreadyDisliked) {
      updateUser.$pull = { dislikedbooks: bookId };
      updateBook.$set.dislike = 0; // Remove dislike
    }

    // Only update if changes are needed
    const updates = [];
    if (Object.keys(updateUser).length) updates.push(User.findByIdAndUpdate(userId, updateUser));
    if (Object.keys(updateBook.$set).length) updates.push(Book.findByIdAndUpdate(bookId, updateBook));

    await Promise.all(updates);

    const book = await Book.findById(bookId).select("like dislike");
    res.json({ like: book.like, dislike: book.dislike });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// const addBookRating = async (req, res) => {
//     try {
//         const { bookId, rating } = req.body;  // Assuming bookId and rating come from the request body
//         const book = await Book.findById(bookId);

//         if (!book) {
//             return res.status(404).send("Book not found");
//         }


//         await book.addRating(rating);

//         return res.status(200).json({
//             message: "Rating added successfully",
//             averageRating: book.rating.average
//         });
//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// };

module.exports = {
  getAllBooksweb,
  getBookByIdweb,
  getBookapp,
  addBook,
  upload,
  getBookByIdWithUserStatus,
  likeBook,
  addToRreadList,
  bookmarkBook,
  dislikeBook,
  deleteBookById,
  getRandomBooks,
  getBooksByLike,
  updateBook
  // addBookRating
}