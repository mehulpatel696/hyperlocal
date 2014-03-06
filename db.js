var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var Entry = new Schema({
	//'id': String,
	"title": String,
	"type" : String,  
	"post": String,
	"published": Date,
	"position" : String,
	"opid" : String,
	"username" : String,
	"lat" : String,
	"longi" : String,
	"latlongsub" : String

});

var inviteCode = new Schema({
	"code" : String
})


var comment = new Schema({
	"thecomment" : String,
	"postid" : String,
	"posteruname" : String
});

var Message = new Schema({

	"subject" : String,
	"the message" : String,
	"sender" : String,
	"reciever" : String

});


/*var userSchema = new Schema({

	"email" : String,
	"password" : String
});
*/

var chatScheme = mongoose.Schema({
  sender: String,
  reciever: String, 
  msg: String,
  created: {type: Date, default: Date.now}
});

mongoose.model("Chate", chatScheme);


// define the schema for our user model
mongoose.model("Comment", comment);
mongoose.model('Message', Message);
mongoose.model('Entry', Entry);
mongoose.model("inviteCode", inviteCode);

/*userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
mongoose.model('User', userSchema);*/
var uri = 'mongodb://heroku_app21925448:4p7tgven51i7j1at8uepeviji0@ds027809.mongolab.com:27809/heroku_app21925448';
//var uri = 'mongodb://localhost/express-post'
mongoose.connect(uri);






