'use strict';
var root = this;
// modules
var agent = require('superagent').agent();
var $ = require('jquery');
// methods
var pattern = root.pattern = {};
// stack
var stack = [];
// pattern match
function matchPattern ( input, white ) {
    var out = [];
    var input = input || [];
    var white = white || [];

    function inputMapHandler (pattern) {
        return function (item) {
            if ( item.indexOf( pattern ) > -1 )
                out.push(item);
        }
    }

    function whiteMapHandler (item) {
        input.map(inputMapHandler(item));
    }
    if ( white.length ) white.map(whiteMapHandler);
    return out;
}
pattern.match = matchPattern;
// pattern search
function searchPattern ( o, fn ) {
    var o = o || {};
    var fn = fn || function () {};
    var pattern = o['pattern'] || '';
    var content = null;
    var anchors = [];
    var href = null;

    function agentHandler (e, res) {
        if ( e ) { 
            fn(e, []); 
        } else {
            content = $( res.text );
            content.find('a').map(function (id) {
                href = content.find('a').eq(id).attr('href'); 
                anchors.push(href);
            });
            stack = matchPattern(anchors, pattern);

            fn(null, stack, res);
        }
    }

    agent
        .get( o['target'] )
        .end( agentHandler );

    return root;
}
pattern.search = searchPattern;
// recursive pattern search
function recursiveSearchPattern ( o, fn, done ) {
    var o = o || {};
    var fn = fn || function () {};
    var done = done || function () {};
    var href = null;
    var firstTarget = o['target'].toString();
    var limit = ( o['limit'] || 1 );
    var output = [];
    var usage = [];
    var HAS_TOKEN_HTTP = false;

    function crawlerRecursionHandler (e, stack, res ) {
        function nextHandler () {
            o['target'] = usage[0];
            o['limit'] = limit;

            HAS_TOKEN_HTTP = (
                o['target'] &&
                ( o['target'].indexOf('http') === 0 ||
                  o['target'].indexOf('https') === 0 )
            );

            if ( HAS_TOKEN_HTTP ) {
                searchPattern( o, crawlerRecursionHandler );
                usage.shift();
            } else {
                done( output.length );    
            }
        }

        function matchHandler ( href ) {
            usage.push( href );
            if ( output.indexOf( href ) === -1 ) {
                output.push( href );
                fn( e, href, res );
                nextHandler();
            }
        }

        // handler of anchors matched
        function stackHandler ( href ) {
            matchHandler( href ); 
        }

        function extractionHandler () {
            stack.map( stackHandler );
        }

        // handler of step by step
        function recursionHandler () {
            extractionHandler();
        }

        if ( limit ) { 
            limit -= 1;
            recursionHandler();    
        } else {
            done( output.length );
        }
    }

    if ( o ) { 
        HAS_TOKEN_HTTP = (
            o['target'] &&
            ( o['target'].indexOf('http') === 0 ||
              o['target'].indexOf('https') === 0 )
        );

        if ( HAS_TOKEN_HTTP ) {
            searchPattern( o, crawlerRecursionHandler );
        } else {
            done( output.length );    
        }
    }

    return root;
}
pattern.recursiveSearch = recursiveSearchPattern;
