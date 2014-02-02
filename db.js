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
	"username" : String

});


var comment = new Schema({
	"thecomment" : String,
	"postid" : String,
	"posteruname" : String
})

var Message = new Schema({

	"subject" : String,
	"the message" : String,
	"sender" : String,
	"reciver" : String

});


/*var userSchema = new Schema({

	"email" : String,
	"password" : String
});
*/


// define the schema for our user model
mongoose.model("Comment", comment);
mongoose.model('Message', Message);
mongoose.model('Entry', Entry);

/*userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
mongoose.model('User', userSchema);*/
mongoose.connect( 'mongodb://localhost/express-post' );