const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");//for listing
const{validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");



//Reviews --reviews ke andar hum ek post route create kar rahe hai matlab woh reviews ka post route hai--
//Post review Route
router.post("/",
    isLoggedIn,
    validateReview,//schema.js file  as an middlewale use this line for review aur niche async ke pahle  wrapasync kiya
    wrapAsync(reviewController.createReview)
);

// Delete Review Route
router.delete(
    "/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;