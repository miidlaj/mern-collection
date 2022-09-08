const { response, Router } = require('express');
var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers')
const verifyLogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin/admin-login')
  }
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin/login', { admin: true });
});
router.post('/admin-login', (req, res) => {
  adminHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admins = response.admins
      req.session.adminLoggedIn = true
      res.render('admin/home', { admin: req.session.admins })
      console.log("Login success");
    } else {
      req.session.adminLoginErr = "Invalid username or Password"
      console.log("Login Failed!");
      res.redirect('/admin/admin-login')
    }
  })
})
router.get('/add-user', function (req, res, next) {
  res.render('admin/add-user', { admin: true });
});
router.post('/add-user', (req, res) => {
  adminHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.admin = response
    req.session.admin.loggedIn = true
    res.redirect('/admin')
  })
})
module.exports = router;