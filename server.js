const express = require("express")
require("dotenv").config()
const cors = require("cors") 
const passport = require("passport")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const restaurantChains = require("./restaurants")
const reviewRoutes = require("./reviews")
const loginRoutes = require("./login").router
const { sequelize, User } = require("./database_conn")
const SQLiteStore = require("connect-sqlite3")(session)
const path = require("path")


var app = express()
app.use(express.static(path.join(__dirname, 'public')))

app.use(cookieParser())
app.use(express.urlencoded({extended: false}))
app.use(session({
	secret: "chickenroll_ree",
	resave: false,
	saveUninitialized: true,
	store: new SQLiteStore(),
	cookie: {
		maxAge: 1000 * 60 * 60,
		secure: false
	}
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(cors({
	credentials: true
}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}) // Ciarans work

app.use(loginRoutes)
app.use("/reviews", reviewRoutes)
app.use("/chains", restaurantChains)

app.get("*", (req, res) => {
	console.log("serving a file at " + req.route);
	console.log( req.url );

	res.sendFile(path.join(__dirname + "/public/index.html"))
})

const PORT = 3599 
app.listen( process.env.WEBPORT ?? PORT, () => {
    console.log(`Listening on ${PORT}!`);
})