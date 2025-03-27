const genrecontrollers = require("../controllers/genrecontrollers");
const express = require("express");
const router = express.Router();

router.get("/random",genrecontrollers.getRandomGenre);

router.get("/:id?", genrecontrollers.getGenre);

router.patch('/edit/:id', genrecontrollers.editGenreApp);

router.put('/edit/:id', genrecontrollers.editGenreApp);

router.get('/book/:genreId', genrecontrollers.getBooksByGenre);

router.post("/add", genrecontrollers.addGenre);

router.delete("/delete/:id",genrecontrollers.deleteGenre);

module.exports = router;