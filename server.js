const express = require("express")
const cors = require("cors") 
require("./database_conn")
var app = express()

app.use(express.urlencoded({extended: false}))

app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}) // Ciarans work

const PORT = 3599 
app.listen( PORT, () => {
    console.log(`Listening on ${PORT}!`);
})