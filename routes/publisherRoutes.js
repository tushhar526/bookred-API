const publishercontroller = require("../controllers/publishercontroller");
const express = require("express");
router = express.Router();

router.get("/:id?",publishercontroller.getPublisher);

router.post("/add",publishercontroller.addPublisher);

router.get('/book/:publisherId', publishercontroller.getBooksByPublisher);

router.delete("/delete/:id",publishercontroller.deletePublisher);

module.exports = router