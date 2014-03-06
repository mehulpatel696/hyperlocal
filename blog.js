

var mongoose = require('mongoose');
var Entry = mongoose.model('Entry');
var Comment = mongoose.model('Comment');
var Message = mongoose.model('Message');
var Chat = mongoose.model('Chate');
var LocalStrategy   = require('passport-local').Strategy;




exports.deletedata = function(deleteid) {
	Entry.findByIdAndRemove(deleteid, function(err, deleteed) {
		console.log("deleteed");

	});

}

exports.getMessages = function(username) {
   
     var messages = [];
   Chat.find( { $or:[ {'reciever': username}, {'sender': username}]}, function(err, messages) {

        messages.forEach( function(message) {

            messages.push(message);
        });



    });
     return messages;

}




    exports.getBlogEntries = function(opid) {
	var list12 =[];   


	/*Entry.find({'opid' : opid}, function(err, entries) {
			
			if(!err) {
           console.log("adding");

            entries.forEach( function(currentEntry){

                
                Comment.find({'postid' : currentEntry.id}, function(err2, comments){
                     
                    if(err2) {
                        list12.push(currentEntry);
                          console.log(third);

                    }
                    else {
                        currentEntry.commentst = comments;
                        list12.push(currentEntry);
                    }


                });

               
            });

            }

            else {
                console.log("EEEERROOR");
            }

            //else {console.log("err");}
            
                
          });
    console.log(list12);
    return list12;
    */
    Entry.find({'opid' : opid}, function(err, entries) {
    if(!err) {
        console.log("adding");
        var length = entries.length;
        entries.forEach( function(currentEntry){
            list12.push(currentEntry);
            length--;
            if(length <= 0){
                console.log(list12);
                return list12;
            }
        });
    }
    else {
        console.log("EEEERROOR");
    }
    //else {console.log("err");}
});
};



	//console.log(list);
   




 /*if (!err){ 
               

                for(i = 0; i < entries.length; i++ ) {
                    list.push(entries[i]);
                    //console.log(list[i-1]);
                    Comment.find({'postid': list[i].id},function(err2, comments){
                        console.log();
                        console.log(comments);
                        
                        if(err2){
                           s
                            console.log("asf");
                            

                        }
                        else {


                            
                            list[i].commentst = comments;
                           
                            //list.push(entries[i]);
                         }
                    });
                


                 }
            }*/



exports.getBlogEntriesALL = function() {
    var listALL = [];
    Entry.find(function(err, entries) {
            
            
            if (!err){ 
               
               entries.forEach( function(currentEntry){

                    Comment.find({'postid' : currentEntry.id}, function(err2, comments) {
                            if(err2)   {
                                listALL.push(currentEntry);
                            }     
                            else {
                                

                                currentEntry.commentst = comments;
                                listALL.push(currentEntry);
                            }                 

                    });

               });
         }
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
                var newUser = new User();

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





