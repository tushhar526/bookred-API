const express = require('express');
const router = express.Router();
const booksController = require('../controllers/bookcontrollers');
const commentcontrollers = require('../controllers/commentcontrollers');
// const { protect } = require('../controllers/authcontrollers');

// router.get('/',booksController.getAllBooksweb);
// router.get('/:bookid', booksController.getBookByIdweb);

//Get Methods
router.get('/app', booksController.getBookapp);

router.get('/comments/:bookId', commentcontrollers.getallComments);

router.get('/recommend', booksController.getRandomBooks);

//Post Methods
router.post('/add',
    // booksController.upload.single("image"),
    booksController.addBook);

router.post('/comments/:bookId', commentcontrollers.addComment);

router.post('/bookmark/:bookID',booksController.bookmarkBook);

router.post('/readbook/:bookID',booksController.addToRreadList);

router.post('/status',booksController.getBookByIdWithUserStatus);

//Delete Methods
router.delete('/:id', booksController.deleteBookById);

//Patch Method
router.patch("/edit/:id", booksController.updateBook);

router.patch('/like/:id', booksController.likeBook);

router.patch('/dislike/:id', booksController.dislikeBook);

module.exports = router;


