define(function(require, exports, module) {

    var UIComponent     = require('../../core/UIComponent');
    var UIElement       = require('../../core/UIElement');
    var UILabel         = require('../UILabel');

    /**
     * A base button class
     *
     * @param {Object} [options] options to be applied to the button
     * @param {Array | Numbers} [options.size] Size of bounding box
     * @param {String} [options.text] Text to be set on label
     * @param {Boolean} [options.toggle] Toggle status
     * @param {Boolean} [options.enabled] Enabled status
     * @param {Selected} [options.selected] Selected status
     * @param {Number} [options.iconPadding] Padding between icon and label
     * @param {String} [options.iconPlacement] Placement of icon in bounding box
     *
     * @example
     *  var button = new UIButtonBase({
     *      size: [200, 50],
     *      text: 'I am a cute button!',
     *      iconPlacement: 'top'
     *  });
     *
     * @class UIButtonBase
     * @constructor
     */
    var UIButtonBase = UIComponent.extend({

        _paddingLeft: 0,
        _paddingRight: 0,
        _paddingTop: 0,
        _backgroundPosition: [0,0,0],
        _paddingBottom: 0,
        _contentAlign: 'left', 
        _iconPadding: 0,
        _iconPlacement:'left',
        _text: 'Button',
        _zIndex: 0,
        _textColor: 'rgba(0,0,0,1)',

        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);

            this._applyOptions(options);


            // initialize state variables.
            this._selected = false;
            this._pressed = false;

            this._autoSize = typeof this._size == "undefined" ? true : false;

           
            this._backgroundElement = this._createBackground();
            if (this._backgroundElement) {
                this._addChild(this._backgroundElement);
                if (this._backgroundPosition) {
                    this._backgroundElement.setPosition(this._backgroundPosition);
                }
            }

            this._icon  = this._createIcon();
            if (this._icon ) {this._addChild(this._icon);}

            this._label = this._createLabel();
            if (this._label) { this._addChild(this._label);}

            this._boundingBox = this._createBoundingBox();
            this._addChild(this._boundingBox);

            this._iconPadding = this._icon ? this._iconPadding : 0;

            this._setButtonSize();
            this.setSelected(this._selected, false);

            this._bindEvents();
        },
        /**
         * @method setText
         * @param text
         */
        setText : function (text) {
            this._label.setText(text);
        },
        /**
         * @method getText
         */
        getText : function () {
            return this._label.getText();
        },

        getSize: function () {
            return this._size;
        },
        getBackground: function () {
            return this._backgroundElement;
        },
        /**
         * @method setEnabled
         * @param value
         * @param animate
         * @param event
         */

        setEnabled : function (value,animate, event) {
            this._enabled = value;
            if (this._label && this._label.setEnabled) {
                this._label.setEnabled(this.getEnabled(), animate, event);
            }
            if (this._icon && this._icon.setEnabled) {
                this._icon.setEnabled(this.getEnabled(), animate, event);
            }
             if (this._backgroundElement && this._backgroundElement.setPressed) {
                this._backgroundElement.setEnabled(value, animate, event);
            }
        },
        /**
         * @method getEnabled
         */
        getEnabled : function () {

            return this._enabled;
        },
        /**
         * @method setToggle
         * @param value
         * @param animate
         */
        setToggle : function (value,animate) {
            if (this._label && this._label.setToggle) {
                this._label.setToggle(this.getToggle(),animate);
            }
            if (this._icon && this._icon.setToggle) {
                this._icon.setToggle(this.getToggle(),animate);
            }
             if (this._backgroundElement && this._backgroundElement.setToggle) {

                this._backgroundElement.setToggle(value,animate);
            }
            this._toggle = value;
        },
        /**
         * @method getToggle
         */
        getToggle : function () {
            return this._toggle;
        },
        /**
         * @method setSelected
         * @param value
         * @param animate
         * @param event
         */
        setSelected : function(value, animate, event) {
            this._selected = value;
            if (this._label && this._label.setSelected) {
                this._label.setSelected(this.getSelected(), animate, event);
            }
            if (this._icon && this._icon.setSelected) {
                this._icon.setSelected(this.getSelected(), animate, event);
            }
            if (this._backgroundElement && this._backgroundElement.setSelected) {
                this._backgroundElement.setSelected(value, animate, event);
            }
        },

        setValue : function(value, event, animate) {
            this.setSelected(value, animate, event);
            if (event==true) {
                this.emit('change', this._selected);
            }
        },
        /**
         * @method getSelected
         */
        getSelected : function () {
            return this._selected;
        },

        getValue : function() {
            return this._selected;
        },
        /**
         * @method setPressed
         * @param value
         * @param animate
         * @param event
         */
        setPressed: function(value, animate,event) {
            this._pressed = value;
            if (this._label && this._label.setPressed) {
                this._label.setPressed(this.getPressed(), animate, event);
            }
            if (this._icon && this._icon.setPressed) {
                this._icon.setPressed(this.getPressed(), animate, event);
            }
            if (this._backgroundElement && this._backgroundElement.setPressed) {
                this._backgroundElement.setPressed(this.getPressed(), animate, event);
            }
        },
        /**
         * @method getPressed
         */
        getPressed: function() {
            return this._pressed;
        },

        setBackgroundClasses: function(classes) {
            if (!this._backgroundElement || !this._backgroundElement._backgroundElement) return;
            this._backgroundElement._backgroundElement.setClasses(classes);
        },

        addBackgroundClasses: function(classesToAdd) {
            if (!this._backgroundElement || !this._backgroundElement._backgroundElement) return;
            var currentClasses = this._backgroundElement._backgroundElement.getClasses();
            if (!Array.isArray(classesToAdd)) classesToAdd = [classesToAdd];
            this.setBackgroundClasses(currentClasses.concat(classesToAdd));
        },

        removeBackgroundClasses: function(classesToRemove) {
            if (!this._backgroundElement || !this._backgroundElement._backgroundElement) return;
            var currentClasses = this._backgroundElement._backgroundElement.getClasses().slice();

            if (!Array.isArray(classesToRemove)) classesToRemove = [classesToRemove];

            var index;
            for (var i = 0; i < classesToRemove.length; i++) {
                index = currentClasses.indexOf(classesToRemove[i]);
                if (index >= 0) {
                    currentClasses.splice(index, 1);
                }
            };
            this.setBackgroundClasses(currentClasses);

        },

        /**
         * Binds events to button
         *
         * @private
         * @method _bindEvents
         *
         * @TODO: Emit an event on click
         */
        _bindEvents: function() {
            this._eventHandler.bindThis(this);
            // this._label.on('sizeChange', this._layout.bind(this));
            this._eventHandler.bindThis(this);
            this._label.on('deploy',function(){
                this.emit('deploy');
            }.bind(this));
            this._boundingBox.on('click', this._onClick.bind(this));
            this._boundingBox.on('mousedown', this._onMousedown.bind(this));
            this._boundingBox.on('mouseup', this._onMouseup.bind(this));
            this._boundingBox.on('mouseover', this._onMouseover.bind(this));
            this._boundingBox.on('mouseout', this._onMouseout.bind(this));

        },
        /**
         * @method _onClick
         * @private
         * @param event
         */
        _onClick: function(event) {
            if (this.getToggle() || !this.getSelected()) {
                this.setSelected(!this.getSelected(), true,event);
                this.emit('change', this._selected);
            }
            // this.emit('click');
        },
        /**
         * @method _onMousedown
         * @private
         * @param event
         */
        _onMousedown: function(event) {
            this.setPressed(true, true,event);
        },
        /**
         * @method _onMouseup
         * @private
         * @param event
         */
        _onMouseup: function(event) {
            this.setPressed(false, true, event);
            // this.emit('mouseup');
        },
        /**
         * @method _onMouseover
         * @private
         * @param event
         */
        _onMouseover: function(event) {
            // TODO
            // this.emit('mouseover');
        },
        /**
         * @method _onMouseout
         * @private
         * @param event
         */
        _onMouseout : function (event) {
            // TODO
            // this.emit('mouseout');
        },
        /**
         * Sets the size of the bounding box
         *
         * @private
         * @method _setButtonSize
         */
        _setButtonSize: function() {
            this._label.on('sizeChange', function(e) {
                var iconWidth = this._icon ?  this._icon.getSize()[0] : 0;
                var iconHeight = this._icon ? this._icon.getSize()[1] : 0 ;
                var labelWidth = this._label.getSize()[0];
                var labelHeight = this._label.getSize()[1];
                if (this._iconPlacement === 'left' || this._iconPlacement === 'right') {
                    this._contentWidth = iconWidth + this._iconPadding + labelWidth;
                    this._contentHeight = Math.max(iconHeight, labelHeight) ;
                }
                else if (this._iconPlacement === 'top' || this._iconPlacement === 'bottom') {
                    this._contentWidth = Math.max(iconWidth, labelWidth);
                    this._contentHeight = iconHeight + this._iconPadding + labelHeight ;
                }
                if (this._autoSize) {
                    this._size = [this._contentWidth + this._paddingLeft + this._paddingRight,
                                 this._contentHeight + this._paddingTop + this._paddingBottom];

                    this._callSuper(UIComponent,'setSize',this._size[0],this._size[1]);
                }

                if (this._backgroundElement) this._backgroundElement.setSize(this.getSize());
                this._layout();
                this.emit('sizeChange', this.getSize());
            }.bind(this));
        },

        _setSize : function (x,y,transition,callback) {
            var iconWidth = this._icon ?  this._icon.getSize()[0] : 0;
            var iconHeight = this._icon ? this._icon.getSize()[1] : 0 ;
            var labelWidth = this._label ? this._label.getSize()[0] : 0;
            var labelHeight = this._label ? this._label.getSize()[1] : 0 ;

            var buttonCalcWidth = this._contentWidth + this._paddingLeft + this._paddingRight;
            var buttonCalcHeight = this._contentHeight + this._paddingTop + this._paddingBottom;
            if (x <= buttonCalcWidth) {
                 if (this._iconPlacement === 'left' || this._iconPlacement === 'right') {
                    labelWidth  = x - (this._paddingLeft + this._paddingRight + iconWidth);
                }
                else if (this._iconPlacement === 'top' || this._iconPlacement === 'bottom') {
                    if (labelWidth > iconWidth){
                        labelWidth  = x - (this._paddingLeft + this._paddingRight);
                    }
                }
            }
            if (this._label){
                this._label.setSize([labelWidth,labelHeight],true);
            }
            // this._callSuper(UIComponent,'setSize',x,y,transition,callback);
        },
        //@@
        setSize : function (x,y,transition,callback) {
            this._callSuper(UIComponent,'setSize',x,y,transition,callback);
            this._autoSize = false;
            this._setSize(x,y,transition,callback);
        },
        /**
         * Creates the bounding box
         *
         * @private
         * @method _createBoundingBox
         */
        _createBoundingBox: function() {
            return new UIElement({
                opacity: 0,
                style : {
                    zIndex : (this._zIndex+50)+''
                }
            });

        },

        /**
         * Sets the icon
         *
         * @private
         * @method _createIcon
         */
        _createIcon: function() {
            // return new UIElement({size: [0,0]});
            return ;
        },

        /**
         * Creates the label
         *
         * @private
         * @method _createLabel
         */
        _createLabel: function() {
            return new UILabel({
                text: this._text,
                style : this._labelStyle,
                classes: this._labelClasses
            });
        },

        /** 
         * Lays out the icon, label, and bounding box
         *   depending on the iconPlacement
         *
         * @private
         * @method _layout
         *
         * @TODO: use .center() on label once fixed in UIBase
         */
        _layout: function() {

            var buttonWidth    = this._size[0];
            var buttonHeight   = this._size[1];
            var iconWidth   =  this._icon ? this._icon.getSize()[0] : 0;
            var iconHeight  =  this._icon ? this._icon.getSize()[1] : 0;
            var labelWidth  = this._label.getSize()[0];
            var labelHeight = this._label.getSize()[1];
            var iconPadding = this._iconPadding;

            if (this._iconPlacement === 'left') {
                if (this._contentAlign === 'center') {
                    if (this._icon) {
                        this._icon.setPosition(
                            (buttonWidth - this._contentWidth + this._paddingLeft - this._paddingRight) / 2,
                            (buttonHeight - iconHeight + this._paddingTop - this._paddingBottom) / 2 ,
                            0);
                    }
                    this._label.setPosition(
                        (buttonWidth - this._contentWidth + this._paddingLeft - this._paddingRight)/2 + iconWidth + iconPadding,
                        (buttonHeight - labelHeight + this._paddingTop - this._paddingBottom)/2,
                        0);
                } else if (this._contentAlign === 'left') {
                    if (this._icon) {
                        this._icon.setPosition(
                            this._paddingLeft,
                            (buttonHeight - iconHeight + this._paddingTop - this._paddingBottom)/2 ,
                            0);
                    }
                    this._label.setPosition(
                        this._paddingLeft + iconWidth + iconPadding,
                        (buttonHeight - labelHeight + this._paddingTop - this._paddingBottom)/2,
                        0);
                } else if (this._contentAlign === 'right') {
                    if (this._icon) {
                        this._icon.setPosition( buttonWidth - this._paddingRight - this._contentWidth ,
                        (buttonHeight - iconHeight + this._paddingTop - this._paddingBottom)/2 ,
                        0);
                    }
                    this._label.setPosition(
                        buttonWidth - labelWidth - this._paddingRight,
                        (buttonHeight - labelHeight + this._paddingTop - this._paddingBottom)/2,
                        0);
                }
            }
            if (this._iconPlacement === 'right') {
                if (this._contentAlign === 'center') {
                    if (this._icon) {
                        this._icon.setPosition((buttonWidth + this._contentWidth + this._paddingLeft - this._paddingRight )/2 - iconWidth,
                        (buttonHeight - iconHeight + this._paddingTop - this._paddingBottom)/2, 0);
                    }
                    this._label.setPosition(
                        (buttonWidth + this._contentWidth + this._paddingLeft - this._paddingRight)/2 - labelWidth - iconWidth - iconPadding,
                        (buttonHeight - labelHeight + this._paddingTop - this._paddingBottom)/2,
                        0);
                } else if (this._contentAlign === 'left') {
                    if (this._icon) {
                        this._icon.setPosition((this._contentWidth - iconWidth + this._paddingLeft),
                        (buttonHeight - iconHeight + this._paddingTop - this._paddingBottom)/2, 0);
                    }
                    this._label.setPosition(
                        this._paddingLeft,
                        (buttonHeight - labelHeight + this._paddingTop - this._paddingBottom)/2,
                        0);
                } else if (this._contentAlign === 'right') {
                    if (this._icon) {
                        this._icon.setPosition(buttonWidth - iconWidth - this._paddingRight,
                        (buttonHeight - iconHeight + this._paddingTop - this._paddingBottom)/2,
                        0);
                    }
                    this._label.setPosition(
                        (buttonWidth - this._contentWidth - this._paddingRight),
                        (buttonHeight - labelHeight + this._paddingTop - this._paddingBottom)/2,
                        0);
                }
            }
            if (this._iconPlacement === 'top') {
                if (this._icon) {
                    this._icon.setPosition((buttonWidth - iconWidth + this._paddingLeft - this._paddingRight )/2,
                    (buttonHeight - this._contentHeight + this._paddingTop - this._paddingBottom)/2,
                    0);
                }
                this._label.setPosition(
                    (buttonWidth - labelWidth + this._paddingLeft - this._paddingRight)/2 ,
                    (buttonHeight - this._contentHeight + this._paddingTop - this._paddingBottom)/2 + iconHeight + iconPadding,
                    0);
            }
            if (this._iconPlacement === 'bottom') {
                if (this._icon) {
                    this._icon.setPosition(
                        (buttonWidth - iconWidth + this._paddingLeft - this._paddingRight )/2,
                        (buttonHeight + this._contentHeight + this._paddingTop - this._paddingBottom)/2 - iconHeight ,
                        0);
                }
                this._label.setPosition(
                    (buttonWidth - labelWidth + this._paddingLeft- this._paddingRight)/2,
                    (buttonHeight - this._contentHeight + this._paddingTop - this._paddingBottom)/2,
                    0);
            }

            // setting the opacity to 0 initially and setting the back 
            // to 1 once laid out prevents the position flicker effect
            if (this._icon) { this._icon.setOpacity(1);}
            this._label.setOpacity(1);
        }
    });
    module.exports = UIButtonBase;
});
