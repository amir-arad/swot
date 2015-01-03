// External libraries
var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(express);
var less = require('less-middleware');
var logger = require('./config/logger');
var expressWinston = require('express-winston');

// Project libraries/middleware
var config = require('./config/config');
var user = require('./lib/middleware/user');
var admin = require('./lib/middleware/admin');
var authentication = require('./lib/middleware/authentication');
var restrict = require('./lib/middleware/restrict');

// Routing includes
var login = require('./routes/login');
var quiz = require('./routes/quiz');
var research = require('./routes/research');

// Authentication
passport.use(new LocalStrategy({ usernameField: 'email' }, authentication.authenticate));
passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);

// Initialize the app and db
var app = express();
mongoose.connect(config.mongodbUrl);

// all environments
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//Should be placed before express.static
app.use(express.compress({
    filter: function(req, res) {
        return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 5
}));
//Setting the fav icon and static folder
app.use(express.favicon());
// app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser(config.secret));
app.use(express.session({
    secret: config.secret,
    store: new MongoStore({
        db: mongoose.connection.db
    })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(require('less-middleware')({ src: path.join(__dirname, 'client') }));
app.use(express.static(path.join(__dirname, 'client')));
app.use('/media_files', express.static(path.join(__dirname, 'media_files')));
app.use(user);
app.use(admin);
app.use(restrict({
    allowedRoutes: ['/', '/login'],
    redirectTo: '/login'
}));
app.use(app.router);
app.use(expressWinston.errorLogger({winstonInstance: logger }));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// ----------------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------------

// Home
app.get('/', function(req, res) {
    if (req.isAuthenticated()) { res.redirect('/research'); }
    else { res.redirect('/login'); }
});

// Login
app.get('/login', login.form);
app.post('/login', passport.authenticate('local', { successRedirect: '/research',
                                                    failureRedirect: '/login',
                                                    failureFlash: true }));
app.get('/logout', login.logout);

// Quizzes
app.get('/quizzes', quiz.quizzes);
app.get('/research', research.subject);
app.post('/research', research.choose);
app.get('/create', quiz.createForm);
app.post('/create', quiz.create);
app.get('/edit/:id', quiz.edit);
app.get('/load', quiz.load);
app.post('/save', quiz.save);
app.post('/delete', quiz.deleteQuiz);
app.get('/quiz/:id', quiz.quiz);
app.get('/export', quiz.exportJson);
app.delete('/quizzes/:id', quiz.deleteQuiz);

// Questions
app.get('/questions', quiz.questions);
app.post('/submit', quiz.submitQuestion);

// Topics
app.get('/topics/:id', quiz.getTopic);
app.post('/topics', quiz.addTopic);
app.patch('/topics/:id', quiz.patchTopic);
app.delete('/topics/:id', quiz.deleteTopic);

// ----------------------------------------------------------------------------

// testing all log levels
logger.log('silly', "starting up");
logger.log('debug', "starting up");
logger.log('verbose', "starting up");
logger.log('info', "starting up");
logger.log('warn', "starting up");
logger.log('error', "starting up");

// Start the server
http.createServer(app).listen(app.get('port'), function(){
    logger.info("Express server listening on port", app.get('port'));
});
