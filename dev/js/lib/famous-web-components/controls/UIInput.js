define(function(require, exports, module) {
    var InputSurface = require('famous/surfaces/InputSurface');
    var UIComponent = require('../core/UIComponent');

    var ID = 0;
    var UIInput = UIComponent.extend({ 
        _classes: ['ui-input'],
        _styles: {},
        _placeholder: '',
        _name: '',
        _size: [undefined, 25],
        _value: '',
        constructor: function UIInput (options) {
            this._callSuper(UIComponent, 'constructor', options);
            this._applyOptions(options);
            this._surface = new InputSurface({
                classes: this._classes,
                styles: this._styles,
                size: this._size,
                placeholder: this._placeholder,
                value: this._value,
                name: this._name
            });
            this._ID = options.id ? options.id : 'input' + ID++;
            var self = this;
            this._surface.getID = function () {
                return self._ID;
            }
            this._addChild(this._surface);
            this._surface.on('keyup', function (e) { 
                self.emit('change', self.getValue());
            });
            if (options.onChange) {
                this.on('change', options.onChange);
            }
        },
        /**
         * @method getSize
         */
        getSize: function () {
            return this._surface.getSize();
        },
        /**
         * @method setClasses
         */
        setClasses: function () {
            this._surface.setClasses.apply(this._surface, arguments);
            return this;
        },
        /**
         * @method getClasses
         */
        getClasses: function () {
            return this._surface.getClasses.apply(this._surface, arguments);
        },
        /**
         * @method setPlaceholder
         */
        setPlaceholder: function () {
            this._surface.setPlaceholder.apply(this._surface, arguments);
            return this;
        },
        /**
         * @method focus
         */
        focus: function () {
            this._surface.focus.apply(this._surface, arguments);
            return this;
        },
        /**
         * @method blur
         */
        blur: function () {
            this._surface.blur.apply(this._surface, arguments);
            return this;
        },
        /**
         * @method setType
         */
        setType: function () {
            this._surface.setType.apply(this._surface, arguments);
            return this;
        },
        /**
         * @method setValue
         */
        setValue: function () {
            this._surface.setValue.apply(this._surface, arguments);
            return this;
        },
        /**
         * @method getValue
         */
        getValue: function () {
            return this._surface.getValue.apply(this._surface, arguments);
        },
        /**
         * @method setName
         */
        setName: function () {
            this._surface.setName.apply(this._surface, arguments);
            return this;
        },
    });

    module.exports = UIInput;
});
