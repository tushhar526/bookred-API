const authorcontrollers = require("../controllers/authorcontrollers");
const express = require("express");
router = express.Router();

router.get("/", authorcontrollers.getAllAuthor);

router.get("/app", authorcontrollers.getAllAuthorapp);

router.get("/books/:authorID", authorcontrollers.getBooksByAuthor);

router.get("/random",authorcontrollers.getRandomAuthor);

// router.post("/add", authorcontrollers.upload.single("image") ,authorcontrollers.addauthor);

router.post("/add", authorcontrollers.addAuthorApp);

router.post("/follow/:authorID",authorcontrollers.followAuthor);

router.post("/app/:authorID?", authorcontrollers.getAuthorById)

router.patch("/edit/:id", authorcontrollers.editAuthorApp);

router.delete("/delete/:id", authorcontrollers.deleteAuthor);

module.exports = router;