var gl = {
    apply: function(o1, o2) {
        for (var p in o1) {
            if (o2.hasOwnProperty(p)) {
                o1[p] = o2[p]
            }
        }

        return o1
    },

    merge: function(obj1, obj2) {
        var obj = this.clone(obj1);

        for (var prop in obj2) {
            obj[prop] = obj2[prop];
        }

        return obj;
    },

    clone: function(obj) {
        var clone = {};

        for (var prop in obj) {
            clone[prop] = obj[prop];
        }

        return clone;
    },

    undef: function(v) {
        return (typeof v == 'undefined')
    }
}

gl.dom = {
    factory: function(cfg) {
        var el = document.createElement(cfg.tag);

        if (typeof cfg.html != 'undefined') {
            el.innerHTML = cfg.html;
        }

        if (typeof cfg.attrs != 'undefined') {
            if (typeof cfg.attrs.styleClass != 'undefined') {
                cfg.attrs['class'] = cfg.attrs.styleClass;
                delete cfg.attrs['styleClass'];
            }

            for (var attr in cfg.attrs) {
                el.setAttribute(attr, cfg.attrs[attr]);
            }
        }

        if (typeof cfg.children != 'undefined') {
            for (var child in cfg.children) {
                if (!HTMLElement) {
                    var HTMLElement = Element;
                }

                if (cfg.children[child] instanceof HTMLElement) {
                    el.appendChild(cfg.children[child]);
                } else if (typeof cfg.children[child] == 'string') {
                    el.appendChild(document.createTextNode(cfg.children[child]));
                } else {
                    el.appendChild(this.factory(cfg.children[child]));
                }
            }
        }

//        if (typeof cfg.events != 'undefined') {
//            for (var ev in cfg.events) {
//                el[ev] = cfg.events[ev];
//            }
//        }

        return el;
    }
}

gl.twitter = {
    Clearfix: function() {
        return gl.dom.factory({
            tag: 'span',
            attrs: {
                'class': 'clearfix'
            }
        })
    }
}

gl.twitter.form = {
    BUTTON_PRIMARY: 'btn-primary',
    BUTTON_INFO: 'btn-info',
    BUTTON_SUCCESS: 'btn-success',
    BUTTON_WARNING: 'btn-warning',
    BUTTON_ERROR: 'btn-error',

    Label: function(cfg) {
        return gl.dom.factory({
            tag: 'label',
            html: cfg.text,
            attrs: cfg.attrs
        })
    },

    HelpBlock: function(cfg) {
        return gl.dom.factory({
            tag: 'span',
            html: cfg.text,
            attrs: cfg.attrs
        })
    },

    Text: function(cfg) {
        if (!cfg) cfg = {}

        var attrs = gl.merge(cfg.attrs, {
            type: (cfg.password) ? 'password' : 'text',
            value: !gl.undef(cfg.value) ? cfg.value : ''
        })

        if (cfg.searchQuery) attrs.styleClass += ' search-query'

        var node = gl.dom.factory({
            tag: 'input',
            attrs: attrs
        })

        if (!gl.undef(cfg.addOn)) {
            var factoryElement = function(cfg) {
                if (cfg.xType == 'button') {
                    return gl.twitter.form.Button(cfg)
                } else if (cfg.xType == 'dropdown') {

                }
            }

            var wrapper = gl.dom.factory({
                tag: 'div'
            })

            if (!gl.undef(cfg.addOn.left)) {
                wrapper.className += ' input-prepend'

                if (typeof cfg.addOn.left == 'object') {
                    for (var i in cfg.addOn.left) {
                        wrapper.appendChild(factoryElement(cfg.addOn.left[i]))
                    }
                } else {
                    wrapper.appendChild(gl.dom.factory({
                        tag: 'span',
                        html: cfg.addOn.left,
                        attrs: {'class': 'add-on'}
                    }))
                }
            }

            wrapper.appendChild(node);

            if (!gl.undef(cfg.addOn.right)) {
                wrapper.className += ' input-append'

                if (typeof cfg.addOn.left == 'object') {
                    for (var i in cfg.addOn.left) {
                        wrapper.appendChild(factoryElement(cfg.addOn.left[i]))
                    }
                } else {
                    wrapper.appendChild(gl.dom.factory({
                        tag: 'span',
                        html: cfg.addOn.right,
                        attrs: {'class': 'add-on'}
                    }))
                }
            }

            node = wrapper;
        }

        return node;
    },

    TextArea: function(cfg) {
        if (!cfg) cfg = {}

        return gl.dom.factory({
            tag: 'textarea',
            html: cfg.text,
            attrs: cfg.attrs
        });
    },

    CheckBox: function(cfg) {
        if (!cfg) cfg = {}

        var attrs = gl.merge(cfg.attrs, {
            type: 'checkbox',
            value: !gl.undef(cfg.value) ? cfg.value : ''
        })

        var node = gl.dom.factory({
            tag: 'input',
            attrs: attrs
        });

        if (!gl.undef(cfg.label)) {
            node = gl.dom.factory({
                tag: 'label',
                attrs: {'class': 'checkbox'},
                children: [node, cfg.label]
            })
        }

        return node;
    },

    Radio: function(cfg) {
        if (!cfg) cfg = {}

        var attrs = gl.merge(cfg.attrs, {
            type: 'radio',
            value: !gl.undef(cfg.value) ? cfg.value : ''
        })

        var node = gl.dom.factory({
            tag: 'input',
            attrs: attrs
        });

        if (!gl.undef(cfg.label)) {
            node = gl.dom.factory({
                tag: 'label',
                attrs: {'class': 'radio'},
                children: [node, cfg.label]
            })
        }

        return node;
    },

    Button: function(cfg) {
        var attrs = {
            styleClass: 'btn ' + ((cfg.type) ? cfg.type : '')
        }

        if (cfg.submit) attrs.type = 'submit'

        return gl.dom.factory({
            tag: 'button',
            html: cfg.text,
            attrs: attrs
        })
    },

    Select: function(cfg) {
        var simpleListFactory = function(values) {
            var options = []

            for (var i in values) {
                options.push(gl.dom.factory({
                    tag: 'option',
                    html: values[i],
                    attrs: {
                        value: values[i]
                    }
                }))
            }

            return options;
        }

        var keyValueListFactory = function(values) {
            var options = [];

            for (var i in values) {
                if (values[i] instanceof Array) {
                    options.push(gl.dom.factory({
                        tag: 'optgroup',
                        attrs: {
                            label: i
                        },
                        children: simpleListFactory(values[i])
                    }))
                } else if (typeof values[i] == 'object') {
                    options.push(gl.dom.factory({
                        tag: 'optgroup',
                        attrs: {
                            label: i
                        },
                        children: keyValueListFactory(values[i])
                    }))
                } else {
                    options.push(gl.dom.factory({
                        tag: 'option',
                        html: values[i],
                        attrs: {
                            value: i
                        }
                    }))
                }
            }

            return options;
        }

        if (cfg.options instanceof Array) {
            var options = simpleListFactory(cfg.options);
        } else if (typeof cfg.options == 'object') {
            var options = keyValueListFactory(cfg.options);
        }

        return gl.dom.factory({
            tag: 'select',
            attrs: cfg.attrs,
            children: options
        })
    }

}