define(function(require, exports, module) {
    var UIElement = require('../../core/UIElement');
    var UIDropdownMenu = require('../UIDropdownMenu');
    var UIButton = require('../UIButton');
    var UIBackground = require('./UIBackground');
    var UICollection = require('../../data/UICollection');
    var CurveIcon = require('./CurveIcon');
 
    var easing  = [
        {text :'inQuad',iconType: 'easingIcon', iconName :'inQuad'},
        {text :'outQuad',iconType: 'easingIcon', iconName :'outQuad'},
        {text :'inOutQuad',iconType: 'easingIcon', iconName :'inOutQuad'},
        {text :'inCubic',iconType: 'easingIcon', iconName :'inCubic'},
        {text :'outCubic',iconType: 'easingIcon', iconName :'outCubic'},
        {text :'inOutCubic',iconType: 'easingIcon', iconName :'inOutCubic'},
        {text :'inQuart',iconType: 'easingIcon', iconName :'inQuart'},
        {text :'outQuart',iconType: 'easingIcon', iconName :'outQuart'},
        {text :'inOutQuart',iconType: 'easingIcon', iconName :'inOutQuart'},
        {text :'inQuint',iconType: 'easingIcon', iconName :'inQuint'},
        {text :'outQuint',iconType: 'easingIcon', iconName :'outQuint'},
        {text :'inOutQuint',iconType: 'easingIcon', iconName :'inOutQuint'},
        {text :'inSine',iconType: 'easingIcon', iconName :'inSine'},
        {text :'outSine',iconType: 'easingIcon', iconName :'outSine'},
        {text :'inOutSine',iconType: 'easingIcon', iconName :'inOutSine'},
        {text :'inExpo',iconType: 'easingIcon', iconName :'inExpo'},
        {text :'outExpo',iconType: 'easingIcon', iconName :'outExpo'},
        {text :'inOutExpo',iconType: 'easingIcon', iconName :'inOutExpo'},
        {text :'inCirc',iconType: 'easingIcon', iconName :'inCirc'},
        {text :'outCirc',iconType: 'easingIcon', iconName :'outCirc'},
        {text :'inOutCirc',iconType: 'easingIcon', iconName :'inOutCirc'},
        {text :'inElastic',iconType: 'easingIcon', iconName :'inElastic'},
        {text :'outElastic',iconType: 'easingIcon', iconName :'outElastic'},
        {text :'inOutElastic',iconType: 'easingIcon', iconName :'inOutElastic'},
        {text :'inBack',iconType: 'easingIcon', iconName :'inBack'},
        {text :'outBack',iconType: 'easingIcon', iconName :'outBack'},
        {text :'inOutBack',iconType: 'easingIcon', iconName :'inOutBack'},
        {text :'inBounce',iconType: 'easingIcon', iconName :'inBounce'},
        {text :'outBounce',iconType: 'easingIcon', iconName :'outBounce'},
        {text :'inOutBounce',iconType: 'easingIcon', iconName:'inOutBounce'}
    ];

    var easingCollection = new UICollection(easing);

    var dropdownButton = new UIDropdownMenu({
        collection: easingCollection,
        itemRenderer : UIButton,
        itemiconSkin : CurveIcon,
        itemBackground : UIBackground,
        position : [0, 0, 0],
        direction : 'x',
        textColor :  '#33CCFF',
        background : "#272822",
    });

    var UIEasingDropdownMenu = UIDropdownMenu.extend({
        constructor: function UIEasingDropdownMenu (options) {
            if (!options) options = {};
            options.collection = easingCollection;
            options.itemRenderer = UIButton;
            options.itemIconSkin = CurveIcon;
            options.itemBackground = UIBackground;
            if (!options.textColor) options.textColor = '#404040';
            if (!options.background) options.background = '#fff';
            this._callSuper(UIDropdownMenu, 'constructor', options);
        },
        _onButtonChange: function () {
          this._selectedIndex = this._buttonBar.getSelectedIndex();
          this.setSelected(this._selectedIndex);
          this.emit('change', this._collection.getItemAt([this._selectedIndex]).iconName);
        },
        
    });

    module.exports = UIEasingDropdownMenu;
});
