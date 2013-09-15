var should = require('should');
var crawler = require('../lib');

suite('Crawler', function () {
    suite('pattern', function () {
        test('match', function () {
            var actual = [
                'www.oppa.com.br',
                'www.google.com',
                'www.yahoo.com',
            ];   
            var match = [
                'yahoo.com',
                'google.com'
            ];
            var expected = [
                'www.yahoo.com',
                'www.google.com',
            ];

            crawler
                .pattern
                .match(actual, match)
                .should
                .be.eql(expected);
        });

        test('search', function (done) {
            function crawlerPatternSearchHandler (err, stack, res) {
                should.not.exist(err);
                should.exist(res);
                (stack.length > 0).should.be.ok;
                done();
            }

            crawler.pattern.search({
                target: 'http://pt.wikipedia.org/wiki/El_Chavo_del_Ocho',
                pattern: [ 'imdb' ],
            }, crawlerPatternSearchHandler);
        });

        test('recursiveSearch', function (done) {
            var target = 'http://nodejs.org/api/_toc.html'; 
            var patterns = [ '/api' ];
            var options = {
                target: target,
                pattern: patterns,
                limit: 100
            };

            function recursionHandler (err, href, res) {
                should.not.exist(err);
                should.exist(res);
            }

            function doneHandler ( total ) {
                ( total > 0 ).should.be.ok;
                done();
            }

            crawler
                .pattern
                .recursiveSearch(
                    options, 
                    recursionHandler, 
                    doneHandler 
                );
        });
    });    
});
