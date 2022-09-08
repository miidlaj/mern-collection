var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { reject, resolve } = require('promise')
var objectId = require('mongodb').ObjectID
const { response } = require('express')
const collections = require('../config/collections')

module.exports = {

    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("Login Success");
                        response.user = user
                        response.status = true
                        var today = new Date();
                        var h = today.getHours();
                        var m = today.getMinutes();
                        var s = today.getSeconds();
                        var date = new Date();
                        var day = date.getDate();
                        var month = date.getMonth() + 1;
                        var year = date.getFullYear();
                        resolve(response)
                        db.get().collection(collection.USER_COLLECTION).updateOne({ Email: userData.Email },
                            {
                                $set: {
                                    lastLogin: h + ":" + m + ":" + s + "---" + day + "/" + month + "/" + year
                                }
                            }
                        ).then(() => {
                            resolve()
                            console.log(user);
                        })
                    } else {
                        console.log("Login Failed")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('Email Incorrect');
                resolve({ status: false })
            }
        })
    },
    addCustomer: (userData, userId) => {
        let date = new Date()
        let customertObj = {
            id: userData.id,
            Username: userData.username,
            Name: userData.Name,
            stb_number: userData.stb_number,
            Phone: userData.Phone,
            Rent: userData.Rent,
            Location: userData.location,
            Address: userData.Address,
            Description: userData.Description,
            CreatedAt: date.toDateString(),
            rent_balance: 0,
            stb_active: true,

        }
        return new Promise(async (resolve, reject) => {
            let customerCart = await db.get().collection(collection.CUSTOMER_COLLECTION).findOne({ user: objectId(userId) })
            db.get().collection(collection.CUSTOMER_COLLECTION)
                .findOne({
                    user: objectId(userId)
                }).then(() => {
                    let UsernameExist = db.get().collection(collection.CUSTOMER_COLLECTION).findOne({
                        "customers.Username": userData.username
                    })
                    if (UsernameExist) {
                        console.log("EXIST!!!!!!!!!!");
                        userData.username = userData.username + "_1"

                    } else {
                        console.log("No!!!!!!!!!!!!!!!");
                    }
                })


            if (customerCart) {
                db.get().collection(collection.CUSTOMER_COLLECTION)
                    .updateOne({ user: objectId(userId) },
                        {

                            $push: { customers: customertObj }

                        }
                    ).then((response) => {
                        resolve()
                    })
            } else {
                let custObj = {
                    user: objectId(userId),
                    customers: [customertObj]
                }
                db.get().collection(collection.CUSTOMER_COLLECTION).insertOne(custObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getAllCustomers: (userId) => {
        return new Promise(async (resolve, reject) => {
            let allCustomers = await db.get().collection(collection.CUSTOMER_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$customers'
                },
                {
                    $project: {
                        id: "$customers.id",
                        Username: "$customers.Username",
                        Name: '$customers.Name',
                        stb_number: '$customers.stb_number',
                        Phone: '$customers.Phone',
                        Rent: '$customers.Rent',
                        Location: '$customers.Location',
                        Address: '$customers.Address',
                        Description: '$customers.Description',
                        CreatedAt: '$customers.CreatedAt'
                    }
                }
            ]).toArray()
            resolve(allCustomers)
            console.log(allCustomers);
        })
    },
    getCustomerDetail: (id, userId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CUSTOMER_COLLECTION).findOne({ user: objectId(userId) }).then(async () => {


                let All = await db.get().collection(collection.CUSTOMER_COLLECTION)
                    // .findOne({
                    //     "customers": {
                    //         $elemMatch: {
                    //             "Username": "midlaj9356"
                    //         }
                    //     }
                    // },
                    //     { "customers.$": 1 })
                    .findOne({ "customers.id": id },
                        { projection: { customers: { $elemMatch: { "id": id } } } }
                        // function (errT, resultT) {
                        //     if (errT) {
                        //         console.log(errT + "ERRRRRRRRRRRRRRRRRRR");
                        //     } else {
                        //         console.log(resultT);
                        //     }
                        //     return resultT;
                        // }
                    );
                resolve(All)
            })




        })
    }

}
