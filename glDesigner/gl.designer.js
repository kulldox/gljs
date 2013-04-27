String.prototype.repeat = function (n) {
    var str = '';
    for(var i = 0; i < n; i++) { str += this; }
    return str;
};

String.prototype.insert = function (p, s) {
    return this.substring(0, p) + s + this.substring(p, this.length)
}

var gld = {
    Compiler: {
        compile: function(conf) {
            conf = eval(conf.trim())

            var elements = []

            for (var el in conf) {
                elements.push(gl.dom.factory(conf[el]))
            }

            return elements;
        }
    },

    Viewport: {
        render: function(elements) {
            this.clear()

            for (var el in elements) {
                $('.gld-viewport .viewport').append(elements[el]);
            }
        },

        clear: function() {
            $('.gld-viewport .viewport').html('');
        },

        error: function(ex) {
            $('.gld-viewport .viewport').html(gl.dom.factory({
                tag: 'div',
                attrs: {
                    'class': 'alert alert-error',
                    'style': 'position: absolute; left: 100px; right: 100px; top: 20px'
                },
                children: [{
                    tag: 'a',
                    html: '&times;',
                    attrs: {
                        'class': 'close',
                        'data-dismiss': 'alert'
                    }
                },{
                    tag: 'strong',
                    html: ex.name + ': '
                },{
                    tag: 'span',
                    html: ex.message
                }]
            }))
        }
    },

    Editor: {
        TAB_SIZE: 4,

        VK_TAB: 9,
        VK_ENTER: 13,
        VK_BRACKET_LEFT: 91,
        VK_BRACKET_RIGHT: 93,
        VK_BRACKET_SQUARE_LEFT: 123,
        VK_BRACKET_SQUARE_RIGHT: 125,
        VK_SINGLE_QUOTE: 39,
        VK_DOUBLE_QUOTE: 34,
        VK_COLUMN: 58,

        _editor: null,

        initialize: function() {
            var $this = this;

            this._editor = $('.gld-editor textarea')[0]
            this._editor.value = gl.defined($.cookie('gld-editor-cache'), '[{}]')

            $('.gld-editor textarea').keydown(function(ev) {
                if (ev.keyCode === $this.VK_TAB) {
                    ev.preventDefault()
                }
            }).keyup(function(ev) {
                if (ev.keyCode === $this.VK_TAB) {
                    $this._keyHandler(this, ev)
                }
            })

            $('.gld-editor textarea').keypress(function(ev) {
                $this._keyHandler(this, ev)
            })
        },

        _keyHandler: function(editor, ev) {
            switch (ev.which) {
                case this.VK_TAB:
                    this._tab()
                    break;

                case this.VK_COLUMN:
                    ev.preventDefault()
                    this._insert(String.fromCharCode(ev.which) + ' ', undefined, true)
                    break;

                case this.VK_BRACKET_LEFT:
                case this.VK_BRACKET_SQUARE_LEFT:
                    this._insert(String.fromCharCode(ev.which + 2))
                    break;

                case this.VK_SINGLE_QUOTE:
                case this.VK_DOUBLE_QUOTE:
                    this._insert(String.fromCharCode(ev.which))
                    break;

                case this.VK_ENTER:
                    switch (this._editor.value.substr(this._editor.selectionStart - 1, 2)) {
                        case '{}':
                            ev.preventDefault();
                            this._insert('\n', undefined, true)
                            this._insert(' '.repeat(this.TAB_SIZE), undefined, true)
                            this._insert('\n')
                            break;
                    }

                    break;
            }
        },

        _insert: function(str, pos, shift) {
            pos = gl.defined(pos, this._editor.selectionStart)
            this._editor.value = this._editor.value.insert(pos, str)

            if (shift)
                pos += str.length

            this._editor.setSelectionRange(pos, pos)
        },

        _tab: function(pos) {
            this._insert(' '.repeat(this.TAB_SIZE), pos, true)
        }
    },

    Commands: {
        initialize: function() {
            var $this = this;

            $('.gld-sidebar .sidebar-commands').on('click', 'button', function(ev) {
                ev.preventDefault();
                $this[$(this).attr('gld-action')].call(this)
            })
        },

        run: function() {
            $.cookie('gld-editor-cache', $('.gld-editor textarea').val(), {
                path: '/'
            })

            try {
                gld.Viewport.render(gld.Compiler.compile($('.gld-editor textarea').val()))
            } catch (e) {
                gld.Viewport.error(e)
            }
        },

        showMarks: function() {
            $('.gld-viewport .viewport').addClass('marks')
            $(this).attr('gld-action', 'hideMarks')
                .children('span').removeClass('icon-eye-open').addClass('icon-eye-close')
        },

        hideMarks: function() {
            $('.gld-viewport .viewport').removeClass('marks')
            $(this).attr('gld-action', 'showMarks')
                .children('span').removeClass('icon-eye-close').addClass('icon-eye-open')
        },

        showGrid: function() {
            $('.gld-viewport .viewport').addClass('grid')
            $(this).attr('gld-action', 'hideGrid')
                .children('span').removeClass('icon-eye-open').addClass('icon-eye-close')
        },

        hideGrid: function() {
            $('.gld-viewport .viewport').removeClass('grid')
            $(this).attr('gld-action', 'showGrid')
                .children('span').removeClass('icon-eye-close').addClass('icon-eye-open')
        },

        popUpEditor: function() {
            alert('Not implemented yet')
        },

        clear: function() {
            gld.Viewport.clear()
        }
    },

    Menu: {
        initialize: function() {
            var $this = this;

            $('.gld-navbar .nav').on('click', 'a', function(ev) {
                if (gl.defined($(this).attr('gld-action'))) {
                    ev.preventDefault();
                    $this[$(this).attr('gld-action')].call($this, this)
                }
            })
        },

        about: function(caller) {
            $('#about-dialog').modal().css({
                width: '750px',
                'margin-left': function () {
                    return -($(this).width() / 2);
                }
            })
        }
    }
}

$(document).ready(function() {
    gld.Editor.initialize()
    gld.Commands.initialize()
    gld.Menu.initialize()
})