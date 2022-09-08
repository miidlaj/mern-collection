var db = require('../config/connection')
var collection = require('../config/collections')
const { reject, resolve } = require('promise')
var objectId = require('mongodb').ObjectID

const { response } = require('express')
const collections = require('../config/collections')
module.exports = {
    // getCustomerDetails: (username, userId) => {
    //     console.log(username);
    //     console.log(userId);
    //     return new Promise(async (resolve, reject) => {
    //         await db.get().collection(collection.CUSTOMER_COLLECTION).findOne({ user: objectId(userId) }).then(async () => {
    //             let customerDetails = await db.get().collection(collection.CUSTOMER_COLLECTION)
    //                 .find({
    //                     customers: {
    //                         $elemMatch: {
    //                             Name: username
    //                         }
    //                     }
    //                 },
    //                     { 'customers.$': 1 }
    //                 )
    //             resolve(customerDetails)
    //             console.log(customerDetails);

    //         })


    //     })

    // }
    updateCustomer: (CusId, CusDetails) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CUSTOMER_COLLECTION)
                .updateOne({ "customers.id": CusId }, {
                    $set: {
                        "customers.$.Username": CusDetails.username,
                        "customers.$.Name": CusDetails.Name,
                        "customers.$.stb_number": CusDetails.stb_number,
                        "customers.$.Phone": CusDetails.Phone,
                        "customers.$.Rent": CusDetails.Rent,
                        "customers.$.Location": CusDetails.location,
                        "customers.$.Address": CusDetails.Address,
                        "customers.$.Description": CusDetails.Description
                    }
                }).then((response) => {
                    resolve()
                })
        })
    },
    deleteCustomer: (CusId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CUSTOMER_COLLECTION)
                .updateOne({
                    "customers.id": CusId
                },
                    { $pull: { "customers": { "id": CusId } } }
                ).then((response) => {
                    resolve(response)

                })
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
    },
    addRent: (CusId, rentDetails, userId) => {
        let date = new Date()
        let RentObj = {
            rent_amount: parseInt(rentDetails.rent),
            rent_date: rentDetails.rentDate,
            AddedAt: date.toDateString()
        }

        return new Promise(async (resolve, reject) => {
            let rentCart = await db.get().collection(collection.RENT_COLLECTION).findOne({ id: CusId })

            if (rentCart) {
                db.get().collection(collection.RENT_COLLECTION)
                    .updateOne({ id: CusId },
                        {

                            $push: { rent: RentObj }

                        }
                    ).then((response) => {
                        resolve()
                    })
            } else {
                let rentObj = {
                    user: objectId(userId),
                    id: CusId,
                    rent: [RentObj]
                }
                db.get().collection(collection.RENT_COLLECTION).insertOne(rentObj).then((response) => {
                    resolve()
                })
            }
            let Total = await db.get().collection(collection.RENT_COLLECTION).aggregate([

                {
                    $match: {
                        id: CusId
                    }
                },
                {
                    $unwind: '$rent'
                },
                {
                    $group: {
                        _id: CusId,
                        total_rent_amount: {
                            $sum: "$rent.rent_amount"
                        }
                    }
                }
            ]).toArray()
            console.log(Total[0]);


            await db.get().collection(collection.CUSTOMER_COLLECTION).updateOne({ "customers.id": CusId },
                {
                    $set: {
                        "customers.$.total_rent": Total[0].total_rent_amount
                    }
                })


            // rent:



            let customer = await db.get().collection(collection.CUSTOMER_COLLECTION)

                .findOne({ "customers.id": CusId },
                    { projection: { customers: { $elemMatch: { "id": CusId } } } }
                );
            resolve()
            // console.log(customer.customers[0].Rent);

            var rent_given1 = parseInt(rentDetails.rent)
            let rent_balance = parseInt(customer.customers[0].rent_balance)
            // console.log(rent_balance + " rent balance");
            var rent_given = rent_given1 + rent_balance
            // console.log(rent_given + " plus rent given");


            let rent = customer.customers[0].Rent;
            let n = Math.floor(rent_given / rent)
            var rent_to_add = n * rent;
            let rent_given_balance = rent_given - rent_to_add;



            var rent_array = []
            for (var i = 0; i < n; i++) {
                rent_array[i] = rent_to_add / n;

            }
            // console.log(rent_array);
            // console.log(rent_balance);



            let text = [];
            for (let i = 0; i < rent_array.length; i++) {
                text = rent_array[i];



                db.get().collection(collection.CUSTOMER_COLLECTION).updateOne({
                    "customers.id": CusId
                },
                    {
                        $set: {
                            "customers.$.rent_balance": rent_given_balance
                        }
                    }
                )
                db.get().collection(collection.RENT_COLLECTION).updateOne({
                    "id": CusId
                },
                    {
                        $push:
                        {
                            "rent_collection": text

                        }
                    })
                db.get().collection(collection.RENT_COLLECTION).updateOne({
                    "id": CusId
                },
                    {
                        $set:
                        {
                            "rent_balance": rent_given_balance,
                            "total_rent": Total[0].total_rent_amount
                        }
                    }
                )
            }
        })

    },
    getCustomerRent: (CusId, userId) => {
        return new Promise(async (resolve, reject) => {
            let rent = await db.get().collection(collection.RENT_COLLECTION).findOne(
                { id: CusId });
            resolve(rent)
            // console.log(rent.rent);
            // console.log(rent.rent[0].rent_amount);

        })

    },
    addDeactiveMonth: (CusId, body) => {
        let nMonths = body.months
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < nMonths; i++) {
                db.get().collection(collection.RENT_COLLECTION)
                    .updateOne({
                        "id": CusId
                    },
                        {
                            $push:
                            {
                                "rent_collection": 0
                            }
                        })

            }

        })
    }
}