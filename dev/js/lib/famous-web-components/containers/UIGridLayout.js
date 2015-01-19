define(function(require, exports, module) {
    var UIStretchBox       = require('./UIStretchBox');
    var Engine             = require('famous/core/Engine');
    var UIRow              = require('./UIRow');

    var UIGridLayout = UIStretchBox.extend(/** @lends UIStretchBox.prototype */{
        /**
         * A layout imitating the bootstrap grid layout.  This class is basically
         * a vertical stretchbox containing many UIRows.
         *
         * @class UI
         * @uses UIStretchBox
         * @constructor
         *
         * @param {Object} [options] options to be applied to underlying
         *    UIElement
         */

        /** TODO: add options to dynamically add child rows and add elements to rows.
         *  Also need to add support for multiple window size blocks. As in -
         *  .col-md-6 and .col-xs-4  and a million other things I'm forgetting. ~ joseph
         */

        constructor: function GridLayout(options) {
            if(!options) options = {};

            this._currentState;

            this._width = options.width || 1;
            this._maxWidth = options.maxWidth;
            this._gutters = options.gutters || 30;
            this._columns = options.columns || 12;

            this._inTransition = false;
            this._transition = options._transition || {
              method: 'spring',
              period: 400,
              dampingRatio: 0.3
            };

            this.rows = [];
            this._breakpoints = [
                {"tag": "sm", "value": 600},
                {"tag": "md", "value": 768},
                {"tag": "lg", "value": 840}
            ];

            options.direction = 'y';
            options.padding   = this._gutters;

            this._callSuper(UIStretchBox, 'constructor', options);

            _initRows.call(this, options.rows);
        },

        _handleResize: function (newWidth) {
            var querySize = this._breakpoints[0].tag;
            var rowsLength = this.rows.length;
            var breakpointLength = this._breakpoints.length;
            var i;

            for (i = 0; i < breakpointLength; i++) {
                if (this._breakpoints[i].value < newWidth) {
                    querySize = this._breakpoints[i].tag;
                }
            }

            if(this._inTransition){
                for (i = 0; i < rowsLength; i++) {
                    this.rows[i].setSize(newWidth);
                    this.rows[i]._reflow(querySize, this._transition);
                }
            } else {
                for (i = 0; i < rowsLength; i++) {
                    this.rows[i].setSize(newWidth);
                    this.rows[i]._reflow(querySize);
                }
                this._inTransition = true;
            }
        },

        _endTransition: function () {
            this._inTransition = false;  
        },

        getRows: function () {
            return this.rows;
        },

        setSize: function (x, y, transition, callback) {
            if(this._maxWidth && x > this._maxWidth) {
                x = this._maxWidth;
                return;
            }

            this._handleResize(x);
        }
    });

    function _initRows (rowData) {
        var row;
        var element;

        for (var i = 0; i < rowData.length; i++) {
            row = new UIRow({
                gutters: this._gutters,
                columns: this._columns
            });
            for (var j = 0; j < rowData[i].length; j++) {
                element = rowData[i][j];
                row.addChild(element);
            }
            this.addChild(row);
            this.rows.push(row);
        }
    }

    module.exports = UIGridLayout;
});