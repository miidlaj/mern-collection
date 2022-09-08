const { response, Router } = require('express');
var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers');
const customerHelpers = require('../helpers/customer-helpers')

const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next()
  } else {
    res.redirect('/')
  }
}
/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.session.user
  console.log(user);
  if (req.session.userLoggedIn) {
    res.render('user/home', { user: req.session.user })
  } else {
    res.render('user/login/login')
  }
});
router.post('/login', (req, res,) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/home')
    } else {
      req.session.userLoginErr = "Invalid username or Password"
      res.redirect('/login')
    }
  })
});
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})
router.get('/home', verifyLogin, function (req, res, next) {
  res.render('user/home', { user: req.session.user });
});
router.get('/add-customer', verifyLogin, function (req, res) {
  res.render('user/add-customer', { user: req.session.user });
});
router.post('/add-cutomer', verifyLogin, (req, res) => {
  let user = req.session.user
  userHelpers.addCustomer(req.body, user._id).then((response) => {
    console.log(user._id);
    res.redirect('/home')
  })
});
router.get('/all-customers', async (req, res) => {
  let customers = await userHelpers.getAllCustomers(req.session.user._id)
  res.render('user/all-customers', { user: req.session.user, customers });
});
router.get('/edit-customer-details/:id', async (req, res) => {
  let customer = await userHelpers.getCustomerDetail(req.params.id, req.session.user._id);
  let Onecustomer = customer.customers
  res.render('user/edit-customer', { user: req.session.user, Onecustomer })
  console.log(Onecustomer);

})
router.post('/edit-customer-details/:id', (req, res) => {
  customerHelpers.updateCustomer(req.params.id, req.body).then(() => {
    res.redirect('/home')
  })
})
router.get('/delete-customer/:id', (req, res) => {
  customerHelpers.deleteCustomer(req.params.id).then((response) => {
    res.redirect('/all-customers/')
  })
})
router.get('/one-customer-details/:id', verifyLogin, async (req, res) => {
  let customer = await customerHelpers.getCustomerDetail(req.params.id, req.session.user._id);
  let rent = await customerHelpers.getCustomerRent(req.params.id, req.session.user._id);
  let OneRent = rent;
  let rent_length = OneRent.rent_collection.length
  console.log(OneRent);
  let rent_given = OneRent.rent
  let Onecustomer = customer.customers
  res.render('user/one-customer-details', { user: req.session.user, Onecustomer, OneRent, rent_length, rent_given })
  console.log(Onecustomer);
});
router.get('/all-customers/add-rent/:id', async (req, res) => {
  let customer = await customerHelpers.getCustomerDetail(req.params.id, req.session.user._id);
  let Onecustomer = customer.customers
  res.render('user/add-rent', { user: req.session.user, Onecustomer })
})
router.post('/all-customers/add-rent/:id', async (req, res) => {
  customerHelpers.addRent(req.params.id, req.body, req.session.user._id)
  // .then(() => {
  //   console.log("aaaa");

  // })
  let customer = await customerHelpers.getCustomerDetail(req.params.id, req.session.user._id);
  let Onecustomer = customer.customers
  res.render('user/add-rent-successfully', { user: req.session.user, Onecustomer })
})
router.post('/all-customers/add-deactive-month/:id', async (req, res) => {
  console.log(req.body.months);
  customerHelpers.addDeactiveMonth(req.params.id, req.body);
  res.render('user/add-rent-successfully', { user: req.session.user })
})
module.exports = router;

