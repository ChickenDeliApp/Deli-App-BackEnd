const { body, validationResult } = require("express-validator")
const { User } = require("./database_conn")
const flash = require("express-flash")

const express = require("express")
const passport = require("passport")
const bcrypt = require("bcrypt")
const local = require("passport-local").Strategy
var router = express.Router()

passport.serializeUser((user, done) => {
    done(null, user.email);
})

passport.deserializeUser((email, done) => {
    User.findOne({
        where: {email: email}
    }).then((user) => {
        done(null, user)
    }).catch(err => { done(err, null) })
})

passport.use(new local({
        usernameField: "email"
    },
    function (email, password, done) {
        User.findOne({
            where: {email: email}
        }).then((foundUser) => {
            if(!foundUser){
                return done(false, false, {message: "No such user"})
            }

            if(!foundUser.verifyPassword(password)){
                return done(null, false, {message: "Wrong Password"})
            }

            return done(null, foundUser)
        }).catch(err => { done(err) })
    }
))

router.use(flash())

router.post("/login", passport.authenticate('local', {
    failureFlash: true,

    successRedirect: "/"
}))

router.post("/register", body('dob').notEmpty().withMessage("must supply date of birth").isDate().withMessage("must be a date"), body('username').notEmpty().isLength({min:4, max: 15}).withMessage("must be between 5 and 15 characters long"), body('email').isEmail().withMessage("must be a valid email"), body('password').isLength({min: 5, max: 60}).withMessage("must be between 5 and 60 characters long"), (req, res) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    User.create({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 2),
		birth: req.body.dob
    }).then(user => {
        res.redirect(200, "/")
    }).catch(err => {
        var msg

        switch (err?.original?.code) {
            case "ER_DUP_ENTRY":
                msg = "Email or Username already taken"
                break;
            default:
				console.log(err);
                msg = "A database error occured!"
                break;
        }

        res.status(400).json({
            msg: msg
        })
    })
})

module.exports = {
	router
}