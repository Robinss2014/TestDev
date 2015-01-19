define(function (require, exports, module) {
   var UIComponent = require('../core/UIComponent');
   var UIButton = require('./UIButton');
   var UIButtonBar = require('./UIButtonBar');
   var UIBackground = require('./button/UIBackground');
   //@@
   var UIDropdownMenu = UIComponent.extend({
      constructor : function(options) {
        options = options || {};

        this._callSuper(UIComponent, 'constructor', options);

        this._size = options.size  ||  undefined;
        this._collection = options.collection;
        this._textColor  = options.textColor;
        this._background = options.background;
        this._selectedIndex = options.selectedIndex || -1;

        this._backgroundSkin          = options.backgroundSkin         || UIBackground;
        this._itemRenderer            = options.itemRenderer           || UIButton;
        this._itemIconSkin            = options.itemIconSkin;
        this._itemBackgroundSkin      = options.itemBackgroundSkin     || UIBackground;

        this._listButton = this._createListBox();
        this._addChild(this._listButton);

        this._buttonBar = this._createButtonBar();
        this._bindEvent();
        this._listButton.setText('Select');
        this._buttonBar.on('change', this._onButtonChange.bind(this));
      },

      //@@
      _bindEvent : function () {
          this._boundToggle = this.toggle.bind(this);
        this._listButton.on('click', this._boundToggle);
      },

      _onButtonChange: function () {
        this._selectedIndex = this._buttonBar.getSelectedIndex();
        this.setSelected(this._selectedIndex);
        this.emit('change', this._collection.getItemAt([this._selectedIndex]));
      },

      //@@
      _createListBox : function( ) {
        var index = this._selectedIndex === -1 ? 0 : this._selectedIndex;
        return new UIButton({
          size : this._size,
          backgroundType : 'RaisedPressBackground',
          background : this._background,
          textColor : this._textColor,
          raised : false,
          position : [0,0,0],
          zIndex : this._zIndex,
          toggle : true,
         });
      },
      //@@
      _createButtonBar : function() {
        return new UIButtonBar({
          collection : this._collection,
          itemRenderer : this._itemRenderer,
          itemIconSkin : this._itemIconSkin,
          itemBackgroundSkin : this._itemBackgroundSkin,
          textColor : this._textColor,
          selectedIndex : this._selectedIndex,
          background : this._background,
          size : this._size,
          position : [0,0,0],
          raised : true,
          zIndex : 100,
          direction : 'y'
        });
      },
      //@@
      setSelected : function (index) {
        this._listButton.setText(this._buttonBar.getTextAt(index));
        this._buttonBar.setOpacity(0, {duration :400 } ,function () {
          this._removeChild(this._buttonBar);
        }.bind(this));

      },

      getSize: function () {
          return this._listButton.getSize();
      },

      //@@
      getSelectedIndex :function () {
        return this._selectedIndex;
      },
      //@@
      toggle : function () {
        if (this._rawChildren.indexOf(this._buttonBar) === -1) {
            this._addChild(this._buttonBar);
            this._buttonBar.setOpacity(0);
            this._size = this.getSize();
            this._buttonBar.setOpacity(1, {duration :400 });
              this._buttonBar.setSelected(this._selectedIndex);
          } else {
              this._buttonBar.setOpacity(0, {duration :400 } ,function () {
                this._removeChild(this._buttonBar);
            }.bind(this));
          }
      },

   });
  module.exports = UIDropdownMenu;
});
