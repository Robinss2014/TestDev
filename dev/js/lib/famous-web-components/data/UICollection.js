define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');

    /**
     * @constructor Collection
     * @param Items 
     */
    var Collection = function Collection ( items ) {
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();

        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);

        this._items = items || [];
    };

    /**
     * @method getItemAt
     * @param index
     */
    Collection.prototype.getItemAt = function(index) {
        return  this._items[index];
    };

    /**
     * @method addItemAt
     * @param item
     * @param index
     */
    Collection.prototype.addItemAt = function(item, index) {
        this._items.splice(index, 0, item );
        this._eventOutput.emit('addItem', {
            item: item,
            index: index
        });
    };

    /**
     * @method addItem
     * @param item
     */
    Collection.prototype.addItem = function(item) {
        var index = this._items.push(item) - 1;
        this._eventOutput.emit('addItem', {
            item: item,
            index: index
        });
    };

    /**
     * @method removeItemAt
     * @param index
     */
    Collection.prototype.removeItemAt = function(index) {
        var removed = this._items.splice(index, 1);
        this._eventOutput.emit('removeItem', {
            item: removed[0],
            index: index
        });
    };

    /**
     * @method getLength
     */
    Collection.prototype.getLength = function() {
        return this._items.length;
    };

    /**
     * @method setItemAt
     * @param item
     * @param index
     */
    Collection.prototype.setItemAt = function(item, index) {
        this._eventOutput.emit('setItem', {
            item: item,
            index: index
        });
        this._items[index] = item;
    };
    
    module.exports = Collection;

});