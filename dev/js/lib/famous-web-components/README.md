# Famo.us UI

## Setting Up

```
# on the commandline run:
npm install
```

## Viewing the Demos

To View the demos, use serve, or any other static http server:
```
npm install -g serve
# from base directory
serve
# in the browser go to:
localhost:3000/demos/
```

A framework for building visually rich Famo.us apps and UI components. Along the way, it provides familiar packaging for all that makes Famo.us amazing via an API that requires significantly less learning and code overhead.

## Introduction

**Famo.us UI** empowers 2 categories of developers:

1. **Application developers** will get an easy-to-use set of UI Components (like checkboxes, sliders, selectable menus, tab navigators, etc, etc) which will allow them to create beautiful Famo.us apps.

2. **Component developers** will be able to easily extend current base classes and follow their internal structure in order to build new UI Components.

## Famo.us UI Core

Famo.us UI Core is the base set of abstractions, composed of three classes: UIBase, UIElement, and UIComponent.

### UIBase

Abstract Base class - it's the fundamental unit of "an interactive object in space", with built-in transitions and event dispatch. Both UIElement and UIComponent inherit from this base. UIBase exposes the following methods:

```
on
off
emit
destroy
setPosition / getPosition
setSize / getSize
setRotation / getRotation
setScale / getScale
setSkew / getSkew
setDelay / getDelay         // nigel - don't think this makes sense
setTransform / getTransform
setOpacity / getOpacity
setOrigin / getOrigin
setAlign / getAlign
getFinalTransform
halt
```

### UIElement (inherits UIBase)

UIElements are the building blocks within Famo.us UIComponents. They build upon UIBase, layering in the ability to render content, and respond to gesture input (in effect encapsulating surfaces and syncs). These are atomic units
from which UIComponents compose themselves; they cannot contain anything other than their content. Typically, only component developers need to use UIElements.

UIElements contain the following methods:

```
setContent / getContent
setStyle / getStyle
setClasses / getClasses
```

### UIComponent (inherits UIBase)

UIComponents are the fundamental building blocks of apps. UIComponents encapsulate their internals, typically composed of UIElements and other UIComponents; developers don't have access to add or remove arbitrary content within them.

The UIComponent class currently doesn't add a lot of external APIs for app developers - rather it structures its protected internal APIs for making it easy for component developers to create new subclasses. In the future, UIComponent will be the home for keyboard focus, accessibility, and some level of service integration. Wait for it =).

## Creating a UIComponent

Here is how you create a very basic card UIComponent.

```javascript
define(function(require, exports, module) {

    var UIElement   = require('../core/UIElement');
    var UIComponent = require('../core/UIComponent');

    var UICard = UIComponent.extend({
        constructor: function(options) {
            this._callSuper(UIComponent, 'constructor', options);

            // Values exposed to user via options object
            this.background    = this.options.background   || '#fff';
            this.boxShadow     = this.options.boxShadow    || '0 2px 10px 0 rgba(0, 0, 0, 0.16)'
            this.borderRadius  = this.options.borderRadius || '2px';
            this.content       = this.options.content      || '';
            this.textAlign     = this.options.textAlign    || 'center';
            this.lineHeight    = this.options.lineHeight   || this.getSize()[1] + 'px';

            // Default values
            this._height       = 300;
            this._width        = 300;

            this._createCard();
            this._layout();
        },

        _createCard: function(options) {
            this.cardBackground = new UIElement();
            this.cardBackground.setStyle({
                background: this.background,
                boxShadow: this.boxShadow,
                borderRadius: this.borderRadius,
                textAlign: this.textAlign,
                lineHeight: this.lineHeight
            });
            this.cardBackground.setContent(this.content);
            this._addChild(this.cardBackground);
        },

        _layout: function(options) {
            var cardSize = this.getSize();
            if (!cardSize[0]) cardSize[0] = this._width;
            if (!cardSize[1]) cardSize[1] = this._height;
            this.setSize(cardSize[0], cardSize[1]);
        },

        on: function(type, event) {
            return this.cardBackground.on(type, event);
        }
    });

    module.exports = UICard;
});
```

Lets instantiate and manipulate a new UICard.

```javascript
define(function(require, exports, module) {
    var Engine = require('famous/core/Engine');
    var UICard = require('./components/UICard');

    var mainContext = Engine.createContext();

    var card = new UICard({
        size: [200, 200],
        content: 'Mein Schatzi',
        origin: [0.5, 0.5],
        align: [0.5, 0.5],
        background: 'Yellow',
        textAlign: 'center'
    });

    card.on('click', function() {
        card.setRotation(0, 0, Math.PI * 2, {
            duration: 3000,
            curve: 'outBounce'
        });
        card.setSize(300, 300, {
            duration: 3000
        });
    });

    mainContext._addChild(card);
});
```
