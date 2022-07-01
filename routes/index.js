var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { $where } = require('../models/journeys');
var JourneyModel = require('../models/journeys');
var UserModel = require('../models/users');


var city = ["Paris","Marseille","Nantes","Lyon","Rennes","Melun","Bordeaux","Lille"]
var date = ["2018-11-20","2018-11-21","2018-11-22","2018-11-23","2018-11-24"]



/* GET index page. */
router.get('/', function(req, res, next) {
var emailError = '';
var ErrorSignin = '';
  res.render('index', { title: 'Express',  emailError, ErrorSignin});
});


/* GET home page. */

router.get('/home', function(req, res, next) {

        if (req.session.user == null) {
          res.redirect('/') 
        }else{
          res.render('home', { title: 'Express'});
        }

});

// ---------------------------- Route Sign-up -------------------------------
router.post('/signup',async function(req, res, next) {

  var userList = await UserModel.find() ;
  var alreadyExist = false

// ----------------- vérification si email existe deja ----------------------


 for (let i = 0; i < userList.length; i++) {


   if(req.body.emailSignup == userList[i].email){
     emailError = 'Email already exist' ;
    alreadyExist = true ;
    res.redirect('/') ;
    break ;
   }
 } ;

// ----------------- si email existe pas , homePage ----------------------



 if(alreadyExist == false){
  var newUser =  new UserModel({

    firstName: req.body.firstName,
    name: req.body.name,
    email: req.body.emailSignup,
    password: req.body.password,

  }); 
  
  await newUser.save()
  var iDuser = await UserModel.find({email:req.body.emailSignup});


  req.session.user ={
     _id: iDuser[0]._id ,
    name: userList[userList.length - 1].firstName,
  }
  res.redirect('/home');
 }

});

// ---------------------------- Route Sign-in -------------------------------


router.post('/signin',async function(req, res, next) {

  var userList = await UserModel.find() ;
  var exist = false

// ---------------- Vérification compte valide -------------------------------

  for(let i = 0 ; i<userList.length ; i++){
      
    if (req.body.emailSignin == userList[i].email && req.body.passwordSignin == userList[i].password) {
      exist = true
      req.session.user ={
        _id: userList[i].id,
        name: userList[i].firstName
        
      }
      res.redirect('/home');
    }
  }

// ---------------- Si Error, renvoi index ----------------------------------

if(exist == false){

  ErrorSignin = 'Invalid email or password '
  res.redirect('/');

}

});


//************************************************************************************

//----------------------------- Route Calcul Billet ----------------------------------

router.post('/go',async function(req, res, next) {


  var newDate = new Date(req.body.date)
  var journeysList = await JourneyModel.find() ;
  var journeyDispo = [];
  var day = newDate.getDate()
  var month = newDate.getMonth() + 1
  var exist = false

   for (let i = 0; i < journeysList.length; i++) {

   if(req.body.to.toLowerCase() == journeysList[i].arrival.toLowerCase()  && req.body.from.toLowerCase()  == journeysList[i].departure.toLowerCase() && Date.parse(newDate) ==  Date.parse(journeysList[i].date)  ){

    journeyDispo.push(
      {
        departure: journeysList[i].departure,
        arrival: journeysList[i].arrival,
        date: journeysList[i].date,
        departureTime: journeysList[i].departureTime,
        price: journeysList[i].price,
      }
    ) 
    exist = true
     }
 }

 if(exist == false){
  
  res.render('noTrain');

 }

 res.render('availableTicket', {journeyDispo , day , month});



  });



  //************************************************************************************

//----------------------------- Route Ajout Journeys to users  ----------------------------------


router.post('#confirm',async function(req, res, next) {


  var newDate = new Date(req.body.date)
  var journeysList = await JourneyModel.find() ;
  var user = await UserModel.findById({_id:req.session.user._id}) ;

  

   for (let i = 0; i < journeysList.length; i++) {



   if(req.body.to.toLowerCase() == journeysList[i].arrival.toLowerCase()  && req.body.from.toLowerCase()  == journeysList[i].departure.toLowerCase() && Date.parse(newDate) ==  Date.parse(journeysList[i].date)  ){


    user.journey.push(
      {
        departure: journeysList[i].departure,
        arrival: journeysList[i].arrival,
        date: journeysList[i].date,
        departureTime: journeysList[i].departureTime,
        price: journeysList[i].price,
      }
    ) 

     }
    
 }
 
 await UserModel.findOneAndUpdate({_id:req.session.user._id} , user) ;

    res.render('#');
  });



router.get('/lastrips',async function(req, res, next) {

  console.log(req.session.user._id);

  var user = await UserModel.findById({_id:req.session.user._id}) ;

  console.log(user);
  
    res.render('lastrips',{user});
  });

module.exports = router;
