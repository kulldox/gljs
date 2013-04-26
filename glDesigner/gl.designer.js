var gld = {
    Compiler: {
        compile: function(conf) {
            conf = JSON.parse(conf.trim())

            var elements = []

            for (var el in conf) {
                var method = this._computeMethod(conf[el].xtype)
                elements.push(method.call(null, conf[el]))
            }

            return elements;
        },

        _computeMethod: function(xType) {
            var method = gl.twitter
            var xTypeTkns = xType.split('.')

            for (var m in xTypeTkns) {
                method = method[xTypeTkns[m]]
            }

            return method
        }
    },

    Viewport: {
        render: function(elements) {
            $('.gld-viewport').html('');

            for (var el in elements) {
                $('.gld-viewport').append(elements[el]);
            }
        },

        error: function(message) {
            $('.gld-viewport').html(gl.dom.factory({
                tag: 'div',
                attrs: {
                    'class': 'alert alert-error'
                },
                children: [{
                    tag: 'a',
                    html: '&times;',
                    attrs: {
                        'class': 'close',
                        'data-dismiss': 'alert'
                    }
                }, message]
            }))
        }
    },

    Editor: {
        initialize: function() {
            var code = gl.defined($.cookie('gld-editor-cache'), '[{}]')
            $('.gld-editor textarea').val(code)

            $('.gld-editor').on('click', '.gld-editor-commands button', function(ev) {
                ev.preventDefault();
                gld.Editor[$(this).attr('gld-action')].call(this)
            })

        },

        execute: function() {
            $.cookie('gld-editor-cache', $('.gld-editor textarea').val(), {
                path: '/'
            })

            try {
                gld.Viewport.render(gld.Compiler.compile($('.gld-editor textarea').val()))
            } catch (e) {
                gld.Viewport.error(e.message)
            }
        }
    }
}

$(document).ready(function() {
    gld.Editor.initialize()
})