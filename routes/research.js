var Quiz = require('../lib/quiz').Quiz;
var config = require('../config/config');

exports.subject = function (req, res) {
    res.render('research', { title: 'New Research', message: req.flash('error')});
};

exports.choose =  function (req, res) {
    var quizId = req.body.id;      // params or   query?
    Quiz.findOne({ _id: quizId }, function (err, quiz) {
        if (err || !quiz || !req.user.ownsQuiz(quiz)) {
            req.flash('error', config.messages.badQuizId);
            res.redirect('back');
        } else {
            res.redirect('/quiz/'+ quizId);
        }
    });
};