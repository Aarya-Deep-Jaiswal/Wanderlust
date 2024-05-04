const listings = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await listings.find();
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await listings.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author",
        }
    })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing.geometry.coordinates);
    await res.render("listings/show.ejs", { listing })
};

module.exports.createListing = async (req, res, next) => {

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
        .send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new listings(req.body.listing);
    newListing.image = { url, filename };
    newListing.owner = req.user._id;

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    // console.log(savedListing);
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await listings.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateLisitng = async (req, res) => {
    let { id } = req.params;
    let listing = await listings.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await listings.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};

