// @famous-block-option codePanelActive false
// @famous-block-option renderToolbarPosition bottom-right

require('famous-polyfills');

// register curves
require('famous-utils/RegisterEasing');
require('famous-utils/RegisterPhysics');

// @famous-ignore
require('november-demo-styles/index');
// @famous-ignore
require('famous/core/famous.css');
require('./css/app.css')

var Engine   = require('famous/core/Engine');
// var Lightbox = require('./YouTubeLightboxApp');
var Lightbox = require('./BasicLightboxApp');

var DeviceHelpers = require('./DeviceHelpers');

Engine.setOptions({appMode: false});

// Add root classes
document.body.classList.add('famous-root');
document.documentElement.classList.add('famous-root');

var ctx = Engine.createContext();
ctx.setPerspective(1000);

ctx.add(new Lightbox());
