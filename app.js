

//requiring the db.js file
//plain old js





require('./db');


//required all the modules and shit
var flash = require('connect-flash');
var express = require('express');
var hbs = require('hbs');
var blogEngine = require('./blog');
var passport = require('passport');
var mongoose = require('mongoose');
var Entry = mongoose.model('Entry');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema; 

var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  accessToken: { type: String },
  passReqToCallback : Boolean // Used for Remember Me - need to work on it a bit thouugh
});



//salts/hashes the password entered  
userSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) return next(err);
			user.password = hash;
			next();
		});
	});
});

//makessure the saulted paswurd is equal to entured - turd huehhuehuehuehusal;fals - deal with it mother fuker
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);
	});
};

// Implemention of the remember me method --> still need to wurk on this sheit
userSchema.methods.generateRandomToken = function () {
  var user = this,
      chars = "_!abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      token = new Date().getTime() + '_';
  for ( var x = 0; x < 16; x++ ) {
    var i = Math.floor( Math.random() * 62 );
    token += chars.charAt( i );
  }
  return token;
};

// Seed a user

var User = mongoose.model('User', userSchema);

//setting up passport 
passport.serializeUser(function(user, done) {
 var createAccessToken = function () {
    var token = user.generateRandomToken();
    User.findOne( { accessToken: token }, function (err, existingUser) {
      if (err) { return done( err ); }
      if (existingUser) {
        createAccessToken(); // Run the function again - the token has to be unique!
      } else {
        user.set('accessToken', token);
        user.save( function (err) {
          if (err) return done(err);
          return done(null, user.get('accessToken'));
        })
      }
    });
  };

  if ( user._id ) {
    createAccessToken();
  } 

  
});

passport.deserializeUser(function(token, done) {
  User.findOne( {accessToken: token } , function (err, user) {
    done
    (err, user
    	) 
    	
    
  });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
      	console.log(user);
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));




var app = express();

//configure express
app.configure(function() {
  app.use(express.logger('dev'));
  app.use(express.cookieParser('thissecretrocks'));
  
  app.use(flash());
  app.set('view engine', 'html');
  app.engine('html', hbs.__express);
  app.use(express.bodyParser());
  app.use(express.static('public'));
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  
  app.use( function (req, res, next) {
    if ( req.method == 'POST' && req.url == '/login' ) {
      if ( req.body.rememberme ) {
        req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Rememeber 'me' for 30 days
      } else {
        req.session.cookie.expires = false;
      }
    }
    next();
  });


  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

});


//the index get request 


app.get('/', function(req, res) {

	if(!req.user) {
    
	res.redirect('loginform');
	}

	else {
    var list12 = [];
    Entry.find({'opid' : req.user.id}, function(err, entries) {
      console.log(entries);
      if(entries.length != 0) {

        console.log("adding");
        var length = entries.length;
        entries.forEach( function(currentEntry){
           Comment.find({'postid' : currentEntry.id}, function(err2, comments){
                     
                    if(err2) {
                          console.log("no comment");
                         list12.push(currentEntry);
                          length--;
                          if(length <= 0){
              res.render('index',{title:"My Wall", entries: list12, user:req.user}); 
                          }

                    }
                    else {
                        console.log("yes comment");
                        currentEntry.commentst = comments;
                        list12.push(currentEntry);
                        length--;
                        if(length <= 0){
              res.render('index',{title:"My Wall", entries: list12, user:req.user});
                        }
                    }




          });
           
                
            
        });
    }
    else {
        res.render('index',{title:"My Wall", entries: list12, user:req.user});
    }
  });
    //var ans = blogEngine.getBlogEntries(req.user.id);
    //console.log(ans);
		
	}
});

//about page render
app.get('/about', function(req, res) {
	res.render('about', {title:"About Me"});
});


//article page render with id dir. to uniquify every post 
app.get('/article/:id', function(req, res) {
	var usersp = req.user;
	
	Entry.find( { "_id": req.params.id}, function(err, mehul){
			//console.log(mehul);
			res.render('article',{title: mehul[0].title, blog:mehul[0], user : usersp});
	}); 
});



app.get('/profile/:posteruname', function(req,res){
  User.find({"username" : req.params.posteruname}, function(err, theuser){
    if(!err) {
      theuser.push("Hello")
      
      console.log(theuser[0]);
      res.render('profile', {title: theuser[0].username, theoneuser : theuser[0], entries:blogEngine.getBlogEntries(theuser[0].id), user:  req.user})
    }
    else {
      res.render('404')
    }

  });
  

});
//similar to article one, but delete. 
app.get('/delete/:id', function(req, res) {
	blogEngine.deletedata(req.params.id);
	res.redirect('/');
});

app.get('/feed', function(req, res){


  var list12 = [];
  Entry.find(function(err, entries) {
    if(!err) {
      console.log("adding");
      var length = entries.length;
      entries.forEach( function(currentEntry){
        Comment.find({'postid' : currentEntry.id}, function(err2, comments){

          if(err2) {
            console.log("no comment");
            list12.push(currentEntry);
            length--;
            if(length <= 0){
              res.render('feed', {title : "News Feed", entries: list12, user: req.user});
            }

          }
          else {
            console.log("yes comment");
            currentEntry.commentst = comments;
            list12.push(currentEntry);
            length--;
            if(length <= 0){
              res.render('feed', {title : "News Feed", entries: list12, user: req.user});
            }
          }
        });
      });
    }
    
    //var ans = blogEngine.getBlogEntries(req.user.id);
    //console.log(ans);
    
  });

});


app.get('/inbox', function(req, res){

	res.render('inbox', {title : "Messages", messages:blogEngine.getMessages(req.user.username), user: req.user})

});

app.get('/myinfo', function(req, res){
  console.log(req.user);

  res.render('myprofile', {title : "My Profile", user : req.user});

});


app.get('/loginform', function(req,res){
	res.render('login', {title: "Log in "});
});


app.get('/signupform', function(req, res){
	res.render('signup', {title: "signup"});
});

//gets info from form -- saves to db. If successful redirects to index, if not tells you to GTFO!!!
app.post('/getpost', function(req, res) {new Entry({
		
		"type" : req.body.typeans,//req.body.typeans.options[typeans.selectedIndex].value,
		"title" : req.body.posttitle,
		"post" : req.body.postentry,
		"published": Date.now(),
		"opid" :  req.user.id,
		"username" : req.user.username
	}).save(function(err, todo, count){
		res.redirect('/');
		//console.log(todo);
	});
});


//comment system
var Comment = mongoose.model("Comment");

app.post('/comment', function(req, res) {
 
console.log("========================================")
console.log(req.user);
	new Comment({
		"thecomment" : req.body.comment,
		"postid" : req.body.id,
		"posteruname": req.user.username

	}).save(function(err, todo, count){

		res.redirect('/feed');
		console.log(todo);
	});


});






//USER AUTHENTICATION



app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.session.messages =  [info.message];
      return res.redirect('/loginform')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }

      return res.redirect('/');

    });
  })(req, res, next);
});



/*app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/loginform', // redirect to the secure profile section
		failureRedirect : '/signupform', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));
*/
/*app.post('/signup', function(req, res){
	var mehul = false;  
	User.find({username : req.body.username}, function(err, user){
		
		
					new User  ({
						"username" : req.body.username,
						"email" : req.body.email,
						"password" : req.body.password
							}).save(function(err, user) {
								if(!err) {console.log(user);
								res.redirect('/loginform');}

								else {
                  res.render('signup', {message : "Email/Username already taken"});
                }
						});

		});
});


*/

app.post('/signup', function(req, res){
  var mehul = false;  
  User.find({username : req.body.username}, function(err, user){
    
  console.log(user.length);
    
    if(user.length != 0) {

       res.render('signup', {message : "Username is taken"});
         

            }
    else {
      User.find({email : req.body.email}, function(err2, user2) {

        if(user2.length == 0) {

           new User  ({
            "username" : req.body.username,
            "email" : req.body.email,
            "password" : req.body.password
              }).save(function(err, user) {
                if(!err) {console.log(user);
                res.redirect('/loginform');}

                else {
                  res.render('signup', {message : "Something went wrong, try again. "});
                }
            });

        }


        else {
          res.render('signup', {message : "Email is registered"});

        }


      });
      ///
     

    }

    });






});






app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/loginform');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}




app.listen(process.env.PORT || 3000);


//From here on is the code from schot.io - prolly won't use it 
/*var User = mongoose.model('User');


app.get('/loginform', function(req,res){
	res.render('login', {title: "Log in "});
});



app.post('/login', passport.authenticate('local-signup', {
		successRedirect : '/', 
		failureRedirect : '/loginform', 
		failureFlash : true 
	}));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
        console.log("asdF");
    });

  
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    passport.use('local-signup', new LocalStrategy({
      
        usernameFeild : 'email',
        passwordFeild : 'password',
        passReqToCallback : true 
    },

    function(req, email, password, done) {

		console.log("asdf");
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
                var newUser  = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);

				// save the user
                newUser.save(function(err) {
                    if (err)
                        {console.log("ERROR");}
                    else {console.log("NO");
               			}
                    return done(null, newUser);
                });
            }

        });        

    }));
*/