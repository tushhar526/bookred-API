const authorcontrollers = require("../controllers/authorcontrollers");
const express = require("express");
router = express.Router();

router.get("/", authorcontrollers.getAllAuthor);

router.get("/app", authorcontrollers.getAllAuthorapp);

router.get("/app/:id", authorcontrollers.getAuthorbyid);  // For All User which are not loged-in

router.get("/books/:authorID", authorcontrollers.getBooksByAuthor);

router.get("/random", authorcontrollers.getRandomAuthor);

// router.post("/add", authorcontrollers.upload.single("image") ,authorcontrollers.addauthor);

router.post("/add", authenticateUser, authorizeRole("Admin"), authorcontrollers.addAuthorApp);

router.post("/follow/:authorID", authorcontrollers.followAuthor);

router.post("/app/:authorID?", authorcontrollers.getAuthorById) // for loged in Users 

router.patch("/edit/:id", authenticateUser, authorizeRole("Admin"), authorcontrollers.editAuthorApp);

router.delete("/delete/:id", authenticateUser, authorizeRole("Admin"), authorcontrollers.deleteAuthor);

module.exports = router;