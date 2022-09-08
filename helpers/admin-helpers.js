var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { reject, resolve } = require('promise')
var objectId = require('mongodb').ObjectID
const { response } = require('express')

module.exports = {
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admins = await db.get().collection(collection.ADMINS_COLLECTION).findOne({ Email: adminData.Email })
            if (admins) {
                bcrypt.compare(adminData.Password, admins.Password).then((status) => {
                    if (status) {
                        console.log('login success');
                        response.admins = admins
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login failed")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('email incorrect');
                resolve({ status: false })
            }
        })
    },
    doSignup: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.ops[0])
                console.log(userData);
            })
        })


    }
}