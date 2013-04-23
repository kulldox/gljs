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

    undef: function(v, d) {
        return (typeof v == 'undefined') ? ((typeof d != 'undefined') ? d : true) : v
    },

    defined: function(v, d) {
        return (typeof v != 'undefined') ? v : ((typeof d != 'undefined') ? d : false)
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

    Text: function(conf) {
        conf = gl.defined(conf, {})

        var attrs = gl.defined(conf.attrs, {})

        attrs['type'] = (gl.defined(conf.password)) ? 'password' : 'text'
        attrs['value'] = gl.defined(conf.value, '')
        attrs['class'] = (gl.defined(conf.search)) ? 'search-query' : ''

        var node = gl.dom.factory({
            tag: 'input',
            attrs: attrs
        })

        if (gl.defined(conf.addOn)) {
            var wrapper = gl.dom.factory({
                tag: 'div'
            })

            if (gl.defined(conf.addOn.left)) {
                wrapper.className += ' input-prepend'
                this._Text_addOnNodeFactory(wrapper, conf.addOn.left)
            }

            wrapper.appendChild(node)

            if (gl.defined(conf.addOn.right)) {
                wrapper.className += ' input-append'
                this._Text_addOnNodeFactory(wrapper, conf.addOn.right)
            }

            node = wrapper
        }

        return node
    },

    _Text_addOnNodeFactory: function(rootNode, cfg) {
        if (typeof cfg == 'object') {
            for (var i in cfg) {
                var node = null

                switch (cfg[i].xType) {
                    case 'button':
                        node = gl.twitter.form.Button(cfg[i])
                        break;

                    case 'dropdown':
                        node = gl.twitter.menu.DropDown(cfg[i])
                        break;
                }

                rootNode.appendChild(node)
            }
        } else {
            rootNode.appendChild(gl.dom.factory({
                tag: 'span',
                html: cfg,
                attrs: {'class': 'add-on'}
            }))
        }
    },

    TextArea: function(cfg) {
        cfg = gl.defined(cfg, {})

        return gl.dom.factory({
            tag: 'textarea',
            html: cfg.text,
            attrs: cfg.attrs
        });
    },

    CheckBox: function(cfg) {
        cfg = gl.defined(cfg, {})

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
        cfg = gl.defined(cfg, {})

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

gl.twitter.menu = {
    DropDown: function(conf) {
        var buttons = []

        if (gl.defined(conf.splitted)) {
            buttons.push({
                tag: 'button',
                html: conf.text,
                attrs: {
                    'class': 'btn'
                }
            })
            buttons.push({
                tag: 'button',
                attrs: {
                    'class': 'btn dropdown-toggle',
                    'data-toggle': 'dropdown'
                },
                children: [{
                    tag: 'span',
                    attrs: {'class': 'caret'}
                }]
            })
        } else {
            buttons.push({
                tag: 'button',
                attrs: {
                    'class': 'btn dropdown-toggle',
                    'data-toggle': 'dropdown'
                },
                children: [conf.text + ' ', {
                    tag: 'span',
                    attrs: {'class': 'caret'}
                }]
            })
        }

        return gl.dom.factory({
            tag: 'div',
            attrs: {'class': 'btn-group'},
            children: buttons.concat(this._DropDown_factoryListConf(conf))
        })
    },

    _DropDown_factoryListConf: function(conf) {
        var listStyle = 'dropdown-menu';

        if (gl.defined(conf.alignRight)) {
            listStyle += ' pull-right'
        } else if (gl.defined(conf.alignLeft)) {
            listStyle += ' pull-left'
        }

        var list = [];

        for (var i in conf.items) {
            if (gl.defined(conf.items[i].divider)) {
                list.push({
                    tag: 'li',
                    attrs: {'class': 'divider'}
                })

                continue
            }

            if (gl.defined(conf.items[i].items)) {
                list.push({
                    tag: 'li',
                    attrs: {'class': 'dropdown-submenu'},
                    children: [{
                        tag: 'a',
                        html: conf.items[i].text,
                        attrs: {
                            'href': '#'
                        }
                    }].concat(this._DropDown_factoryListConf(conf.items[i]))
                })

                continue
            }

            var className = ''

            if (gl.defined(conf.items[i].disabled)) {
                className += ' disabled'
            }

            list.push({
                tag: 'li',
                attrs: {'class': className},
                children: [{
                    tag: 'a',
                    html: conf.items[i].text,
                    attrs: {
                        'href': gl.defined(conf.items[i].url, '')
                    }
                }]
            })
        }

        return {
            tag: 'ul',
            attrs: {'class': listStyle},
            children: list
        }
    }
}