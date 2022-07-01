var mongoose = require('mongoose');

var journeySchema = mongoose.Schema({
  departure: String,
  arrival: String,
  date: Date,
  departureTime: String,
  price: Number,
});


var userSchema = mongoose.Schema({
    firstName: String,
    name: String,
    email: String,
    password: String,
    journey: [journeySchema]
  });
  
  var UserModel = mongoose.model('users', userSchema);


  module.exports = UserModel;