const express = require( "express" )
var router = express.Router()
const Review = require( "./database_conn" ).Review
const User = require( "./database_conn" ).User
const DeliRestaurant = require( "./database_conn" ).DeliRestaurant
const sequelize = require( "sequelize" )
const db = require( "./database_conn" ).sequelize
const { isAuthed } = require( "./login" )
const moment = require("moment")

router.get( "/latest", async ( req, res ) => {
	try {
		var data = await Review.findAll( {
			include: [{ model: User }, { model: DeliRestaurant }],
			order: [
				['createDate', 'DESC']
			],
			limit: 5
		} )

		res.status( 200 ).json( data );
	} catch ( err ) {
		console.log( err );

		res.sendStatus( 400 )
	}
} )

router.get( "/topdelis", async ( req, res ) => {
	try {
		var data = await DeliRestaurant.findAll( {
			include: [
				{
					model: Review,
					attributes: [],
					required: true,
					duplicating: false,
					where: {
						createDate: {
							[sequelize.Op.gt]: moment().subtract(1, 'month').toDate()
						}
					}
				}
			],
			attributes: {
				include: [
					[sequelize.fn( "AVG", sequelize.col( "reviews.rating" ) ), "average"],
					[sequelize.fn( "COUNT", sequelize.col( "reviews.id" ) ), "reviews"]
				]
			},

			order: [
				[
					[sequelize.literal("average"), 'desc']
				]
			],
			group: ['id'],
			limit: 10,
			having: {
				'reviews': {
					[sequelize.Op.gt]: 0
				}
			}
		} )

		res.status( 200 ).send( data )
	} catch ( err ) {
		console.log( err );
		res.sendStatus( 400 )
	}
} )

router.post( "/new", isAuthed, async ( req, res ) => {
	try {
		let newReview = await Review.create( {
			DeliRestaurantId: req.body.reviewRestaurant,
			text: req.body.reviewText,
			rating: req.body.reviewScore,
			UserEmail: req.user.email
		} )

		res.status( 200 ).json( {
			message: "Successfully created a new Review!"
		} )
	} catch ( err ) {
		console.log( err );

		res.sendStatus( 400 )
	}
} )

module.exports = router