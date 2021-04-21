const express = require("express")
var router = express.Router()
const Review = require("./database_conn").Review
const User = require("./database_conn").User
const DeliRestaurant = require("./database_conn").DeliRestaurant
const sequelize = require("sequelize")
const db = require("./database_conn").sequelize
const { isAuthed } = require("./login")

router.get("/latest", async (req, res) => {
	try{
		var data = await Review.findAll({
			include: User,
			order: [
				['createDate', 'DESC']
			],
			limit: 5
		})
	
		res.status(200).json(data);
	} catch(err) {
		res.sendStatus(400)
	}
})

router.get("/topdelis", async (req, res) => {
	try{
		var data = await db.query('SELECT res.restaurantName as "Restaurant Name", avg(rev.rating) as "Average Rating" FROM delirestaurants as res left join reviews as rev on res.id = rev.restaurant group by res.id order by avg(rev.rating) LIMIT 5;', { type: sequelize.QueryTypes.SELECT })

		res.status(200).json(data);
	} catch(err) {
		console.log(err);
		res.sendStatus(400)
	}
})

router.post("/new", isAuthed, async (req, res) => {
	try{
		await Review.create({
			restaurant: req.body.restaurant,
			text: req.body.text,
			rating: req.body.rating
		})

		res.status(200).json()
	} catch(err) {
		res.sendStatus(400)
	}
})

module.exports = router