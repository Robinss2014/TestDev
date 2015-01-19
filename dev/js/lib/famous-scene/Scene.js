define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Entity = require('famous/core/Entity');
    var Engine = require('famous/core/Engine');
    var Transform = require('famous/core/Transform');
    var SizeAwareView = require('./SizeAwareView');

    /**
     *  A scene is a view with a standardized activate and deactivate method.
     *  **WARNING**
     *  If a scene fails to call the callback on deactivate, the current scene will never exit
     *  from the screen.
     *
     *  After the deactivate callback is called, the scene will be removed from the render tree, and the new scene will
     *  be activated. This gives you absolute control over the animations on creation
     *  and deletion.
     *
     *  @class Scene
     *  @name Scene
     *  @extends View
     */
    function Scene() {
        SizeAwareView.apply(this, arguments);
        this.__activeEvents = [];
    }

    Scene.prototype = Object.create( SizeAwareView.prototype );
    Scene.prototype.constructor = Scene;

    /**
     * Activate method to be overwritten.
     * @method activate
     */
    Scene.prototype.activate = function activate() {};

    /**
     * Deactivate method. Meant to be overwritten by the children.
     * If the callback is not called, then the current scene will never be able to be destroyed.
     * @example
     *  MyScene.prototype.deactivate = function (callback) {
     *
     *    this.mod1.setOpacity(0, {
     *      curve: 'outBack',
     *      duration: 200
     *    }) 
     *    this.mod2.setTranslate(Transform.translate(0, 1000), { 
     *      curve: 'outBack',
     *      duration: 800
     *    }, callback); // destroyed on the callback of the setTranslate.
     *  };
     *
     * @method activate
     */
    Scene.prototype.deactivate = function deactivate( callback ) {
       if (callback) callback();
    };

    /*
     *  Add a function to be called during the removeAllEvents destroy.
     *  This is mainly meant for child views, who can group their own unbind functions
     *  in one function to call them.
     *  @param *eventFns {Functio} events to call
     */
    Scene.prototype.addEventFn = function addEventFn(/* eventFns, * */) {
        this.__activeEvents.push.apply( this.__activeEvents, arguments );
        return this;
    }

    /*
     *  If it's an eventFn, call it, otherwise, unbind it from the activeEvent object,
     *  and delete it.
     *  @method removeAllEvents
     */
    Scene.prototype.removeAllEvents = function removeAllEvents() {
        for (var i = 0; i < this.__activeEvents.length; i++) {
            var activeEvent = this.__activeEvents[i];
            if ( activeEvent instanceof Function ) activeEvent();
            else activeEvent.unbindFn( activeEvent.key, activeEvent.boundFn );
            this.__activeEvents[i] = null;
        };
    }

    /*
     *  Unregister the entity, destroying the scene. WARNING, rendering will stop after you call this method.
     *  As this is called in deactivate, wait until the next frame to allow the last commit to occur before
     *  unregestering.
     *  @method destroy
     */
    Scene.prototype.destroy = function destroy() {
        Engine.nextTick( Entity.unregister.bind({}, this.__id ));
    }

    module.exports = Scene;
});
