require('colors');

var compileit = require('..');

var WordToken = compileit.Token.generate(
    function WordToken(code) {
        var _ = this;

        compileit.Token.call(_, code, 'word');

        _.value = '';
    }
);

var WhitespaceToken = compileit.Token.generate(
    function WhitespaceToken(code) {
        var _ = this;

        compileit.Token.call(_, code, 'whitespace');
    }
);

var compiler = new compileit.Compiler({
    'w': [
        function parseWord(mode, code, tokens, flags, scope,
            parseMode) {
            var index = code.index,
                length = code.length;

            if (!/[A-Za-z]/.test(code.charAt(index))) {
                return null;
            }

            var word = new WordToken(code);

            while (/[A-Za-z]/.test(code.charAt(index)) && index <
                length) {
                index++;
            }
            code.index = index;
            word.close();

            word.value = word.source();

            return word;
        },
        function parseWhitespace(mode, code, tokens, flags, scope,
            parseMode) {
            var index = code.index,
                length = code.length;

            if (!/\s|\n/.test(code.charAt(index))) {
                return null;
            }

            // var whitespace = new WhitespaceToken(code);

            while (/\s|\n/.test(code.charAt(index)) && index <
                length) {
                index++;
            }
            code.index = index;
            // whitespace.close();
            // whitespace.value = whitespace.source();
            //
            // return whitespace;

            return true; // this token is ignored.
        }
    ]
}, {
    modeFormater: function (a) {
        return a.green;
    },
    charFormater: function (a) {
        return a.green.underline;
    },
    funcFormater: function (a) {
        return a.red;
    },
    typeFormater: function (a) {
        return a.green;
    },
    sourceFormater: function (a) {
        return ('`' + a + '`')
            .green.underline;
    }
});

console.log(
    JSON.stringify(
        compiler.compile(
            'test ?this out', 'example', 'w', {
                verbose: true
            }
        ),
        null, 2
    )
);
