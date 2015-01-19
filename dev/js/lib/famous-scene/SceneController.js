define(function(require, exports, module) {
    var View = require('famous/core/View');
    var RenderNode = require('famous/core/RenderNode');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Engine = require('famous/core/Engine');

    /*
     *  A SceneController controls the rendering of specific scenes. The main benefit to using a 
     *  SceneController is the way it handles activation and deactivation of scenes. 
     *
     *  The active scene has full control over when the next scene is rendered, enabling chaining of
     *  animations.
     *
     *  @example
     *    // Basic Scene Controller
     *    var mainContext = Engine.createContext();
     *    var homeController = new SceneController({
     *      'page1': require('./pages/1'),
     *      'page2': require('./pages/1'),
     *      'page3': require('./pages/1'),
     *    });
     *    mainContext.add(homeController);
     *
     *    // activate page 1
     *    homeController.setScene('page1');
     *
     *  @example
     *    // SceneController with default data
     *    var mainContext = Engine.createContext();
     *    var homeController = new SceneController({
     *      'page1': PageOneScene,       // inherits from Scene.js
     *      'page2': PageTwoScene,       // inherits from Scene.js
     *      'page3': PageThreeScene,     // inherits from Scene.js
     *    });
     *
     *    homeController.setDefaultOptions({ 
     *      'page1': {
     *        transition: { 
     *          curve: 'outBack',
     *          duration: 500
     *        }
     *      },
     *      'page2': { 
     *        // data to replace PageTwoScene.DEFAULT_OPTIONS
     *      },
     *      
     *      // pass options data retrieved from an ajax call 
     *      'page3': function (callback) {
     *        $.ajax('/some/url',  function (data) {
     *          callback(data);
     *        };
     *      };
     *
     *    });
     *    mainContext.add(homeController);
     *
     *    // activate page 1
     *    homeController.setScene('page1');
     *
     *    // activate page 2 with custom options
     *    // custom options take precedence over defaultOptions
     *    homeController.setScene('page2', { 'superCustomOption': true });
     *
     *
     *  @class SceneController
     */
    function SceneController ( scenes ) {
        View.apply(this, arguments);

        this.nodes = [];
        this.routes = {};
        this.defaultOptions = {};

        events.call(this);
        if (scenes) this.addScenes(scenes);
    }

    SceneController.prototype = Object.create(View.prototype);
    SceneController.prototype.constructor = SceneController;

    /*
     *  SceneController reacts to a set event. Most commonly this set
     *  is sent from the Router. 
     *
     *  @method events
     *  @private
     */
    function events() {
        this._eventInput.on('set', this.onSet.bind(this));
    }

    /*
     *  @method addScene 
     *  @param key {String} key to trigger viewing of View.
     *  @param view {View|Scene} scene to view on key.
     */
    SceneController.prototype.addScene = function ( key, view ) {
        this.routes[ key ] = view;
    };

    /*
     *  Add many scenes.
     *  @method addScenes
     *  @param obj {Object} object of { 'key' : {{view}} } pairs.
     */
    SceneController.prototype.addScenes = function ( obj ) {
        for ( var key in obj ) {
            this.addScene( key, obj[ key ] );
        }
    };

    /*
     * Remove scenes via an array of keys.
     * @param arr {Array} Array of keys to remove scenes by.
     */
    SceneController.prototype.removeScenes = function ( arr ) {
        for (var i = 0; i < arr.length; i++) {
            this.removeScene(arr[i])
        };
    }

    /*
     *  Remove an individual scene by key
     *  @param key {String} key to remove
     */
    SceneController.prototype.removeScene = function ( key ) {
        delete this.routes[ key ];
    };

    /*
     *  Reset. Nothing will be rendered when this is called.
     *  @method reset
     */
    SceneController.prototype.reset = function  () {
        this.nodes = [];
    };

    /*
     *  Set a transform on the active modifier ( the modifier that is above the current scene )
     *  @method setActiveModifier
     *  @param transform {Transform} Transform to set to.
     *  @param transition {Object} Transiition definition
     *  @param callback {Function} callback to execute when animation is finished.
     */
    SceneController.prototype.setActiveModifier = function ( transform, transition, callback ) {
        if (this.activeModifier) {
            this.activeModifier.halt();
            this.activeModifier.setTransform( transform, transition, callback );
        }
    };

    /*
     *  Set the default options for each of the scenes that the SceneController will render.
     *  The defaultOptions can either be a preset object or a function. If it is a function,
     *  it is passed a callback as the first argument, which it *MUST* call. 
     *
     *  @method setDefaultOptions
     *  @param obj {Object} 
     */
    SceneController.prototype.setDefaultOptions = function ( obj ) {
        for (var key in obj) this.defaultOptions[key] = obj[key];
    }

    /*
     *  @method removeDefaultOptions
     *  @param arr {Array} array of keys to remove the default options for.
     */
    SceneController.prototype.removeDefaultOptions = function ( arr ) {
        for (var i = 0; i < arr.length; i++) {
            delete this.defaultOptions[arr[i]];
        };
    }

    SceneController.prototype.onSet = function (data) {
        this.setScene(data.key, data);
    }

    /*
     *  Set the scene via a key or an object. The data object will be passed as the
     *  second argument to the scene, enabling default options & passed down data.
     *
     *  @method setScene
     *  @param key {String} key of scene to change to.
     *  @param data {Object} Data to pass.
     */
    SceneController.prototype.setScene = function (key, data) {
        if (key == this.getCurrentRoute()) return false;

        var newView = this.routes[key];

        if ( typeof newView == 'undefined' ) {
            console.warn( 'No view exists!', key );
            return;
        }

        this.currentRoute = key;
        this.ActiveConstructor = newView;

        this._eventOutput.emit('change', {
            key: key,
            data: data
        });

        if ( this.activeScene && this.activeScene.deactivate ) {
            this.activeScene.deactivate(_resetAndGetOptions.bind(this, data));
        } 
        else {
            return _resetAndGetOptions.call(this, data);
        }
    };

    /*
     *  @method _resetAndGetOptions
     *  @private
     *  @param data {object} data passed from key.data (setScene)
     */
    function _resetAndGetOptions ( data ) {
        this.reset();
        this._eventOutput.emit('deactivate');
        if (data) _createAndAddScene.call(this, data);
        else _getOptions.call(this);
    }

    /*
     *  Get the default options. If it is a function, call it and pass the _createAndAddScene callback, 
     *  allowing ajax calls to a server.
     *
     *  @method _getOptions
     *  @private
     *  @param data {object} data passed from key.data (setScene)
     */
    function _getOptions () {
        var defaultOptions = this.defaultOptions[this.currentRoute];
        if ( defaultOptions instanceof Function ) { 
            defaultOptions(_createAndAddScene.bind(this));
        } 
        else { 
            _createAndAddScene.call(this, defaultOptions);
        }
    }

    /*
     *  @method _createAndAddScene
     *  @private
     *  @param data {Object} 
     *  @param defaultOptions {Object} default options
     */
    function _createAndAddScene( data) {
        this.activeScene    = new this.ActiveConstructor(data);
        this.activeModifier = new StateModifier();

        var node = new RenderNode();
        node.add( this.activeModifier ).add( this.activeScene );
        this.nodes.push( node );

        this._eventOutput.emit('activate', this.currentRoute);
        if ( this.activeScene.activate ) this.activeScene.activate();
    };

    /*
     *  @method getCurrentRoute
     *  @returns {string} key of current route
     */
    SceneController.prototype.getCurrentRoute = function () {
        return this.currentRoute;
    };

    /*
     *  @method getRoutes
     *  @returns {object} all active Routes
     */
    SceneController.prototype.getRoutes = function () {
        return this.routes;
    };

    /*
     *  @method getActiveModifier
     *  @returns {Modifier} modifier above the main scene
     */
    SceneController.prototype.getActiveModifier = function () {
        return this.activeModifier;
    };

    /*
     *  @method render
     *  @returns {RenderSpec} rendered scenes.
     */
    SceneController.prototype.render = function render() {
        var result = [];
        for (var i = 0; i < this.nodes.length; i++) {
            result.push(this.nodes[i].render());
        }
        return result;
    };

    module.exports = SceneController;
});
