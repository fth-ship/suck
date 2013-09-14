module.exports = exports = function ( program, process ) {
    var crawler = require('../lib');
    var path = require('path');
    var pack = require('../package');
    var fs = require('fs');
    // comparison lists
    var output = [];
    var usage = [];

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
            pattern: program.list
        };
        // limit of deep extraction
        var limit = program.end || 100;
        // output filename
        var out = program.out || 'output.json';
        // error filename
        var err = program.err || 'error.json';
        // stream of file
        var outputStream = program.out && fs.createWriteStream( out ) || null;

        // delete var and exit the process
        function end () {
            delete options;
            delete limit;
            delete out;
            delete err;
            delete outputStream;
            return process.exit( 0 );
        }

        // handler to start up the crawling action 
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

        // handler to deep extraction
        function crawlerRecursionHandler (e, stack, res ) {
            // handler of anchors matched
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

            // handler of step by step
            function recursionHandler () {
                stack.map( stackHandler );
                limit -= 1;
                options['target'] = usage[0];
                usage.shift();
                crawler.pattern.search( options, crawlerRecursionHandler );
            }

            // terminal handler
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
        .option('-d, --err [file]', 'Error filename')
        .option('-v, --verbose', 'Show progress in the stdout')
        .parse(process.argv);

    if ( program.target && program.list ) {
        findPatternsAndLog(program);    
    }
};
