define(function(require, exports, module) {
    var UIButtonBase = require('../UIButtonBase');
    var UIRadioIcon = require('./UIRadioIcon');

    var UIRadioButton = UIButtonBase.extend( /** @lends UIButtonBase.prototype */ {
        constructor: function(options) {
            options = options || {};
            options.toggle = true; // checkbox should be toggleable.
            this._callSuper(UIButtonBase, 'constructor', options);
            this._buttonGroup   = options.buttonGroup || null;
            if (typeof this._buttonGroup === "string" && this._buttonGroup.length > 0) {
                this._registerToButtonGroup();
            }
        },

        _createIcon: function() {
            return new UIRadioIcon();
        },
        _registerToButtonGroup: function() {
            if ( typeof UIBase._idRegistry[this._buttonGroup] !== "undefined" ) {
                UIBase._idRegistry[this._buttonGroup].addButtons([this]);
            }
            else {
                UIBase._idRegistry[this._buttonGroup] = new UIRadioGroup();
                UIBase._idRegistry[this._buttonGroup].addButtons([this]);
            }
        },
    });

    module.exports = UIRadioButton;
});
