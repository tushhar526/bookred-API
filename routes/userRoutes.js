const userController = require("../controllers/usercontrollers");
const express = require("express");
// const router = require("./bookRoutes");
const upload = userController.upload;
router = express.Router();

// router.get("/:id?",user);

//Get URLs
router.get('/likedbooks/:userID', userController.getlikedbooks);

router.get('/bookmark/:userID', userController.getbookmarkedbooks);

router.get('/readbook/:userID', userController.getreadbooks);

router.get('/followedAuthor/:userID', userController.getFollowedAuthor);

router.get("/currentlyReading/:userID", userController.GetCurrentlyReadingBook);


//Put URL
router.put("/updateName/:userId", userController.changeUsername);

router.put("/updateEmail/:userId", userController.changeEmail);


//Post URLs

router.post("/upload/:userID", upload.single('profile_pic'), userController.uploadProfilePic);

router.post("/currentlyReading/:userID", userController.AddToCurrentlyReading);


//Delete URLs

router.delete("/removePFP/:userID", userController.deleteProfilePicture);

module.exports = router