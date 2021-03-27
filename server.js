const express = require("express")
var app = express()

app.use(express.urlencoded({extended: false}))



const PORT = 3599 
app.listen( PORT, () => {
    console.log(`Listening on ${PORT}!`);
})