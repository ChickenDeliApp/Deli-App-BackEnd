const express = require("express")
const passport = require("passport")
const local = require("passport-local").Strategy
var router = express.router()

passport.use(new local(
    function(username, passport, done){
        return done(null, [
            username = "static"
        ])
    }
))

router.post("/login", passport.authenticate('local', {
    failureFlash: true,
    failureMessage: "Failed to log in!",

    successRedirect: "/"
}))


export default router