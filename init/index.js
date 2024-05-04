const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
main()
    .then(res => console.log("connected to DB"))
    .catch(err => consloe.log(err));
async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await listing.deleteMany({});
    initData.data = initData.data.map((ob) => ({ ...ob, owner: '662bc9ee222f5860d51a6df3' }));
    await listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();

// console.log(initData);