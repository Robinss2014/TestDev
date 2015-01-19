define(function (require, exports, module) {
   var UIComponent = require('../core/UIComponent');
   var UIButton = require('controls/UIButton');
   var UIButtonBar = require('controls/UIButtonBar');
   /**
    * @constructor UIListButton
    */
   var UIListButton =  UIComponent.extend({
      constructor : function(options) {
        options = options || {};

        this._callSuper(UIComponent, 'constructor', options);

        this._size = options.size  ||  [150, 30];
        this._collection = options.collection;

        this._listButton = this._createListBox();
        this._addChild(this._listButton);

        this._bindEvent();
        this._listButton.setText('Select');
      },
      /**
       * @method _bindEvent
       * @private
       */
      _bindEvent : function () {
        this._listButton.on('click', function () {
            // show button bar
          if (this._rawChildren.indexOf(this._buttonBar) === -1) {
            this._buttonBar = this._createButtonBar();
            this._addChild(this._buttonBar);
            this._buttonBar.setOpacity(1, {duration :200 });
          }
          else {
            this._buttonBar.setOpacity(0, {duration :200 }, function () {
                this._removeChild(this._buttonBar);
            }.bind(this));
          }
          this._buttonBar.on('change', function() {
          }.bind(this));
        }.bind(this));
      },

      _onButtonChange: function () {
        var selectedIndex = this._buttonBar.getSelected();
        this.setSelected(selectedIndex);
        this.emit('change');
      },
      /**
       * @method _createListBox
       * @private
       * @param
       */
      _createListBox : function( ) {
        return new UIButton({
          // size : this._size,
          backgroundType : 'RaisedPressBackground',
          raised : false,
          position : [0,0,0],
          zIndex : this._zIndex,
          toggle : true
        });
      },
      /**
       * @method _createButtonBar
       * @private
       */
      _createButtonBar : function() {
        return new UIButtonBar({
          collection : this._collection,
          // size : this._size,
          position : [0,0,0],
          raised : true,
          zIndex : 100,
          direction : 'y'
        });
      },
      /**
       * @method setSelected
       * @param index
       */
      setSelected : function (index) {
        this._listButton.setText(this._buttonBar.getSelectedText());
        this._removeChild(this._buttonBar);
      }

   });
  module.exports = UIListButton;
});
