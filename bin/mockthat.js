#!/usr/bin/env node
var mockthat = require('../dist/main');
var path = require('path');

mockthat.initialize(path.resolve('./examples'), 7000);
