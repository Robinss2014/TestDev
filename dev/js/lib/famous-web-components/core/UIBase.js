define(function(require, exports, module) {
    var EventHandler                = require('famous/core/EventHandler');
    var RenderNode                  = require('famous/core/RenderNode');
    var Modifier                    = require('famous/core/Modifier');
    var Transitionable              = require('famous/transitions/Transitionable');
    var ModifierChain               = require('famous/modifiers/ModifierChain');
    var Utility                     = require('famous/utilities/Utility');
    var TweenTransition             = require('famous/transitions/TweenTransition');
    var Easing                      = require('famous/transitions/Easing');
    var SpringTransition            = require('famous/transitions/SpringTransition');
    var WallTransition              = require('famous/transitions/WallTransition');
    var SnapTransition              = require('famous/transitions/SnapTransition');
    var TransitionableTransform     = require('famous/transitions/TransitionableTransform');

    /**
     * A base class for integrating basic UIBase functionality
     *   into UIElements and UIComponents.
     *
     * @class UIBase
     * @constructor
     *
     * @param {Object} [options] options to be applied to Object
     * @param {Transform} [options.transform] affine transformation matrix
     * @param {Number} [options.opacity] opacity
     * @param {Array.Number} [options.origin] origin adjustment
     * @param {Array.Number} [options.align] align adjustment
     * @param {Array.Number} [options.size] size to apply to descendants
     */
    function UIBase(options) {
        this._parent = null;

        this._eventHandler = new EventHandler();
        EventHandler.setInputHandler(this, this._eventHandler);
        this._eventHandler.bindThis(this);

        this._renderNode = new RenderNode();

        // Use a ModifierChain. This allows us to dynamically add and remove new
        // modifiers later on if needed.
        this._modifierChain = new ModifierChain();
        this._rootNode = this._renderNode.add(this._modifierChain);

        // Inherit defaults of parent if possible
        if (this.__super__) {
            this.defaults.prototype = this.__super__.defaults;
        }

        this.options = Object.create(this.defaults);
        UIBase.prototype._extend.call(this.options, options || {});

        if (this.options.id) {
            this._id = this.options.id;
            UIBase._idRegistry[this] = this;
        }
        if (this.options.position) this.setPosition.apply(this, this.options.position);
        if (this.options.rotation) this.setRotation.apply(this, this.options.rotation);
        if (this.options.skew) this.setSkew.apply(this, this.options.skew);
        if (this.options.scale) this.setScale.apply(this, this.options.scale);
        if (this.options.percentage) this.setPercentage.apply(this, options.percentage);

        if (this.options.opacity !== undefined) this.setOpacity.call(this, this.options.opacity);
        if (this.options.origin) this.setOrigin.apply(this, this.options.origin);
        if (this.options.align) this.setAlign.apply(this, this.options.align);
        if (this.options.size) this.setSize.apply(this, this.options.size);
        if (this.options.on) {
            var onHash = this.options.on;
            for (var eventType in onHash) {
                this.on(eventType, onHash[eventType]);
            }
        }

        // Flag for modifier with a functional transform.
        this._functionalTransform = false;
    }

    UIBase.prototype.toString = UIBase.prototype.getID = function toString () {
        // this catches null or undefined, keep as double equals!
        // My Linter freaks out. I don't like implicit type conversion. Are you
        // ok with this solution?
        if (this._id === null || this._id === undefined) {
            this._id = UIBase.getNextId();
        }

        return this._id;
    };

    UIBase._currentId = 0;
    UIBase.getNextId = function getNextId() {
        return UIBase._currentId++;
    };

    UIBase._idRegistry = {};

    /**
     * Only render if renderable is set to true
     *
     * @property renderable
     */
    UIBase.prototype.renderable = true;

    /**
     * Default options. Intended to be overriden using the extend method.
     *
     * @property defaults
     */
    UIBase.prototype.defaults = {};

    /**
     * Correctly sets up the prototype chain, for subclasses.
     *   Similar to `goog.inherits`, but uses a hash of prototype properties and
     *   class properties to be extended. Adopted from Backbone.JS. It correctly
     *   sets up the prototype chain, so subclasses created with extend can be
     *   further extended and subclassed as far as you like.
     *
     * @method extend
     *
     * @param {Object} properties instance properties
     * @param {Object} [classProperties] class properties to be attached
     *   directly to the constructor function
     * @return {Function} child the newly created class / constructor function
     */
    UIBase.extend = function extend(properties, classProperties) {
        var parent = this;
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (properties && properties.hasOwnProperty('constructor')) child = properties.constructor;
        else child = function(){ return parent.apply(this, arguments); };

        // Add static properties to the constructor function, if supplied.
        this.prototype._extend.call(child, parent, classProperties);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        function Surrogate(child) { this.constructor = child; }
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate(child);

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (properties) this.prototype._extend.call(child.prototype, properties);

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        return child;
    };

    /**
     *  Call a method on a super class
     *  @param pSuperClass {UI*} Desired super class to call
     *  @param pName {String} Name of method to call on the super class
     *  @param {*} Any number of arguments to pass to the super class' method.
     *  @method _callSuper
     *  @protected
     */
    UIBase.prototype._callSuper = function _callSuper(pSuperClass, pName) {
        var pArgs = Array.prototype.slice.call(arguments, 2);
        return pSuperClass.prototype[pName].apply(this, pArgs);
    };

    /**
    * applies all passed in options into protected instance vars
    * @protected
    */
    UIBase.prototype._applyOptions = function(p_options) {
        if (p_options!=null) {
            for (var i in p_options) {
                this['_'+i] = p_options[i];
            }
        }
    };



    /**
     *  Add a master modifier, setting up the transitionables and the modifier chain.
     *  @method _addMasterModifier
     *  @protected
     */
    UIBase.prototype._addMasterModifier = function _addMasterModifier() {
        this._transitionableTransform = new TransitionableTransform();

        this._opacityState = new Transitionable(1);
        this._originState = new Transitionable([0, 0]);
        this._alignState = new Transitionable([0, 0]);
        this._sizeState = new Transitionable([undefined, undefined]);
        this._boundTransformGetter = this._getTransform.bind(this);

        this._masterModifier = new Modifier({
            transform: this._transitionableTransform,
            opacity: this._opacityState,
            origin: this._originState,
            align: this._alignState,
            size: this._sizeState
        });
        this._modifierChain.addModifier(this._masterModifier);

        return this;
    };

    /**
     *  Turn off functional modifiers.
     *  @method _resetModifierTransforms
     *  @protected
     */
    UIBase.prototype._resetModifierTransforms = function _resetModifierTransforms() {
        this._masterModifier.setTransform(this._boundTransformGetter);
        this._functionalTransform = false;
    };

    /**
     * Add event handler object to set of downstream handlers.
     *
     * @method pipe
     * @chainable
     *
     * @param {EventHandler} target event handler target object
     * @return {UIBase} this
     */
    UIBase.prototype.pipe = function pipe(target) {
        this._eventHandler.pipe(target);
        return this;
    };

    /**
     * Remove handler object from set of downstream handlers.
     *   Undoes work of "pipe".
     *
     * @method unpipe
     * @chainable
     *
     * @param {EventHandler} target target handler object
     * @return {UIBase} this
     */
    UIBase.prototype.unpipe = function unpipe(target) {
        this._eventHandler.unpipe(target);
        return this;
    };

    /**
     * Emits an event, sending to all handler listening for the 'type' key.
     *
     * @method emit
     *
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event event data
     * @return {UIBase} this
     */
    UIBase.prototype.emit = function emit(type, event) {
        this._eventHandler.emit(type, event);
        return this;
    };

    /**
     * Binds a callback function to an event type handled by this object.
     *
     * @method on
     *
     * @param {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     * @return {UIBase} this
     */
    UIBase.prototype.on = function on(type, handler) {
        this._eventHandler.on(type, handler);
        return this;
    };

    /**
     * Unbinds an event by type and handler. This undoes the work of 'on'.
     *
     * @method off
     *
     * @param {string} type event type key (for example, 'click')
     * @param {function} handler function object to remove
     * @return {UIBase} this
     */
    UIBase.prototype.off = function off(type, handler) {
        this._eventHandler.removeListener(type, handler);
        return this;
    };

    /**
     * Generates a render spec from the rootNode so it can later be added to
     *   the render tree.
     *
     * @private
     * @method render
     *
     * @return {Object} render specification for the component subtree
     *    only under this node
     */
    UIBase.prototype.render = function render() {
        if (this.renderable) return this._renderNode.render();
    };

    /**
     * Destroys the Object by not rendering it
     *   and deleting its id from the idRegistry
     *
     * @protected
     * @method destroy
     */
    UIBase.prototype.destroy = function destroy() {
        this.renderable = false;
        delete UIBase._idRegistry[this._id];
    };

    /**
     *  Gets the parent of the Object
     *
     *  @method getParent
     *
     *  @return {UI*} Get the UI Component that contains this instance.
     */
    UIBase.prototype.getParent = function getParent() {
        return this._parent;
    };

    /**
     * Sets the position of this object along 3 dimensions, either
     *   instantaneously, or animated via a provided Transitionable.
     *
     * @method setPosition
     *
     * @param {Number} x coordintate for the new position
     * @param {Number} y coordintate for the new position
     * @param {Number} z coordintate for the new position
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] callback to call after transition completes
     * @return {UIBase} this
     */
    UIBase.prototype.setPosition = function setPosition(x, y, z, transition, callback) {
        if (!this._masterModifier) this._addMasterModifier();
        if (this._functionalTransform) this._resetModifierTransforms();

        var translate = [x, y, z];
        if (Array.isArray(x)) {
            translate = x;
            transition = y;
            callback = z;
        }

        this._transitionableTransform.setTranslate(translate, transition, callback);
        return this;
    };

    /**
     * Gets the position of this object along 3 dimensions
     *
     * @method getTranslation
     * @deprecated Use getPosition
     *
     * @param {Transform} translate Position to transition to
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] callback to call after transition completes
     * @return {Modifier} this
     */
    UIBase.prototype.getTranslation = function getTranslation() {
        if (!this._masterModifier) this._addMasterModifier();
        if (this._functionalTransform) this._resetModifierTransforms();
        if (this._functionalTransform) {
            return Transform.getTranslate(this._masterModifier.getTransform());
        } else {
            return this._transitionableTransform.translate.get();
        }
    };

    /**
     * @alias getTranslation
     */
    UIBase.prototype.getPosition = UIBase.prototype.getTranslation;

    /**
     * Sets the rotation of this object along 3 dimensions, either
     *   instantaneously, or animated via a provided Transitionable.
     *
     * @method setRotation
     *
     * @param {Number} x-axis angle in radians for new rotation state
     * @param {Number} y-axis angle in radians for new rotation state
     * @param {Number} z-axis angle in radians for new rotation state
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] callback to call after rotation completes
     * @return {UIBase} this
     */
    UIBase.prototype.setRotation = function setRotation(x, y, z, transition, callback) {
        if (!this._masterModifier) this._addMasterModifier();
        if (this._functionalTransform) this._resetModifierTransforms();

        var eulerAngles = [x, y, z];
        if (Array.isArray(x)) {
            eulerAngles = x;
            transition = y;
            callback = z;
        }

        this._transitionableTransform.setRotate(eulerAngles, transition, callback);
        return this;
    };

    /**
     * Sets the scale of this object along 3 dimensions, either
     *   instantaneously, or animated via a provided Transitionable.
     *
     * @method setScale
     *
     * @param {Number} x scaling represented with a number ideally between 0 and 1
     * @param {Number} y scaling represented with a number ideally between 0 and 1
     * @param {Number} z scaling represented with a number ideally between 0 and 1
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] callback to call after scale completes
     * @return {UIBase} this
     */
    UIBase.prototype.setScale = function setScale(x, y, z, transition, callback) {
        if (!this._masterModifier) this._addMasterModifier();
        if (this._functionalTransform) this._resetModifierTransforms();

        var scale = [x, y, z];
        if (Array.isArray(x)) {
            scale = x;
            transition = y;
            callback = z;
        }

        this._transitionableTransform.setScale(scale, transition, callback);
        return this;
    };

    /**
     * Sets the skew of this object along 3 dimensions, either
     *   instantaneously, or animated via a provided Transitionable.
     *
     * @method setSkew
     *
     * @param {Number} x skew angle
     * @param {Number} y skew angle
     * @param {Number} z skew angle
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] callback to call after skew completes
     * @return {UIBase} this
     */
    UIBase.prototype.setSkew = function setSkew(x, y, z, transition, callback) {
        if (!this._masterModifier) this._addMasterModifier();
        if (this._functionalTransform) this._resetModifierTransforms();

        var skewAngles = [x, y, z];
        if (Array.isArray(x)) {
            skewAngles = x;
            transition = y;
            callback = z;
        }

        this._transitionableTransform.setSkew(skewAngles, transition, callback);
        return this;
    };

    /**
     * Sets the delay of the object's transition.
     *
     * @method setDelay
     *
     * @param {Number} duration delay time (ms)
     * @param {Function} [callback] callback to call after skew completes
     * @return {UIBase} this
     */
    UIBase.prototype.setDelay = function setDelay(duration, callback) {
        if (!this._masterModifier) this._addMasterModifier();

        this._finalTransform = this._getTransform();

        var _callback = callback ? Utility.after(8, callback) : null;
        this._transitionableTransform.translate.delay(duration, _callback);
        this._transitionableTransform.rotate.delay(duration, _callback);
        this._transitionableTransform.skew.delay(duration, _callback);
        this._transitionableTransform.scale.delay(duration, _callback);

        this._opacityState.delay(duration, _callback);
        this._originState.delay(duration, _callback);
        this._alignState.delay(duration, _callback);
        this._sizeState.delay(duration, _callback);

        return this;
    };

    /**
     * Sets the transform of the object.
     *
     * @method setTransform
     *
     * @param {Transform} transform Transform to transition to,
     * or a function called every tick which returns the desired transform value.
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] function to call after transition completes
     * @return {UIBase} this
     */
    UIBase.prototype.setTransform = function setTransform(transform, transition, callback) {
        if (!this._masterModifier) this._addMasterModifier();

        if (transform instanceof Function) {
            this._masterModifier.transformFrom(transform);
            this._functionalTransform = true;
        } else {
            if (this._functionalTransform) this._resetModifierTransforms();
            this._transitionableTransform.set(transform, transition, callback);
        }
        return this;
    };

    /**
     * Sets the opacity of the object.
     *
     * @method setOpacity
     *
     * @param {Number | Function} opacity Opacity value to transition to,
     * or a function called every tick which returns the desired opacity value.
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] callback to call after transition completes
     * @return {UIBase} this
     */
    UIBase.prototype.setOpacity = function setOpacity(opacity, transition, callback) {
        if (!this._masterModifier) this._addMasterModifier();

        if (opacity instanceof Function) {
            this._masterModifier.opacityFrom(opacity);
        } else {
            this._opacityState.set(opacity, transition, callback);
        }
        return this;
    };

    /**
     * Sets the origin of the object.
     *
     * @method setOrigin
     *
     * @param {Array.Number | Function} origin two element array with values between 0 and 1,
     * or a function called every tick which returns the desired origin value.
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] callback to call after transition completes
     * @return {UIBase} this
     */
    UIBase.prototype.setOrigin = function setOrigin(x, y, transition, callback) {
        if (!this._masterModifier) this._addMasterModifier();

        if (x instanceof Function) {
            this._masterModifier.originFrom(x);
        } else if (Array.isArray(x)) {
            this._originState.set.apply(this._originState, arguments);
        } else {
            this._originState.set([x, y], transition, callback);
        }
        return this;
    };

    /**
     * Sets the percentage of the object.
     *
     * @method setPercentage
     *
     * @param {Array.Number | Function} origin two element array with values between 0 and 1,
     * or a function called every tick which returns the desired origin value.
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] callback to call after transition completes
     * @return {UIBase} this
     */
    UIBase.prototype.setPercentage = function setPercentage(x, y, transition, callback) {
        if (!this._percentage) this._percentage = new Transitionable([x, y]);
        else this._percentage.set([x, y]);
    };

    /**
     * Sets the align of the object.
     *
     * @method setAlign
     *
     * @param {Array.Number} align two element array with values between 0 and 1
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] callback to call after transition completes
     * @return {UIBase} this
     */
    UIBase.prototype.setAlign = function setAlign(x, y, transition, callback) {
        if (!this._masterModifier) this._addMasterModifier();

        if (x instanceof Function) {
            this._masterModifier.alignFrom(x);
        } else if (Array.isArray(x)) {
            this._alignState.set.apply(this._alignState, arguments);
        } else {
            this._alignState.set([x, y], transition, callback);
        }
        return this;
    };

    /**
     * Sets the size of the object.
     *
     * @method setSize
     *
     * @param {Number} width in pixels of the object
     * @param {Number} height in pixels of the object
     * @param {Transitionable} [transition] Valid transitionable object
     * @param {Function} [callback] callback to call after transition completes
     * @return {UIBase} this
     */
    // FIXME animate undefined size
    UIBase.prototype.setSize = function setSize(width, height, transition, callback) {
        if (!this._masterModifier) this._addMasterModifier();

        if (Array.isArray(width)) {
            this._sizeState.set.apply(this._sizeState, arguments);
        } else {
            if (transition){
                var cb = function () {
                    this.emit('sizeTransitionEnd', this);
                    if (callback) callback();
                };
                this._sizeState.set([width, height], transition, cb.bind(this));
            } else this._sizeState.set([width, height], transition, callback);
        }
        if (transition) this.emit('sizeTransitionStart', this);
        return this;
    };

    /**
     * Stops all transitions on the object.
     *
     * @method halt
     *
     * @return {UIBase} this
     */
    UIBase.prototype.halt = function halt() {
        if (!this._masterModifier) this._addMasterModifier();

        if (this._transitionableTransform) this._transitionableTransform.halt();

        if (this._opacityState) this._opacityState.halt();
        if (this._originState) this._originState.halt();
        if (this._alignState) this._alignState.halt();
        if (this._sizeState) this._sizeState.halt();

        // TODO: create the states if they don't exist to avoid all this conditional checking?

        return this;
    };

    /**
     * Gets the current transform state of the object.
     *
     * @protected
     * @method _getTransform
     *
     * @return {Object} transform provider object
     */
    UIBase.prototype._getTransform = function _getTransform() {
        if (!this._masterModifier) this._addMasterModifier();

        if (this._functionalTransform) {
            return this._masterModifier.getTransform();
        } else {
            return this._transitionableTransform.get();
        }
    };

    /**
     * Gets the destination transform state of the object.
     *
     * @method getFinalTransform
     * @return {Transform} transform matrix
     */
    UIBase.prototype.getFinalTransform = function getFinalTransform() {
        if (!this._masterModifier) this._addMasterModifier();
        return this._transitionableTransform._final;
    };

    /**
     * Gets the destination translation state of the object.
     *
     * @method getFinalTranslation
     * @return {Transform} transform matrix
     */
    UIBase.prototype.getFinalTranslation = function getFinalTranslation() {
        if (!this._masterModifier) this._addMasterModifier();
        return this._transitionableTransform._finalTranslate;
    };

    /**
     * Gets the destination skew state of the object.
     *
     * @method getFinalSkew
     * @return {Transform} transform matrix
     */
    UIBase.prototype.getFinalSkew = function getFinalSkew() {
        if (!this._masterModifier) this._addMasterModifier();
        return this._transitionableTransform._finalSkew;
    };

    /**
     * Gets the destination scale state of the object.
     *
     * @method getFinalScale
     * @return {Transform} transform matrix
     */
    UIBase.prototype.getFinalScale = function getFinalScale() {
        if (!this._masterModifier) this._addMasterModifier();
        return this._transitionableTransform._finalScale;
    };

    /**
     * Gets the current opacity of the object.
     *
     * @method getOpacity
     * @return {Number} current opacity
     */
    UIBase.prototype.getOpacity = function getOpacity() {
        if (!this._masterModifier) this._addMasterModifier();
        return this._masterModifier.getOpacity();
    };

    /**
     * Gets the current origin of the object.
     *
     * @method getOrigin
     * @return {Array 2D} current origin
     */
    UIBase.prototype.getOrigin = function getOrigin() {
        if (!this._masterModifier) this._addMasterModifier();
        return this._masterModifier.getOrigin();
    };

    /**
     * Gets the current align of the object.
     *
     * @method getAlign
     * @return {Array 2D} current align
     */
    UIBase.prototype.getAlign = function getAlign() {
        if (!this._masterModifier) this._addMasterModifier();
        return this._masterModifier.getAlign();
    };

    /**
     * Gets the current scale of the object.
     * @method getScale
     * @return {Array 3D} current scale
     */
    UIBase.prototype.getScale = function getScale() {
        if (!this._masterModifier) this._addMasterModifier();
        if (this._functionalTransform) return Transform.interpret(this._masterModifier.getTransform()).scale;
        else return this._transitionableTransform.scale.get();
    };

    /**
     * Gets the current rotation of the object.
     * @method getRotation
     * @return {Array 3D} current rotation
     */
    UIBase.prototype.getRotation = function getRotation() {
        if (!this._masterModifier) this._addMasterModifier();
        if (this._functionalTransform) return Transform.interpret(this._masterModifier.getTransform()).rotate;
        else return this._transitionableTransform.rotate.get();
    };

    /**
     * Gets the current size of the object.
     *
     * @method getSize
     * @return {Object} size provider object
     */
    UIBase.prototype.getSize = function getSize() {
        if (!this._masterModifier) this._addMasterModifier();
        var externalSize;
        var realSize = this._sizeState.get().slice();

        if (realSize[0] === undefined || realSize[1] === undefined) {

            if (this._parent) externalSize = this._parent.getSize();
            else externalSize = [undefined, undefined];

            if (realSize[0] === undefined) realSize[0] = externalSize[0];
            if (realSize[1] === undefined) realSize[1] = externalSize[1];
        }

        return realSize;
    };

    /**
     * Get the total transition of the current item
     * @method getWorldPosition
     * @returns {Array|3D} Current offset translation.
     */
    UIBase.prototype.getWorldPosition = function getWorldPosition() {
        var _parent = this.getParent();
        var position = this.getPosition().slice(0);
        while (_parent) {
            var parentPosition = _parent.getPosition();
            position[0] += parentPosition[0];
            position[1] += parentPosition[1];
            position[2] += parentPosition[2];
            _parent = _parent.getParent();
        }
        return position;
    }

    /**
     * Centers the object
     *
     * @deprecated
     * @method center
     * @param {Object} [transition] object containing duration and curve
     * @param {Function} [callback] function to run after transition is
     *   complete
     * @return {UIBase} this
     */
    UIBase.prototype.center = function center(transition, callback) {
        var _callback = callback ? Utility.after(2, callback) : null;
        this.setAlign(0.5, 0.5, transition, _callback);
        this.setOrigin(0.5, 0.5, transition, _callback);
        return this;
    };

    // Helper method used internally for extending the object this function is
    // bound to by overriding the object properties by the properties supplied
    // through the passed in arguments.
    UIBase.prototype._extend = function _extend() {
        for (var i = 0; i < arguments.length; i++) {
            var source = arguments[i];
            for (var prop in (source || {})) {
              this[prop] = source[prop];
            }
        }
    };

    /**
     *
     * @static
     * @method registerCurve
     * @param {String} curveName curve name
     * @param {Function} curve curve
     */
    UIBase.registerCurve = function registerCurve(curveName, curve) {
        TweenTransition.registerCurve(curveName, curve);
        return this;
    };

    /**
     * Registers a method
     *
     * @static
     * @method registerMethod
     */
    UIBase.registerMethod = Transitionable.registerMethod.bind(Transitionable);

    /**
     * Unregisters a method
     *
     * @static
     * @method unregisterMethod
     */
    UIBase.unregisterMethod = Transitionable.unregisterMethod.bind(Transitionable);

    /**
     * Unregisters a curve
     *
     * @static
     * @method unregisterCurve
     * @param {String} curveName curve name
     * @return {UIBase} this
     */
    UIBase.unregisterCurve = function registerCurve(curveName) {
        TweenTransition.unregisterCurve(curveName);
        return this;
    };

    // register Easing curves
    for (var curve in Easing) {
        UIBase.registerCurve.call(null, curve, Easing[curve]);
    }

    // register physics transitions
    UIBase.registerMethod('spring', SpringTransition);
    UIBase.registerMethod('wall', WallTransition);
    UIBase.registerMethod('snap', SnapTransition);

    module.exports = UIBase;
});
