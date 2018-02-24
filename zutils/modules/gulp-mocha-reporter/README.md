gulp-mocha-reporter
===

Totally Forked From Gulp-Mocha



### Why Create This Project

For Some Reason, Mocha Only Support Xunit File Reporter Output.

There Is Only This Part Different From Gulp-Mocha.

##### reporter

Type: `string`<br>
Default: `spec`
Values: [Reporters](https://github.com/mochajs/mocha/tree/master/lib/reporters)

Reporter that will be used.

This option can also be used to utilize third-party reporters. For example, if you `npm install mocha-lcov-reporter` you can then do use `mocha-lcov-reporter` as value.

##### reporterOptions

Only Support Xunit Reporter.

Type: `Object`<br>
Example: `reporterOptions: {output: 'ztests/mocha.xml'}`

Reporter specific options.


