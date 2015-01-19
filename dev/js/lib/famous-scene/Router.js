define(function(require, exports, module) {
    var Controller = require('./Controller');
    var Route = require('./Route');

    /**
     *  A data-event emitter based Router, notifying connected
     *  classes of navigation change events. 
     *
     *  @class Router
     *  @constructor
     *
     *  @example { App Example } 
     *      var router = new Router();
     *      var sceneController = new SceneController();
     *
     *      sceneController.addScenes({
     *          'main'  : MainScene,
     *          'login' : LoginScene
     *      });
     *      router.addRoutes({
     *          '/' : 'main',
     *          '/login' : 'login'
     *      });
     *
     *      router.connect( sceneController );
     *      router.setRoute('/');
     *
     *  @example
     *      navSurface = new Surface({
     *          content: '<a href="/">Home</a>'
     *      });
     *      Router.registerLink(navSurface);
     *
     */
    function Router () {
        Controller.apply(this, arguments);
        this._routes        = {};
        this._redirects     = {};
        this._globRoutes    = [];
        this._globRedirects = [];
        this._connected     = [];

        this.handleHashChange = this._handleHashChange.bind(this);
        this.handleStateChange = this._handleStateChange.bind(this);
        this._redirectMatch = redirectMatch.bind(this);
        this._routeMatch = routeMatch.bind(this);
        this._bindListeners();
    }

    Router.protoype = Object.create( Controller.prototype );
    Router.prototype.constructor = Router;

    Router.DEFAULT_OPTIONS = {
        adapter: 'native'
    }

    Router.ADAPTERS = {
        native: require('./historyAdapters/native')
    }

    /**
     *  Ask adapter for proper listener
     *  @method _bindListeners
     *  @private
     */
    Router.prototype._bindListeners = function bindListener() {
        Router.ADAPTERS[this.options.adapter].bind.call(this);
    }

    /**
     *  Unbind listener from adapter
     *  @method _bindListeners
     *  @private
     */
    Router.prototype._unbindListeners = function bindListener() {
        Router.ADAPTERS[this.options.adapter].bind.call(this);
    }

    /**
     *  @method pushState
     *  @param url {string} pushState URL
     */
    Router.prototype.pushState = function (url) {
        return Router.ADAPTERS[this.options.adapter].pushState(url);
    }

    /**
     *  @method replaceState
     *  @param url {string} replaceState URL
     */
    Router.prototype.replaceState = function (url) {
        return Router.ADAPTERS[this.options.adapter].replaceState(url);
    }

    /**
     *  Set the route, and trigger eventing update.
     *  @method setRoute
     */
    Router.prototype.setRoute = function (url) {
        this.pushState(url);
        return this._update();
    }

    /**
     *  Get the active window state.
     *  @method getState
     *  @param url {string} pushState URL
     */
    Router.prototype.getState = function () {
        return Router.ADAPTERS[this.options.adapter].getState();
    }

    /*
     *  Set the default route, if no route matches the current url.
     *  @method defaultTo
     *  @param defaultRoute {String} Route to initialize with.
     */
    Router.prototype.defaultTo = function defaultTo( defaultRoute ) {
        this.state = this.getState();
        if (!this.isValidRoute(this.state.pathname)) {
            this.setRoute(defaultRoute);
        }
    }

    /**
     *  @method _handleStateChange
     *  @description
     */
    Router.prototype._handleStateChange = function _handleStateChange( e ) {
        this._update();
    }

    /**
     *  @event hashchange hash change event
     *  @method _handleHashChange
     *  @description
     */
    Router.prototype._handleHashChange = function _handleHashChange( e ) {
        this._update();
    }

    /**
     *  Add routes in { 'url' : 'eventToEmit' } pair. Routes are bucketed
     *  by the length of route.
     *  @method addRoutes
     *  @param {Object} routes.
     */
    Router.prototype.addRoutes = function addRoutes( routes ) {
        _addItems.call(this, routes, this._routes, this._globRoutes);
    }

    /**
     *  Remove routes in [ 'url', 'url2'] array.
     *
     *  @method removeRoutes
     *  @param {Object} routes.
     */
    Router.prototype.removeRoutes = function removeRoutes( routes ) {
        _removeItems.call(this, routes, this._routes, this._globRoutes);
    }

    /**
     *  Add redirects in { 'url' : 'redirect' } pair. Redirects are buckted
     *  by the length of route.
     *
     *  @method addRedirects
     *  @param {Object} redirects
     */
    Router.prototype.addRedirects = function addRedirects( redirects ) {
        _addItems.call(this, redirects, this._redirects, this._globRedirects);
    }

    /**
     *  Remove redirects in [ 'url', 'url2'] array.
     *
     *  @method removeRoutes
     *  @param {Object} routes.
     */
    Router.prototype.removeRedirects = function removeRedirects( redirects ) {
        _removeItems.call(this, redirects, this._redirects, this._globRedirects);
    }

    /**
     *  Order of precedence: 
     *      1. Glob Redirects
     *      2. Glob Routes
     *      3. Route redirects
     *      4. Routes
     *  @method _update
     *  @protected
     */
    Router.prototype._update = function () {
        this.state = this.getState();

        if (this._checkGlobMatches()) {
            return true;
        } else {
            return this._checkRoutes();
        }
    }

    /**
     *  Check glob redirect and glob routes for a match.
     *  @method _checkGlobMatches
     *  @protected
     */
    Router.prototype._checkGlobMatches = function () {
        if (_checkRouteArray.call(this, this.state.pathname, this._globRedirects, this._redirectMatch)) {
            return true;
        }
        else if (_checkRouteArray.call(this, this.state.pathname, this._globRoutes, this._routeMatch)) {
            return true;
        } 
        else {
            return false;
        }
    }

    /**
     *  Check redirects and routes for a match.
     *  @method _checkGlobMatches
     *  @protected
     */
    Router.prototype._checkRoutes = function () {
        if (_checkBucket.call(this, this.state.pathname, this._redirects, this._redirectMatch)) {
            return true;
        }
        else if (_checkBucket.call(this, this.state.pathname, this._routes, this._routeMatch)) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     *  Update all the connected pieces via the set event. This means
     *  that all connected pieces must be listening for a set event
     *  to execute any change.
     *
     *  @method updateConnected
     *  @param data {Object} if there is a :someVar, pass {someVar: valueFromHash} through the set.
     */
    Router.prototype._updateConnected = function updateConnected( data ) {
        for (var i = 0; i < this._connected.length; i++) {
            this._connected[i].trigger( 'set', data );
        };
    }

    /**
     *  Connected classes are those that get notified from the page
     *  change event.
     *
     *  @method connect
     *  @param {Class} ref.
     */
    Router.prototype.connect = function connect( ref ) {
        this._connected.push( ref );
    }

    /**
     *  Disconnect from a routers events.
     *
     *  @method disconnect
     *  @param {Class} ref
     */
    Router.prototype.disconnect = function (ref) {
        var indexOf = this._connected.indexOf(ref);
        if (indexOf >= 0) this._connected.splice(indexOf, 1);
    }

    /*
     *  Prevent default on link, instead navigating through pushState if it is a registered link to the router.
     *  TODO: REMOVE ZEPTO DEPENDENCY
     *
     *  @method registerLink
     *  @param {Surface} surface - surface to listen to.
     *  @param {Function} callback - callback to execute on click
     *  @param {Integer} numSteps - maximum number of parents to search for href
     *  @description
     */
    Router.prototype.registerLink = function registerLink( surface, callback, numSteps ) {

        if (!numSteps) numSteps = 1;
        surface.on('click', (function ( cb, e) {

            var $elem = e.srcElement;

            var href = $elem.href,
                title = $elem.title;

            var $parentElem = $elem;
            var steps = 0;
            while (!href && steps < numSteps) {
                $parentElem = $parentElem.parentNode || $parentElem.parentElement;
                href = $parentElem.href;
                title = $parentElem.title;
                steps++;
            }

            if (!href) return;

            var linkedRoute = new Route(href);
            if (this.isValidRoute(linkedRoute)) { 
                e.preventDefault();
                this.pushState(null, title, href);
                if ( cb ) cb(title, href);
            }
        }).bind(this, callback));
    }

    Router.prototype.isValidRoute = function (route) {
        if (this._checkGlobMatches()) {
            return true;
        } else if (this._checkRoutes()) {
            return true;
        } else {
            return false;
        }
    }


    /**
     *  If it's a redirect match, pushState with the desiredRoute.
     *  @method redirectMatch
     *  @private
     */
    function redirectMatch (route) {
        this.setRoute(route.getEventKey());
    }

    /**
     *  If it's a route match, notify the connected of the change.
     *  @method routeMatch
     *  @private
     */
    function routeMatch (route) {
        this._updateConnected(route.get());
    }

    /**
     *  Check a container for a bucketed array.
     *  @method _checkBucket
     *  @private
     */
    function _checkBucket ( routePathname, containerObject, successCallback ) {
        var routes = containerObject[Route.splitLength(routePathname)];
        return _checkRouteArray( routePathname, routes, successCallback );
    }

    /**  
     *  Check an array for a route match.
     *  @method _checkRouteArray
     *  @private
     */
    function _checkRouteArray( route, routeArray, successCallback ) {
        if ( !routeArray ) return false;
        for (var i = 0; i < routeArray.length; i++) {

            var match = routeArray[i].isMatch( route );

            if ( match ) {
                if ( successCallback ) successCallback( routeArray[i] );
                return true;
            }
        };
        return false;
    }

    /**
     *  If the route is a glob star, add it to the glob star matches, otherwise,
     *  bucket by length of route.
     *
     *  @method _addItems
     *  @private
     *  @param {Object} items. Items to add to containerArray
     *  @param {Array} containerArray. containerArray to hold bucketed items.
     *  @param {Array} globArray. For items that have glob star matches *, they are stored
     *  independantly of bucked items, and take precedence over bucketed routes.
     */
    function _addItems( items, containerArray, globArray ) {
        for ( var item in items ) {
            var route = new Route(item, items[item]);
            if (route.isGlob) {
                globArray.push(route);
            }
            else {
                _addToBucketedArray( route, containerArray );
            }
        }
    }

    /**
     *  @method _addToBucketedArray
     *  @private
     *  @param {Route} created route that is not glob star
     */
    function _addToBucketedArray( route, containerArray ) {
        var length = route.length();
        if ( !containerArray[length] ) containerArray[length] = [];
        containerArray[length].push( route );
    }

    /**
     *  Remove items from router, passed in via a ['route1', 'route2', ...]array.
     *
     *  @method _bucketAndAddItem
     *  @private
     *  @param {Object} items. Items to remove from containerArray.
     *  @param {Array} containerObject. containerArray items will be removed from.
     *  @param {Array} globArray.
     *
     */
    function _removeItems( items, containerObject, globArray ) {
        for (var i = 0; i < items.length; i++) {
            var routeToRemove = items[i];
            var routeLength = Route.splitLength(routeToRemove);
            var bucketedArray = containerObject[routeLength];
            if (!bucketedArray) continue;

            var removedFromGlob = _removeRouteFromArray.call(this, routeToRemove, globArray);
            if (!removedFromGlob) _removeRouteFromArray.call(this, routeToRemove, bucketedArray);
        };
    }

    /**
     *  From some container array, search for match to route and splice it out if found. Return true if it is spliced.
     *  @method _removeRouteFromArray
     *  @private
     */
    function _removeRouteFromArray( routeToRemove, containerArray ) {
        for (var i = 0; i < containerArray.length; i++) {
            var realRoute = containerArray[i];
            if ( realRoute.route == routeToRemove ) {
                containerArray.splice(i, 1);
                return true;
            }
        };
        return false;
    }

    module.exports = Router;
});
