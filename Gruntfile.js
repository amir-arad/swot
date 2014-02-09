module.exports = function(grunt) {

    // Keep track of protractor (end-to-end test runner) exit code. If it's anything other than 0,
    // we want to suppress the "Done, without errors" message that grunt emits upon finishing all
    // the tasks.
    var protractorExitCode = null;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        env: {
            dev: {
                // Environment variables for dev configuration
                PORT: 3000,
                MONGODB_URL: 'localhost:27017/swot'
            },
            prod: {
                // Environment variables for running in production
                PORT: 80
                // TODO: Create a secrets file, and load things like the MongoLab URL and the cookie
                // secret from there. Keep that file out of version control.
            },
            test: {
                // Environment variables for end-to-end tests
                PORT: 3033,
                MONGODB_URL: 'localhost:27017/swot_test'
            }
        },

        shell: {

            // Launch the application
            app: {
                command: "node app.js"
            },

            // Launch the application in the background
            'app-background' : {
                command: "node app.js",
                options: {
                    async: true
                }
            },

            // Run mocha unit tests
            mocha: {
                command: "mocha test/unit"
            },

            // Start selenium server (used for end-to-end tests)
            'webdriver-manager': {
                command: "webdriver-manager start",
                options: {
                    async: true
                }
            },

            // Launch protractor (end-to-end test runner for AngularJS - requires selenium to be running)
            protractor: {
                command: "protractor e2e.conf.js",
                options: {
                    callback: function(code, out, err, cb) {
                        protractorExitCode = code;
                        cb();
                    }
                }
            },

            options: {
                stdout: true,
                stderr: true,
                failOnError: false
            }
        }
    });

    // Plugins
    // -------

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-shell-spawn');

    // Tasks
    // -----

    // Utility task for waiting a specified number of seconds (e.g., "wait:3" waits for 3 seconds).
    // Workaround for waiting for background processes to actually launch before continuing on to
    // the next task, which may depend on the background process.
    grunt.registerTask('wait', function() {
        var done = this.async();
        var seconds = parseInt(this.args[0], 10);
        if (isNaN(seconds)) { seconds = 1; }
        setTimeout(function () {
            done(true);
        }, 1000 * seconds);
    });

    // This task simply suppresses the default "Done, without errors" message that grunt emits upon
    // finishing all the tasks if protractor exited with a non-zero exit code, which happens if
    // there are any failing tests.
    grunt.registerTask('e2e-report', function () {
        if (protractorExitCode !== 0) {
            grunt.warn('Protractor exited with a non-zero exit code (' + protractorExitCode + '). ' +
                'Check the output above for any failing tests.');
        }
    });

    grunt.registerTask('default',
        'Launches the application with a dev config.',
        ['env:dev', 'shell:app']);

    grunt.registerTask('test:unit',
        'Runs unit tests',
        ['env:test', 'shell:mocha']);

    grunt.registerTask('test:e2e',
        'Runs end-to-end tests',
        [
            'env:test',
            'shell:app-background',
            'shell:webdriver-manager',
            'wait:3',                   // Wait for selenium server to start before proceeding
            'shell:protractor',

            // Cleanup
            'shell:app-background:kill',
            'shell:webdriver-manager:kill',

            // Suppress "Done, without errors" message if there are failing tests
            'e2e-report'
        ]);

    grunt.registerTask('test',
        'Runs unit tests only (use test:e2e to run end-to-end tests, or test:all to run both unit tests and end-to-end tests)',
        ['test:unit']);

    grunt.registerTask('test:all',
        'Runs unit tests and end-to-end tests',
        ['test:unit', 'test:e2e']);

    grunt.registerTask('test:cleanup',
        'Performs cleanup after running end-to-end tests (kills the app and stops selenium server)',
        ['shell:cleanup']);

};
