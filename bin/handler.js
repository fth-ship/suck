module.exports = exports = function ( program, process ) {
    var crawler = require('../lib');
    var path = require('path');
    var pack = require('../package');
    var fs = require('fs');
    // comparison lists
    var output = [];
    //var usage = [];

    // parse to integer
    // @param val
    function integer (val) {
        return parseInt(val, 10);    
    }

    // split by comma
    // @param val
    function list (val) {
        return val.split(',');
    }

    // main function to run the crawler
    function findPatternsAndLog ( program ) {
        var options = {
            // target of exploration
            target: program.target,
            // pattern list to match
            pattern: program.list,
            // set limit ratio
            limit: program.end
        };
        // output filename
        var out = program.out || 'output.json';
        // error filename
        var err = program.err || 'error.json';
        // stream of files
        var errorStream = null;
        var outputStream = program.out && fs.createWriteStream( out ) || null;

        // delete var and exit the process
        function end () {
            if ( errorStream ) {
                errorStream.close();
            } if ( outputStream ) {
                outputStream.close();
            }

            delete options;
            delete limit;
            delete out;
            delete err;
            delete errorStream;
            delete outputStream;

            return process.exit( 0 );
        }

        function outputHandler ( e, href, res ) {
            if ( !e ) {
                output.push( href ); 
            } if ( e && !errorStream ) {
                errorStream = fs.createWriteStream( err );
            } if ( e && errorStream ) {
                errorStream.write( e + '\n' );    
            }
        }

        function verboseHandler ( e, href, res ) {
            if ( program.verbose ) {
                console.log(
                    '[ URL: %s - status: %s ]', 
                    href, 
                    res.status 
                );
            }
        }

        function separatorHandler (n) {
            var line = new Array( n || 100 );
            console.log( '\n' + line.join('-') + '\n' );
        }

        function completeVerboseHandler ( total ) {
            var outputMessage = '';
            var dashesNumber = 60;

            if ( program.verbose ) {
                separatorHandler( dashesNumber );
                if ( !program.out ) out = '\"STDOUT\"';
                if ( total > 1 ) {
                    outputMessage = 'Completed: %s with total of %s extractions';   
                    console.log( outputMessage, out, total );
                } else if ( total === 1 ) {
                    outputMessage = 'Completed: %s with total of %s extraction';
                    console.log( outputMessage, out, total );
                } else {
                    outputMessage = 'Extractions not performed, maybe the pattern not exist at %s';   
                    console.log( outputMessage, options['target'] );
                }
                separatorHandler( dashesNumber );
            } 
        }

        function fileOutputHandler () {
            if ( program.out ) {
                outputStram.write( JSON.stringfy( output ) );
            }
        }

        function stdoutHandler () {
            if ( !program.out ) {
                console.log( JSON.stringify( output, null, 4 ) );    
            }
        }

        function endHandler ( total ) {
            completeVerboseHandler( total );
            fileOutputHandler();
            stdoutHandler();

            return end();
        }

        function stepHandler ( e, href, res ) {
            outputHandler( e, href, res );
            verboseHandler( e, href, res );
        }

        function doneHandler ( total ) {
            endHandler( total );    
        }

        crawler
            .pattern
            .recursiveSearch( 
                options, 
                stepHandler, 
                doneHandler 
            );
    }

    program
        .version( pack['version'] )
        .usage('[options]')
        .option('-t, --target [host]', 'Target of search')
        .option('-l, --list <patterns>', 'Patterns to match', list)
        .option('-e, --end <n>', 'Limit of exploration', integer)
        .option('-o, --out [file]', 'Out filename')
        .option('-d, --err [file]', 'Error filename')
        .option('-v, --verbose', 'Show progress in the stdout')
        .parse(process.argv);

    if ( program.target && program.list ) {
        findPatternsAndLog(program);    
    }
};
