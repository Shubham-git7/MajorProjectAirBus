const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema} = require("./schema.js");//for Schema.js file require





module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl; //jab hum bina log in kiye kisi url (listing edit etc) ko access karege toh jab hum login kare toh wapas listing pe n jate hue balki jo hame access krna tha use access akrege
        req.flash("error", "you must be logged in to create listing!!");
        return res.redirect("/login");
    } 
    next();
};

//agar hum redirect karna chahe pagge pe toh ye possible nhi hoga kyki passpot uski value reset kar dega. //  par agr hume access karna hai toh locals ki madat le sakte hai kyu ki passport locals ko delete nahi kar sakte hai\
 module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
 };

 module.exports.isOwner =async(req, res, next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error","you don't have permission to edit");
        return res.redirect(`/listings/${id}`); 
    }
    next();
 };

 //for schema.js file validation  listing
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    } else {
        next();
    }
};


//for schema.js file validation  revieew
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    } else {
        next();
    }
};

module.exports.isReviewAuthor =async(req, res, next)=>{
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`); 
    }
    next();
 };
