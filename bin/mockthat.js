#!/usr/bin/env node
var mockthat = require('../dist/main');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));

mockthat.initialize(path.resolve(argv.path || './mocks'), argv.port || 7000);
