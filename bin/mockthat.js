#!/usr/bin/env node
const mockthat = require('../dist/main');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const open = require('open');

const port = argv.port || 7000;

mockthat.initialize(path.resolve(argv.path || './mocks'), port);
open(`http://localhost:${port}/`);
