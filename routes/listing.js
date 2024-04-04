const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");//for listing
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage});


router
    .route("/")
    .get(wrapAsync(listingController.index)) //index route
    .post( //create route
        isLoggedIn,
        upload.single('listing[image]'), //multer
        validateListing, //schema.js file  as an middlewale use this line

        wrapAsync(listingController.createListing)
    );
 
//new Route
router.get("/new", isLoggedIn, listingController.renderNewform);

router
    .route("/:id")
    .get( //show route
        wrapAsync(listingController.showListing)
    )
    .put( //update route 
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"), //multer
        validateListing,
        wrapAsync(listingController.updateListing)
        )
    .delete( //delete route
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );



//Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;