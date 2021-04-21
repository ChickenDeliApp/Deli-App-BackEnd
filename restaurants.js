const express = require( "express" )
const sequelize = require( "sequelize" )
const db = require( "./database_conn" ).sequelize
const { DeliChain, User, DeliRestaurant } = require( "./database_conn" )
const { isAuthed } = require( "./login" )
var router = express.Router()

router.post( "/new", isAuthed, async ( req, res ) => {

	try {
		await DeliChain.create( {
			chainName: req.body.name
		} )

		res.status( 200 ).json( {
			message: "Created successfully"
		} )
	} catch ( err ) {
		console.log( err );

		res.sendStatus( 400 )
	}
} )

router.get( "/restaurant/all", async ( req, res ) => {
	try {
		const data = await DeliRestaurant.findAll({
			include: { model: DeliChain, required: false }
		})

		res.status( 200 ).json( data )

	} catch ( err ) {
		console.log(err);

		res.sendStatus( 400 )
	}
} )

router.post( "/restaurant/new", isAuthed, async ( req, res ) => {

	try {
		await DeliRestaurant.create( {
			restaurantName: req.body.restaurantName,
			address: req.body.restaurantAddress,
			DeliChainChainName: req.body.chainName,
			geo_location: { type: 'Point', coordinates: [req.body.lat, req.body.long] },
			address: req.body.restaurantAddress,
			postCode: req.body.restaurantPostcode
		} )

		res.status( 200 ).json( {
			message: "Success! Added a new Deli Restaurant!"
		} )
	} catch ( err ) {
		console.log( err );

		res.sendStatus( 400 )
	}
} )

router.get( "/names", isAuthed, async ( req, res ) => {
	try {
		const data = await DeliChain.findAll( {
			attributes: ["chainName"]
		} )

		res.status( 200 ).json( data )
	} catch ( err ) {
		console.log(err);

		res.sendStatus( 400 )
	}
} )

router.get( "/", isAuthed, async ( req, res ) => {

	try {
		const data = await DeliChain.findAll( {
			offset: 10 * ( req.query?.page - 1 ?? 0 ),
			limit: 10,
			include: { model: User, required: false }
		} )

		const allCount = await DeliChain.count()

		res.status( 200 ).json( {
			rows: data,
			count: allCount
		} )
	} catch ( err ) {
		res.sendStatus( 400 )
	}
} )

module.exports = {
	router
}

module.exports = router