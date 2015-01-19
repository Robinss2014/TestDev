// Use this file to test out newer controls or just to play around
define(function(require, exports, module) {
    var UIApplication = require('ui/containers/UIApplication');
    var UIButtonBar = require('ui/controls/UIButtonBar');
    var UIButton = require('ui/controls/UIButton');
    var UIBackground = require('ui/controls/button/UIBackground');
    var UICollection = require('ui/data/UICollection');
    var UIDropdownMenu = require('ui/controls/UIDropdownMenu');
    var UIElement       = require('ui/core/UIElement');
    var CurveIcon    = require('ui/controls/button/curveIcon');
    var Easing = require('famous/transitions/Easing');

    var app = new UIApplication();
 
    var easing  = [
        {text :'inQuad',iconType: 'easingIcon', iconName :'inQuad'},
        {text :'outQuad',iconType: 'easingIcon', iconName :'outQuad'},
        {text :'inOutQuad',iconType: 'easingIcon', iconName :'inOutQuad'},
        {text :'inCubic',iconType: 'easingIcon', iconName :'inCubic'},
        {text :'outCubic',iconType: 'easingIcon', iconName :'outCubic'},
        {text :'inOutCubic',iconType: 'easingIcon', iconName :'inOutCubic'},
        {text :'inQuart',iconType: 'easingIcon', iconName :'inQuart'},
        {text :'outQuart',iconType: 'easingIcon', iconName :'outQuart'},
        {text :'inOutQuart',iconType: 'easingIcon', iconName :'inOutQuart'},
        {text :'inQuint',iconType: 'easingIcon', iconName :'inQuint'},
        {text :'outQuint',iconType: 'easingIcon', iconName :'outQuint'},
        {text :'inOutQuint',iconType: 'easingIcon', iconName :'inOutQuint'},
        {text :'inSine',iconType: 'easingIcon', iconName :'inSine'},
        {text :'outSine',iconType: 'easingIcon', iconName :'outSine'},
        {text :'inOutSine',iconType: 'easingIcon', iconName :'inOutSine'},
        {text :'inExpo',iconType: 'easingIcon', iconName :'inExpo'},
        {text :'outExpo',iconType: 'easingIcon', iconName :'outExpo'},
        {text :'inOutExpo',iconType: 'easingIcon', iconName :'inOutExpo'},
        {text :'inCirc',iconType: 'easingIcon', iconName :'inCirc'},
        {text :'outCirc',iconType: 'easingIcon', iconName :'outCirc'},
        {text :'inOutCirc',iconType: 'easingIcon', iconName :'inOutCirc'},
        {text :'inElastic',iconType: 'easingIcon', iconName :'inElastic'},
        {text :'outElastic',iconType: 'easingIcon', iconName :'outElastic'},
        {text :'inOutElastic',iconType: 'easingIcon', iconName :'inOutElastic'},
        {text :'inBack',iconType: 'easingIcon', iconName :'inBack'},
        {text :'outBack',iconType: 'easingIcon', iconName :'outBack'},
        {text :'inOutBack',iconType: 'easingIcon', iconName :'inOutBack'},
        {text :'inBounce',iconType: 'easingIcon', iconName :'inBounce'},
        {text :'outBounce',iconType: 'easingIcon', iconName :'outBounce'},
        {text :'inOutBounce',iconType: 'easingIcon', iconName:'inOutBounce'}
    ];

    var easingCollection = new UICollection(easing.slice(0,30));

    var dropdownButton = new UIDropdownMenu({
            collection: easingCollection,
            itemRenderer : UIButton,
            itemiconSkin : CurveIcon,
            itemBackground : UIBackground,
            position : [0, 0, 0],
            direction : 'x',
            textColor :  '#33CCFF',
            background : "#272822",
        });

    var buttonBar = new UIButtonBar({
            collection: easingCollection,
            itemRenderer : UIButton,
            itemiconSkin : CurveIcon,
            itemBackground : UIBackground,
            position : [0, 400, 0],
            direction : 'x',
            textColor :  '#33CCFF',
            background : "#272822",
        });


    var curveIcons = [];
    var size = [150,150];
    for (var i = 0; i < easing.length  ; i++) {
         curveIcons[i] = new CurveIcon({
            size: size,
            position : [30+(i%10)*(size[0]+30),100+Math.floor(i/10)*(size[1]+30),0],
            curveFunc : Easing[easing[i].text],
        });
         app.addChild(curveIcons[i]);
    } 

    var triangle = new UIElement({
        position: [100,0,0],
        size : [20,5],
        style: {
            background : 'red',
        }
    });

    dropdownButton.on('change', function(){
        var selected = this.getSelectedIndex();
        var easingType = easing[this.getSelectedIndex()].text;
        var curvePosition = curveIcons[selected].getPosition();
        triangle.halt();
        triangle.setPosition(curvePosition[0]-20,curvePosition[1]+size[1]*0.9,curvePosition[2],{duration:300});
        triangle.setPosition(curvePosition[0]-20,curvePosition[1]+size[1]*0.1,0,{duration: 2000, curve: Easing[easingType]});
        console.log('selected curve',easingType,curveIcons[selected].getPosition());
    }.bind(dropdownButton));

    buttonBar.on('change', function(){
        var selected = this.getSelectedIndex();
        var easingType = easing[this.getSelectedIndex()].text;
        var curvePosition = curveIcons[selected].getPosition();
        triangle.halt();
        triangle.setPosition(curvePosition[0]-20,curvePosition[1]+size[1]*0.9,curvePosition[2],{duration:300});
        triangle.setPosition(curvePosition[0]-20,curvePosition[1]+size[1]*0.1,0,{duration: 2000, curve: Easing[easingType]});
        console.log('selected curve',easingType,curveIcons[selected].getPosition());
    }.bind(buttonBar));

    app.addChild(triangle);
    app.addChild(dropdownButton);
    app.addChild(buttonBar);

});
