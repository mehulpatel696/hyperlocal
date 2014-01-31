/*var entries = [
{"id":1, "title":"Hello World!", "body":"This is the body of my blog entry. Sooo exciting.", "published":"6/2/2013"},
{"id":2, "title":"Eggs for Breakfast", "body":"Today I had eggs for breakfast. Sooo exciting.", "published":"6/3/2013"},
{"id":3, "title":"Beer is Good", "body":"News Flash! Beer is awesome!", "published":"6/4/2013"},
{"id":4, "title":"Mean People Suck", "body":"People who are mean aren't nice or fun to hang around.", "published":"6/5/2013"},
{"id":5, "title":"I'm Leaving Technology X and You Care", "body":"Let me write some link bait about why I'm not using a particular technology anymore.", "published":"6/10/2013"},
{"id":6, "title":"Help My Kickstarter", "body":"I want a new XBox One. Please fund my Kickstarter.", "published":"6/12/2013"}];
*/
var mongoose = require('mongoose');
var Entry = mongoose.model('Entry');

var LocalStrategy   = require('passport-local').Strategy;



/*var post1 = new Entry({
		"id" : 1,
		"title" : "Mehul PAtel",
		"post": "Best",
		"published": Date.now()
	});

post1.save(function(err, savedUser){
	if(err) {
		console.log("D");
	}
	else {
		console.log(savedUser);
	}
});
*/




/*var admin = new userSchema({
	username : "mehulpatel",
	password: "hello"

});

admin.save(function(err, adminSaved){
	if(!err){
		console.log(adminSaved);
	}
});

*/


exports.deletedata = function(deleteid) {
	Entry.findByIdAndRemove(deleteid, function(err, deleteed) {
		console.log("deleteed");

	});

}

exports.getBlogEntries = function(opid) {
	var list = [];
	Entry.find({'opid' : opid}, function(err, entries) {
			
			
            if (!err){ 
            	for(i = 1; i < entries.length; i++ ) {
                list.push(entries[i]);


            } }
            else {console.log("err");}

                
          });
	//console.log(list);
	return list;


};

exports.getBlogEntriesALL = function() {
    var listALL = [];
    Entry.find(function(err, entries) {
            
            
            if (!err){ 
                for(i = 1; i < entries.length; i++ ) {
                listALL.push(entries[i]);


            } 
         console.log(listALL);}
            else {console.log("err");}

                
          });
   
    return listALL;


};


var mehul2 = [];
exports.getBlogEntry = function(idp) {
	

	Entry.find( { "_id": idp }, function(err, mehul){
			//console.log(mehul);
			 mehul2.push(mehul);

	}); 
	//function(err, ans) {
		//console.log(ans);
		//if(!err) {
			//console.log("err");
		//s}
		//console.log(ans);
		  // mehul.push(ans);
		//}

		//else { console.log("err");}
	 //});
	//console.log(mehul);
	//return mehul;
	//console.log(mehul );
	return mehul2;

};






//userauth from here




exports.signup = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);s
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

				// if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);

				// save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });        

    }));

};




