const mongoose = require("mongoose");

// uri = "mongodb+srv://viSHHal:viSHHal_26o5@cluster0.y4g6dqn.mongodb.net/Cluster0?retryWrites=true&w=majority";

const connectDB = (uri) => {
    return mongoose.connect(uri, {
        useNewUrlParser:true,
        useUnifiedTopology: true,
    })
}

module.exports = connectDB;