# Suck

Get the tree of anchors based into an pattern.

## Installation

    [sudo] npm install -g suck

## Usage

### Target

    suck -t [host] // the address of place you get extract

### List of Patterns

    suck -t [host] -l [pattern] // list of patterns, who you need to extract

### Output

    suck -t [host] -l [pattern] -o [filename] // the json has a array structure

### Errors

    // erro.json has the information of the process `[todo:improve-errors]`

### Limit

    suck -t [host] -l [pattern] -o [filename] -e [filename] -e [number] // number of times to turn back

### Verbose

    suck -t [host] -l [pattern] -o [filename] -e [filename] -e [number] -v // verbose mode, show the progress information

### Example of usage

    suck -t http://pt.wikipedia.org/wiki/El_Chavo_del_Ocho -l imdb -v -e 1 

### Next

    - Create the documentation of API

    - Add RegExp support to match patterns
    
    - Add ignore patterns support

    - Cluster crawling

    - Add Jug support


    - Move the methods of `bin/index.js` to `lib/index.js`, to make more reusable. [ OK ]

## Author and the license

    Kaique da Silva <kaique.developer@gmail.com>, under <BSD-license>
