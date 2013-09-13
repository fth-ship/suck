#!/usr/bin/env node
'use stict';
var program = require('commander');
var crawler = require('../lib');
var path = require('path');
var fs = require('fs');

// comparison lists
var output = [];

function integer (val) {
    return parseInt(val, 10);    
}

function list (val) {
    return val.split(',');
}

function findPatternsAndLog ( program ) {
    var options = {
        target: program.target,
        pattern: program.list
    };
    var limit = program.end || 100;


    function end () {
        return process.exit( 0 );
    }

    function crawlerHandler ( e, stack, res ) {
        if ( e ) {
            fs.writeFileSync( 
                path.join( program.err || 'error.log' ), 
                JSON.stringify( e ),
                'utf-8'
            );
            end();
        } else if ( program.out ) {
            fs.writeFileSync( 
                path.join( program.out ), 
                JSON.stringify( output ),
                'utf-8'
            );
            end();
        } else {
            console.log( JSON.stringify( output, null, 4 ) );    
            end();
        } 
    }

    function crawlerRecursionHandler (e, stack, res ) {
        if ( limit ) { 
            stack.map(function ( href ) {
                if ( output.indexOf( href ) === -1 ) {
                    output.push( href ); 
                }
            });
            limit -= 1;
            crawler.pattern.search( options, crawlerRecursionHandler );
        } else {
            crawlerHandler( e, stack, res );
        }
    }
    crawler.pattern.search( options, crawlerRecursionHandler );
}

program
    .version('0.0.1')
    .usage('[options]')
    .option('-t, --target [host]', 'Target of search')
    .option('-l, --list <patterns>', 'Patterns to match', list)
    .option('-e, --end <n>', 'Limit of exploration', integer)
    .option('-o, --out [file]', 'Out filename')
    .option('-e, --err [file]', 'Error filename')
    .parse(process.argv);

if ( program.target && program.list ) {
    findPatternsAndLog(program);    
}
