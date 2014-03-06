
// app.js
// Created: Don't remember
// Modified: 22 Feb 2014
// Copyright Mehul Patel





//requiring the db.js file --> majority of the schemas are defined in that files, except some due to technical reasons
require('./db');
require('./jquery')
//require('./leaflet');




//requires all the necessary module
var flash = require('connect-flash');
//the hero of the app
var express = require('express');
//the hero of HTML
var hbs = require('hbs');
//well it's the BlogEngine - What more can I say?
var blogEngine = require('./blog');
//the hero of user auth
var passport = require('passport');
//the hero of mongodb
var mongoose = require('mongoose');
//seed an Entry 
var Entry = mongoose.model('Entry');
//Passport's bitch
var LocalStrategy = require('passport-local').Strategy;
//ccrypt 
var bcrypt = require('bcrypt');
//salt hasf factor
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema; 
//node mailer api 
var nodemailer = require("nodemailer");
var lat;
var longi;


//defination of the user schema 
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



//initialize app 
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




//The invite code system --> Buggy need to fix 
app.get('/invite', function(req, res){
  res.render('invite');
});



//used to restrict the amount of entires pulled from the db to the the ones uploaded since yesterday 
var date = new Date();
var date2 = date-(100000000);
var date3 = new Date(date2);


//Algo to calculate the shortest straight line distance, betwween two users using the Havershine's formula. 
function distance(lat, longi, lat2, lon2) {
  var radlat1 = Math.PI * lat/180
  var radlat2 = Math.PI * lat2/180
  var radlon1 = Math.PI * longi/180
  var radlon2 = Math.PI * lon2/180
  var theta = longi-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  return dist;
}

//Algo to sort the list returend from the query to the db. 
function sortlist12(list12) {
  var list13 = [];
  for(var i = 0; i < list12.length; i++) {
     list12[i].latlongsub = distance(lat, longi, list12[i].lat, list12[i].longi);
     console.log(list12[i].latlongsub);
  }
  for(var j = 0; j < list12.length; j ++) {
    var min = 10000000;
    for(var k = 0; k  < list12.length; k++) {
      if(list12[k].latlongsub <= min) {
        min = list12[k].latlongsub;
      }
    }
    for(var j = 0; j < list12.length; j++) {
      console.log("sdf");
      console.log(min);
      console.log(list12[j].latlongsub);
      if(list12[j].latlongsub == min) {
        console.log("af")
        if(list12[j].latlongsub <= 1) {
          list13.push(list12[j]);
        }
        list12.splice(j, 1);
        console.log(list13);
      }
    }
  } 
  return list13;
}

/*function getPlace() {
     $.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + "," + longi + "&sensor=true", function(data) {
            return data;
         });
  }
  */

//the index render page
app.get('/', function(req, res) {
 
  if(!req.user) {
    //if not logged in --> take to login 
   res.redirect('loginform');

	}
  else {
    //if logged in, pull the users entry from the db and upload on the page
    var list12 = [];
    //look for entries from this user in db
    Entry.find({'opid' : req.user.id }, function(err, entries) {
      //if user has entries excute the following 
      if(entries.length != 0) {
        var length = entries.length;
        entries.forEach( function(currentEntry){
           //check is all the user's posts have comments 
           Comment.find({'postid' : currentEntry.id}, function(err2, comments){
              //if not render witout comments
              if(err2) {
                console.log("no comment");
                list12.push(currentEntry);
                length--;
                if(length <= 0){
                  res.render('index',{title:"My Wall", entries: list12, user:req.user, lati : lat, longit : longi}); 
                  }
                } else {
                    //if yes --> add them comments to the comment fiedl and then render teh page 
                    console.log("yes comment");
                    currentEntry.commentst = comments;
                    list12.push(currentEntry);
                    length--;
                    if(length <= 0){
                      res.render('index',{title:"My Wall", entries: list12, user:req.user, lati : lat, longit : longi});
                      }
                  }
            });
          });
     }
     else {
         //if not entries render this
         res.render('index',{title:"My Wall", entries: list12, user:req.user,  lati : lat, longit : longi});
    }
  });
    //var ans = blogEngine.getBlogEntries(req.user.id);
    //console.log(ans);
		
	}
});


//Code for what is rendered on the feed.html page 
app.get('/feed', function(req, res){
  //initialize the list that will streo teh entries 
  var list12 = [];
  //look for posts posted by everyone since yesterday
  Entry.find({'published' : {"$gte" : date3} }, function(err, entries) {
    if(!err) {
      var length = entries.length;
      entries.forEach( function(currentEntry){
        //find comments
        Comment.find({'postid' : currentEntry.id}, function(err2, comments){
          //check if they have comments
          if(err2) {
            console.log("no comment");
            list12.push(currentEntry);
            length--;
            //if no don't do enything to json object --> call sort to 
            if(length <= 0){
              res.render('feed', {title : "News Feed", entries: sortlist12(list12), user: req.user});
            }
          }
          else {
            //if yes add to JSON object and  call the sort algorithm to sort the data. 
            console.log("yes comment");
            currentEntry.commentst = comments;
            list12.push(currentEntry);
            length--;
            if(length <= 0){
              res.render('feed', {title : "News Feed", entries: sortlist12(list12), user: req.user});
            }
            //end ofthe else block 
          }
          //end of the comment.find block
        });
        //end of the entries.forEach loop block
      });
      //end of the first if block
    }
    //end of Entry.find() block
  });
  //If you don't know what this end's. You should die in a hole, never to be seen every again. And if you dare resurface on the face of this eary, I will find you and I will almost kill you. Almost, is the key word. But after that I will teach you a lesson unlike anyother. Guess MOTHA FUCKHA!
});


//about page render --> Why haven't I gotten rid of this page?
app.get('/about', function(req, res) {
	res.render('about', {title:"About Me"});
});


//render the singe-view post page
app.get('/article/:id', function(req, res) {
  var usersp = req.user;

  //finds a specific entry 
	Entry.find( { "_id": req.params.id}, function(err, thepost){

    // var distance =  distance(lat, longi, thepost[0].lat, thepost[0].longi);
      if(err) {
        res.render('article',{title: thepost[0].title, blog:thepost[0], user : usersp});
      }
      else {
		  res.render('article',{title: thepost[0].title, blog:thepost[0], user : usersp, distanceFromMe : distance(lat, longi, thepost[0].lat, thepost[0].longi)});
    }
	}); 
});

//Render's the profile page of a certain user 
app.get('/profile/:posteruname', function(req,res){


  User.find({"username" : req.params.posteruname}, function(err, theuser){
    if(!err) {
      //had to push a var in the array, because the indexing was acting up and couldn't get the index[0] whithout have an index of 1 -- weird! IKR 
      theuser.push("Hello")
      console.log(theuser[0]);
      res.render('profile', {title: theuser[0].username, theoneuser : theuser[0], entries:blogEngine.getBlogEntries(theuser[0].id), user:  req.user})
    }
    else {
      res.render('404')
    }
  });
});

//Func to delete a certain post. 
app.get('/delete/:id', function(req, res) {
	blogEngine.deletedata(req.params.id);
	res.redirect('/');
});

//rends the usrer's profile info page
app.get('/myinfo', function(req, res){
  
  function calcAmt() {
       Entry.find( { "username": req.user.id}, function(err, theposts) {
        if(err) {
          return 0;
        }

        else {
          return theposts.length;
        }
      });
}
  console.log(req.user);

  res.render('myprofile', {title : "My Profile", user : req.user, numOfPosts : calcAmt() });

});

//renders the login form
app.get('/loginform', function(req,res){
	res.render('login', {title: "Log in "});
});

//renders the signup form
app.get('/signupform', function(req, res){
	res.render('signup', {title: "signup"});
});

//gets info from form -- saves to db. If successful redirects to index, if not tells you to GTFO!!!
app.post('/getpost', function(req, res) {new Entry({
    //assigns all elements to the JSON object keys 
		"type" : req.body.typeans,//req.body.typeans.options[typeans.selectedIndex].value,
		"title" : req.body.posttitle,
		"post" : req.body.postentry,
		"published": Date.now(),
		"opid" :  req.user.id,
		"username" : req.user.username,
    "lat" : req.body.lat,
    "longi" : req.body.long,
    "latlongsub": req.body.lat - req.body.long
	}).save(function(err, todo, count){
    //once saved redirect to index
		res.redirect('/');
		;
	});
});


//Beginning of the comment system

//seeding the comment schema 
var Comment = mongoose.model("Comment");

app.post('/comment', function(req, res) {
  //creates a new Comment object 
  new Comment({
		"thecomment" : req.body.comment,
		"postid" : req.body.id,
		"posteruname": req.user.username
  }).save(function(err, todo, count){
    res.redirect('/feed');
		console.log(todo);
	});


});


var InviteCode = mongoose.model("inviteCode");
new InviteCode({
    code : "axfertlsdf124dk3"

}).save(function(err, res) {
  if(!err) {
  console.log("saved"); }
  else {
    console.log("err");
  }

});
app.post("/processcode", function(req, res) {

    InviteCode.find({code : req.body.invitecode}, function(err, code) {
     
      if(code.length != 0) {
        res.redirect('/loginform');
      }
      else {
        res.render('invite', { message : "Wrong Invite Code"});
      }

    })

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
      console.log(req.body);
      lat = req.body.lat;
      longi = req.body.long;
      

      
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

function sendEMail(to,from, subject, text ) {



var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "lodo1928@gmail.com",
        pass: "lionandtiger12"
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: "HyperLocal <foo@blurdybloop.com>", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plaintext body
    html: "<b>Hello world</b>" // html body
}

// send mail with defined transport object
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
});


}
app.post('/signup', function(req, res){
   
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
                sendEMail(req.body.email, "mehulpatel696@yahoo.com", "Thank You Signing up for HyperLocal!", "Please click on the invisible activation link brohter!");
                res.redirect('/loginform');}

                else {
                  res.render('signup', {message : "Something went wrong, try again. "});  }
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


app.get('/forgotpassword', function(req, res) {

    res.render('fpass');

   
});

app.post('/recoverPassword', function(req, res) {

  console.log(req.body);
  User.find({"email" :  req.body.email}, function(err, data) {
        if(err) console.log("sfd");
        else {

          sendEMail(req.body.email, "mehulpatel696@yahoo.com", "Thank You Signing up for HyperLocal!" );

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


//NEW CODE MOTHAFUCKA!!! SOCKET.IO INTEGRATION. THIS IS THE CODE FOR CHAT. I NEED TO FUCKING OPTIMIZE SHIT AFTER I FINISH THE CHAT. MOTHER FUCKERS. HOLA SENOR. I AM TIRED, IT IS 4AM I DIE U DIE THE WORLD ENDS FUCK EVERYONE


/*
app.get('/inboxtest/:posteruname', function(req,res){
 res.render('inbox', {title : "Messages", messages:blogEngine.getMessages(req.user.username), user: req.user, reciever: req.params.posteruname})
});

var Chat = mongoose.model("Chate");

app.post('/getmessage', function(req, res) {

  new Chat( {
    sender :  req.body.user,
    reciever: req.params.posteruname,
    msg: req.body.message
  }).save(function(err, saved){
    if(err) throw err
    res.render('inbox', {title : "Messages", messages:blogEngine.getMessages(req.user.username), user: req.user, reciever: req.params.posteruname})

  });

});

*/




//sending email implementation 


// creavar users = {};
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = {};

app.get('/inboxtest/:posteruname', function(req,res){
  console.log( req.user);
    var Chat = mongoose.model('Chate');




io.sockets.on('connection', function(socket){
  var query = Chat.find({});
  query.sort('-created').limit(8).exec(function(err, docs){
    if(err) throw err;
    socket.emit('load old msgs', docs);
  });
  
  socket.on('new user', function(data, callback){
    if (data in users){
      callback(false);
    } else{
      console.log(users);
      callback(true);
      socket.nickname = req.user.username;
      users[socket.nickname] = socket;
      updateNicknames();
      console.log(users);
    }
  });
  
  function updateNicknames(){
    io.sockets.emit('usernames', Object.keys(users));
  }

 socket.on('send message', function(data, callback){
    /*var msg = data.trim();
    
    var name = req.params.posteruname;
      
      if(name in users){
       users[name].emit('whisper', {msg: msg, nick: socket.nickname});
       users[req.user.username].emit('whisper', {msg: msg, nick: socket.nickname});
    } 
    else{
       callback('Error!  Enter a valid user.');
    }
      */


    
  });
  
  socket.on('disconnect', function(data){
    if(!socket.nickname) return;
    delete users[req.user.username];
    updateNicknames();
  });
});


      res.render('inboxtest', {title : "Messages", messages:blogEngine.getMessages(req.user.username), user: req.user, reciever: req.params.posteruname});


});
// create a map in the "map" div, set the view to a given place and zoom



server.listen(*process.env.PORT || 3000);


//app.listen(/*process.env.PORT ||*/ 3000);

