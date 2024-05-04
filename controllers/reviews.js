const listings = require("../models/listing.js");
const Review = require("../models/reviews.js");

module.exports.createReview = async (req, res) => {
    console.log(req.params.id);
    let listing = await listings.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created");

    res.redirect(`/listings/${listing.id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    listings.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");

    res.redirect(`/listings/${id}`);
};