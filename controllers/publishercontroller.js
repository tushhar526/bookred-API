const Publisher = require("../models/publisher");
const Book = require("../models/books");

const addPublisher = async (req, res) => {
    try {
        const {
            name,
            website,
            contactEmail,
            establishedYear,
            socialMedia,
            description,
            country,
            logo,
        } = req.body;

        // Check if the publisher already exists (based on the unique name)
        const existingPublisher = await Publisher.findOne({ name });
        if (existingPublisher) {
            return res.status(400).json({ message: 'Publisher with this name already exists.' });
        }

        // Create a new publisher
        const newPublisher = new Publisher({
            name,
            website,
            contactEmail,
            establishedYear,
            socialMedia,
            description,
            country,
            logo,
        });

        // Save the new publisher to the database
        const savedPublisher = await newPublisher.save();

        // Send a success response
        res.status(201).json({
            message: 'Publisher added successfully!',
            publisher: savedPublisher
        });
    } catch (error) {
        console.error('Error adding publisher:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deletePublisher = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and delete the publisher by ID
        const deletedPublisher = await Publisher.findByIdAndDelete(id);

        // Check if the publisher exists
        if (!deletedPublisher) {
            return res.status(404).json({ error: "Publisher Not Found" });
        }

        return res.status(200).json({ message: "Publisher Deleted Successfully" });
    } catch (error) {
        console.error("Error While Deleting Publisher =", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getPublisher = async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            // Retrieve a single publisher by ID
            const publisher = await Publisher.findById(id);

            if (!publisher) {
                console.log("No publisher found")
                return res.status(404).json({ message: 'Publisher not found' });
            }

            const listedbooks = await Book.countDocuments({ publisher: id });

            const publisherObj = publisher.toObject();
            publisherObj.listedbooks = listedbooks;

            return res.status(200).json(publisherObj);
        }

        // Retrieve all publisher
        const publishers = await Publisher.find();
        return res.status(200).json(publishers);
    } catch (error) {
        console.error("Error =", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getBooksByPublisher = async (req, res) => {
    try {
        const { publisherId } = req.params;

        if (!publisherId) {
            return res.status(400).json({ message: "Publisher ID is required." });
        }

        const books = await Book.find({ publisher: publisherId })
            .select("_id bookname image writer")
            .populate({
                path: "writer.author",
                select: "name", // we only need the author's name
            })
            .lean();

        const booksWithPublisher = books.map(({ _id, bookname, image, writer }) => {
            // Find the first valid author
            const authorData = writer?.find(w => w.role === "Author" && w.author?.name);

            return {
                id: _id,          // ✅ renamed _id to id
                bookname,         // ✅ book name
                image,            // ✅ image URL
                author: authorData 
                    ? authorData.author.name  // ✅ author name as a string
                    : "Unknown"               // ✅ fallback if no author found
            };
        });

        res.status(200).json(booksWithPublisher);
    } catch (error) {
        console.error("Error fetching books by publisher:", error);
        res.status(500).json({
            message: "An error occurred while fetching books by publisher.",
            error: error.message
        });
    }
};


module.exports = { addPublisher, deletePublisher, getPublisher, getBooksByPublisher }