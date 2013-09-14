#!/usr/bin/env node
'use stict';
var program = require('commander');
var crawler = require('../lib');
var path = require('path');
var pack = require('../package');
var fs = require('fs');

// comparison lists
var output = [];
var usage = [];

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
    var out = program.out || 'output.json';
    var err = program.err || 'error.json';
    var outputStream = program.out && fs.createWriteStream( out ) || null;

    function end () {
        delete options;
        delete limit;
        delete out;
        delete err;
        delete outputStream;
        return process.exit( 0 );
    }

    function crawlerHandler ( e, stack, res ) {
        if ( e ) {
            fs.writeFileSync( 
                path.join( err ), 
                JSON.stringify( e ),
                'utf-8'
            );
            console.log('Sorry, but something is wrong: %s', err);
            end();
        } else if ( program.out ) {
            outputStream.write( JSON.stringify( output ) );
            outputStream.close();
            console.log('Completed: %s', out );
            end();
        } else {
            console.log( JSON.stringify( output, null, 4 ) );    
            end();
        } 
    }

    function crawlerRecursionHandler (e, stack, res ) {
        function stackHandler ( href ) {
            usage.push( href );
            if ( output.indexOf( href ) === -1 ) {
                output.push( href ); 
                if ( program.verbose ) {
                    console.log(
                        '[ %s ] - %s - total: %s', 
                        res.status, 
                        href, 
                        output.length
                    );
                }
            }
        }

        function recursionHandler () {
            stack.map( stackHandler );
            limit -= 1;
            options['target'] = usage[0];
            usage.shift();
            crawler.pattern.search( options, crawlerRecursionHandler );
        }

        function finalHandler () {
            crawlerHandler( e, stack, res );
        }

        if ( limit ) { 
            recursionHandler();    
        } else {
            finalHandler();
        }
    }
    crawler.pattern.search( options, crawlerRecursionHandler );
}

program
    .version( pack['version'] )
    .usage('[options]')
    .option('-t, --target [host]', 'Target of search')
    .option('-l, --list <patterns>', 'Patterns to match', list)
    .option('-e, --end <n>', 'Limit of exploration', integer)
    .option('-o, --out [file]', 'Out filename')
    .option('-e, --err [file]', 'Error filename')
    .option('-v, --verbose', 'Show progress in the stdout')
    .parse(process.argv);

if ( program.target && program.list ) {
    findPatternsAndLog(program);    
}
