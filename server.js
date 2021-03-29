const express = require("express")
const cors = require("cors") 
const passport = require("passport")
const session = require("express-session")
require("./database_conn")
var app = express()

app.use(express.urlencoded({extended: false}))
app.use(session({secret: "chickenroll_ree"}))
app.use(passport.initialize())
app.use(passport.session())

app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}) // Ciarans work

const loginRoutes = require("./login")
app.use(loginRoutes)

const PORT = 3599 
app.listen( PORT, () => {
    console.log(`Listening on ${PORT}!`);
})