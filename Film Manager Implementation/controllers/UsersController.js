'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local');
var utils = require('../utils/writer.js');
var Users = require('../service/UsersService');
const User = require('../components/user');
var WebSocket = require('../components/websocket');
var WSMessage = require('../components/ws_message.js');


function WebSocketLogoutNotify(req) {
  const email = req.user.email;
  Users.getUserByEmail(email)
    .then((user) => {
      if(user === undefined) {
        return utils.writeJson(res, { errors: [{ 'param': 'Server', 'msg': 'Unauthorized access.' }],}, 401);
      } else {
        req.logout(() => {
          // Notify all the clients that a user has logged out
          console.log("WebSocket logout notification");
          var logoutMessage = new WSMessage('logout', user.id, user.name);
          WebSocket.sendAllClients(logoutMessage);
          WebSocket.deleteMessage(user.id);
        });
      }
    });
}

var sessionTimeouts = {};

function handleSessionExpiration(req) {
  console.log("Session expired");
  
  // Notify all the clients that a user has logged out
  WebSocketLogoutNotify(req);
  
}


// Set up local strategy to verify, search in the DB a user with a matching password, and retrieve its information by userDao.getUser (i.e., id, username, name).
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async function verify(username, password, done) {
  Users.getUserByEmail(username)
          .then((user) => {
              if (user === undefined) {
                return done(null, false, { message: 'Unauthorized access.' });
              } else {
                  if (!Users.checkPassword(user, password)) {
                    return done(null, false, { message: 'Unauthorized access.' });
                  } else {
                      return done(null, user);
                  }
              }
          }).catch(err => done(err));
}));

// middleware to interrupt the timeout of the session (if any)
module.exports.checkSessionTimeout =  function checkSessionTimeout(req, res, next) {
  if (req.isAuthenticated()) {
    // check if the sessionTimeout object has a timeout for the user
    if (sessionTimeouts[req.sessionID]) {
      clearTimeout(sessionTimeouts[req.sessionID]);
      delete sessionTimeouts[req.sessionID];
    }
  }
  next();
}

module.exports.authenticateUser = function authenticateUser (req, res, next) {

  if (req.isAuthenticated()) {
    // Logs out the user and notify all the clients that a user has logged out
    WebSocketLogoutNotify(req);
  } 

  // continue with login after logout

  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // set the session timeout
      sessionTimeouts[req.sessionID] = setTimeout(() => {
        handleSessionExpiration(req);
        delete sessionTimeouts[req.sessionID];
      }, 300000); // 5 minutes
      console.log("Session started for user " + req.user.email);

      // Notify all the clients that a user has logged in
      Users.getActiveFilmUser(user.id)
      .then((film) => {
        var loginMessage;
        if(film == undefined) loginMessage = new WSMessage('login', user.id, user.name, undefined, undefined);
        else loginMessage = new WSMessage('login', user.id, user.name, film.id, film.title);
        WebSocket.sendAllClients(loginMessage);
        WebSocket.saveMessage(user.id, loginMessage);
        utils.writeJson(res, new User(user.id, user.name, user.email));
      });  
    });
  })(req, res, next);

};

module.exports.getUsers = function getUsers (req, res, next) {
  Users.getUsers()
    .then(function (response) {
      if(!response){
        utils.writeJson(res, response, 404);
     } else {
       utils.writeJson(res, response);
    }
    })
    .catch(function (response) {
      utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
    });
};

module.exports.getSingleUser = function getSingleUser (req, res, next) {
  Users.getUserById(req.params.userId)
    .then(function (response) {
      if(!response){
        utils.writeJson(res, response, 404);
     } else {
       utils.writeJson(res, response);
    }
    })
    .catch(function (response) {
      utils.writeJson(res, {errors: [{ 'param': 'Server', 'msg': response }],}, 500);
    });
};

