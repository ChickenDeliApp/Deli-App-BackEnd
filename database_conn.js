require("dotenv").config()
const { Sequelize, Model, DataTypes, DECIMAL, INTEGER } = require("sequelize")
const bcrypt = require("bcrypt")

// https://github.com/sequelize/sequelize/issues/9786
const wkx = require('wkx')
Sequelize.GEOMETRY.prototype._stringify = function _stringify(value, options) {
  return `ST_GeomFromText(${options.escape(wkx.Geometry.parseGeoJSON(value).toWkt())})`;
}
Sequelize.GEOMETRY.prototype._bindParam = function _bindParam(value, options) {
  return `ST_GeomFromText(${options.bindParam(wkx.Geometry.parseGeoJSON(value).toWkt())})`;
}
Sequelize.GEOGRAPHY.prototype._stringify = function _stringify(value, options) {
  return `ST_GeomFromText(${options.escape(wkx.Geometry.parseGeoJSON(value).toWkt())})`;
}
Sequelize.GEOGRAPHY.prototype._bindParam = function _bindParam(value, options) {
  return `ST_GeomFromText(${options.bindParam(wkx.Geometry.parseGeoJSON(value).toWkt())})`;
}

const sequelize = new Sequelize({
    dialect: "mysql",
    host: process.env.HOST || "localhost",
    port: process.env.PORT || 3306,
    database: "chicky",

    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || ""
})

class User extends Model {
    verifyPassword(password){
        return bcrypt.compareSync(password, this.password); 
    }
}

User.init({
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },

    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,

        validate: {
            isEmail: {
                msg: "Must be a valid e-mail"
            }
        }
    },

    birth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
   
    password: {
        type: DataTypes.STRING(60),
        allowNull: false
    },

    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    createdAt: "joinDate",
    updatedAt: false,
    timestamps: true
})

class DeliChain extends Model {}
DeliChain.init({
    chainName: {
        type: DataTypes.STRING(80),
        allowNull: false
    },

    // managedBy: {
    //     type: DataTypes.STRING(255),

    //     references: {
    //         model: User,
    //         key: "email"
    //     }
    // }
}, {
    sequelize,
    updatedAt: false
})
// User.hasOne(DeliChain, {foreignKey: "managedBy"})
DeliChain.belongsTo(User)

class DeliRestaurant extends Model {}
DeliRestaurant.init({
    restaurantName: {
        type: DataTypes.STRING(80)
    },

    // restaurantChain: {
    //     type: DataTypes.INTEGER,

    //     references: {
    //         model: DeliChain,
    //         key: "id"
    //     }
    // },

    geo_location: {
        type: DataTypes.GEOMETRY("POINT")
    },

    address: {
        type: DataTypes.STRING,
        allowNull: false
    },

    postCode: {
        type: DataTypes.STRING(10),
        allowNull: false
    }
}, {
    sequelize,
    updatedAt: false
})
DeliChain.hasMany(DeliRestaurant, {foreignKey: "restaurantChain"})

class Review extends Model {}
Review.init({
    text: {
        type: DataTypes.STRING(500)
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            max: 5,
            min: 1,
            notNull: true
        }
    }
}, {
    sequelize,
    updatedAt: "lastUpdated",
    createdAt: "createDate"
})
DeliRestaurant.hasMany(Review, {foreignKey: "restaurant"})
Review.belongsTo(User)

const DEV = process.env.DEV || false
if(DEV){
    sequelize.query('SET FOREIGN_KEY_CHECKS = 0').then(async () => {
        await sequelize.sync({force: true});
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 1")
    })
}


module.exports = {
    sequelize,
    User,
    Review,
    DeliChain,
    DeliRestaurant
}