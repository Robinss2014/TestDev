define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');


    //@@
    var StreamingCollection = function StreamingCollection ( items ) {
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();

        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);

        this._items = items || [];
        this._length = -1;
        this._pageSize = 30;
        this._pagesFetched = {};
    };
    //@@
    StreamingCollection.prototype.getItemAt = function(index) {
        if (this._length==-1) {
            return {label:'', loading: true};
        } else if (index>this._length) {
            return {label:'', loading: true};
        }
        var item = this._items[index];
        if (item==null) {
            // time to fetch that page!
            var pageNum = Math.floor(index / this._pageSize) + 1;
            if (this._pagesFetched[pageNum]!=true) {
                this.fetchByKeyword(null, pageNum);
            }
            item = {
                label: 'Loading',
                imageURL: 'http://www.adobe.com/business/calculator/VIP/image/loader.gif',
                loading: true
            };
        }
        return item;
    };

    StreamingCollection.prototype.fetchByKeyword = function(p_keyword, p_page) {
        if (p_page==null) {
            p_page = 1;
        }   
        if (p_keyword) {
            this._keyword = p_keyword
        }
        this._pagesFetched[p_page] = true;
        var url = "http://svcs.ebay.com/services/search/FindingService/v1";
            url += "?OPERATION-NAME=findItemsByKeywords";
            url += "&SERVICE-VERSION=1.0.0";
            url += "&SECURITY-APPNAME=Famous0df-c5ae-44f9-afc7-837c8319377";
            url += "&GLOBAL-ID=EBAY-US";
            url += "&RESPONSE-DATA-FORMAT=JSON";
            url += "&callback=_cb_findItemsByKeywords";
            url += "&REST-PAYLOAD";
            url += "&keywords="+this._keyword;
            url += "&paginationInput.entriesPerPage="+this._pageSize;
            url += "&paginationInput.pageNumber="+p_page;

            var jScript = document.createElement('script');
            jScript.type = "text/javascript";
            jScript.src = url;
            document.getElementsByTagName('head')[0].appendChild(jScript);

            var self = this;
            window._cb_findItemsByKeywords = function(p_data) {
                self._onDataReturn(p_data);
            };
    };

    StreamingCollection.prototype._onDataReturn = function(p_data) {
        var data = p_data['findItemsByKeywordsResponse'][0];

        var paginationOutput = data['paginationOutput'][0];
        var results = data['searchResult'][0]['item'];

        var firstRun = (this._length==-1);

        this._length = parseInt(paginationOutput.totalEntries[0]);
        var pageNumOffset = (parseInt(paginationOutput.pageNumber[0])-1)*this._pageSize;
        for (var i=0; i<results.length; i++) {
            var imageURL;
            if(results[i].galleryURL) imageURL = results[i].galleryURL[0];
            this.setItemAt({
                label:results[i].title[0],
                imageURL: imageURL
            }, i+pageNumOffset);
        }
        if (firstRun) {
            this._eventOutput.emit('lengthReady', {});
        }
    };

    //@@
    StreamingCollection.prototype.addItemAt = function(item, index) {
        this._items.splice(index, 0, item );
        this._eventOutput.emit('addItem', {
            item: item,
            index: index
        });
    };

    //@@
    StreamingCollection.prototype.addItem = function(item) {
        var index = this._items.push(item) - 1;
        this._eventOutput.emit('addItem', {
            item: item,
            index: index
        });
    };

    //@@
    StreamingCollection.prototype.removeItemAt = function(index) {
        var removed = this._items.splice(index, 1);
        this._eventOutput.emit('removeItem', {
            item: removed[0],
            index: index
        });
    };

    //@@
    StreamingCollection.prototype.getLength = function() {
        return this._length;
    };

    //@@
    StreamingCollection.prototype.setItemAt = function(item, index) {
        this._items[index] = item;
        this._eventOutput.emit('setItem', {
            item: item,
            index: index
        });
    };
    
    module.exports = StreamingCollection;

});