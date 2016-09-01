
const gulp = require('gulp');
const browser = require('browser-sync');
const del = require('del');
const EmailTemplate = require('email-templates').EmailTemplate;
const path = require('path');
const fs = require('fs');
const gUtil = require('gulp-util');

var emailTemplate = process.argv[3];
if (emailTemplate) {
    emailTemplate = emailTemplate.substr(2, emailTemplate.length-1);
} else {
    emailTemplate = 'my-template';
}

gUtil.log('Serving email template:', gUtil.colors.bold(emailTemplate));

var paths = {
    dist: 'dist',
    handlebars: 'templates/**/*.hbs',
    partials: 'templates/**/_*.hbs',
    css: 'templates/**/*.scss',
    foundation: 'node_modules/foundation/scss',
    events: 'templates/**/event.json'
};


gulp.task('serve', gulp.series(clean, generateHtml, server, watch));

gulp.task('clean', gulp.series(clean));


function clean() {
    return del(['dist']);
}

function generateHtml(done) {
    var templateDir = path.join(__dirname, 'templates', emailTemplate),
        options = {
            sassOptions: {
                includePaths: [path.join(__dirname, paths.foundation)]
            }
        },
        notification = new EmailTemplate(templateDir, options),
        eventPath = path.join(__dirname, 'templates', emailTemplate, 'event.json'),
        event = JSON.parse(fs.readFileSync(eventPath).toString());

    notification.render(Object.assign({}, event.data))
        .then(function(result) {
            if (!fs.existsSync(paths.dist)) {
                fs.mkdirSync(paths.dist);
            }

            fs.writeFileSync('dist/index.html', result.html);
            done();
        })
        .catch(function(error) {
            console.log(error);
            done();
        });
}

function watch() {
    gulp.watch([paths.handlebars, paths.css, paths.events])
        .on('change', gulp.series(generateHtml, browser.reload));
}

function server(done) {
    browser.init({
        server: 'dist'
    });
    done();
}
