define(function(require, exports, module) {
    /**
     *  Routes are controlled by the router.
     *
     *  @class Route
     *  @protected
     */
    function Route ( rawRoute, eventKey ) {
        this.search = '';
        this.hash;
        this.params = {};
        this.eventKey = eventKey;
        this.route = rawRoute;
        this.isGlob = Route.isGlob(this.route);

        this.split = this.split( this.route );
    }

    Route.split = function split ( str ) {
        return str.match(/:*[\w\-\.\*]+/g); // match :word, word, word-word--word, w.o.r.d, *word 
    }

    Route.splitLength = function (str) {
        var split = Route.split(str);
        if (split) return split.length;
        else return 0;
    }

    Route.isGlob = function (route) {
        return route.match(/\*/g);
    }

    Route.typeCast = function (obj, key, data) {
        var firstChar = data.charAt(0);
        if (firstChar.match(/[0-9]/)) { // is number
            obj[key] = parseFloat(data);
        } else { // is string
            obj[key] = data;
        }
    }

    Route.prototype = {
        get: function () {
            return {
                key: this.eventKey,
                search: this.getSearch(),
                params: this.getParams()
            }
        },
        split : function ( str ) {
            var searchIndex = str.indexOf('?');
            var hashIndex = str.indexOf('#');

            if ( searchIndex >= 0 ) {
                this.search = this.parseSearchParams(str);
                str = str.substring(0, searchIndex);
            } 
            else if ( hashIndex >= 0 ) { 
                this.hash = str.substring(hashIndex, str.length);
                str = str.substring(0, hashIndex);
            }
            return Route.split(str);
        },
        parseSearchParams: function ( str ) {

            var parameterRegex = /(?:\&[^=]+\=)([^&]+)/g; //noncapturing group of: &, anything but =, =. Capturing group of anything but &, one or more times.   
            var searchParamRegex = /\&(\w+)\=/g //?, word 1 or more, =.

            var searchData = {};
            while (match = parameterRegex.exec(str) ) {

                searchParamRegex.lastIndex = 0;
                var searchParam = searchParamRegex.exec(match[0]);

                if( searchParam ) {
                    searchData[searchParam[1]] = match[1];
                }
            }
            return searchData;
        },

        length: function () {
            if ( this.split ) return this.split.length;
            else return 0;
        },

        /*
         *  Reset data from param, run through the splits and test if it's a match.
         *  If there is a ':someKey' in the route, save the hashParameter to this.params.someKey.
         *
         *  @param routeSplit {Array} split hash to match.
         *  @returns {Boolean} If the route is a match or not.
         */
        isMatch: function ( fromHash ) {

            var routeSplit = Route.split(fromHash);
            this.params = {}; // reset data parameters

            if ( routeSplit == this.split ) return true;

            for (var i = 0; i < this.split.length; i++) {

                var routeParam = this.split[i],
                    hashParam = routeSplit ? routeSplit[i] : undefined;

                if ( !routeParam ) {
                    return false;
                }
                else if ( routeParam.match( /\*/g ) ) {
                    return true;
                }
                else if ( routeParam.match( /\:/g ) ) {
                    var key = routeParam.match(/[^:]+/g)[0];
                    if (hashParam) Route.typeCast(this.params, key, hashParam);
                    continue;
                } 
                else if ( routeParam !== hashParam ) {
                    return false;
                }
            };

            return true;
        },

        getSplit    : function () { 
            return this.split ? this.split.slice(0) : null; // null because Route.split returns null
        },
        getEventKey : function () { return this.eventKey; },
        getHash     : function () { return this.hash; },
        getParams   : function () { return extend({}, this.params); },
        getSearch   : function () { return extend({}, this.search); }
    }

    // TODO: Move into utility library.
    function extend (a,b) {
        for (var key in b) {
            a[key] = b[key];
        };
        return a;
    }

    module.exports = Route;
});
