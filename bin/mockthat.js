#!/usr/bin/env node
var mockthat = require('../dist/main');

mockthat.initialize(path.resolve('./examples'), 7000);
