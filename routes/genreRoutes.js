const genrecontrollers = require("../controllers/genrecontrollers");
const express = require("express");
const router = express.Router();

router.get("/random", genrecontrollers.getRandomGenre);

router.get("/:id?", genrecontrollers.getGenre);

router.patch('/edit/:id', authenticateUser, authorizeRole("Admin"), genrecontrollers.editGenreApp);

router.put('/edit/:id', authenticateUser, authorizeRole("Admin"), genrecontrollers.editGenreApp);

router.get('/book/:genreId', genrecontrollers.getBooksByGenre);

router.post("/add", authenticateUser, authorizeRole("Admin"), genrecontrollers.addGenre);

router.delete("/delete/:id", authenticateUser, authorizeRole("Admin"), genrecontrollers.deleteGenre);

module.exports = router;