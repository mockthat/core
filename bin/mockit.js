#!/usr/bin/env node

var mockit = require('../dist/main');

mockit.initialize(path.resolve('./examples'), 7000);
