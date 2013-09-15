#!/usr/bin/env node
'use stict';

/* * * * * * * * * * 
 *                 *
 *  Dependencies   *
 *                 *
 * * * * * * * * * */

var program = require('commander');
var programHandler = require('./handler');

// run the handlers
// @param program
programHandler( program, process );
