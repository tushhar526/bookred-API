require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const connectDB = require('./db/connect');
const bodyParser = require('body-parser');

// -----------------Req Routes-----------------------
const genre_Routes = require("./routes/genreRoutes");
const author_Routes = require("./routes/authorRoutes");
const user_Routes = require("./routes/userRoutes");
const books_Routes = require("./routes/bookRoutes");
const auth_Routes = require("./routes/authRoutes");
const publisher_Routes = require("./routes/publisherRoutes");

// -----------------Req Routes-----------------------
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));    
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// passport.use(new LocalStrategy(
//     async function (name, password, done) {

//         try {

//             const user = await User.findOne({ name });

//             if (!user) {

//                 return done(null, false, { message: "Invalid Username." });

//             }

//             const passwordMatch = await bcrypt.compare(password, user.password);

//             if (!passwordMatch) {

//                 return done(null, false, { message: "Invalid Password" });

//             }

//             return done(null, user);

//         } catch (error) {

//             return done(error)

//         }

//     }
// ));

// app.use(passport.initialize());



// app.use(passport.session({}));

// app.get('/admin', function (req, res, next) {

//     if (!req.isAuthenticated()) {

//         return res.redirect('/login');

//     }

//     if (req.user.role !== 'admin') {

//         return res.status(403).send('Forbidden');

//     }
//     res.render('admin');
// });

const port = process.env.Port || 3030;


app.use("/auth", auth_Routes);
app.use("/book", books_Routes);
app.use("/genre", genre_Routes);
app.use("/user", user_Routes)
app.use("/author", author_Routes);
app.use("/publisher", publisher_Routes);

app.get("/", (req, res) => {
    res.send("Hello");
})

const start = async () => {

    try {
        await connectDB(process.env.MONGODB_URL);
        app.listen(port,'0.0.0.0', () => {
            console.log(`${port} Connected`);
        })
    }
    catch (error) {
        console.log(error);
    }

}

start();
