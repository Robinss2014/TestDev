define(function(require, exports, module) {
	var UIListRenderer = require('ui/controls/UIListRenderer');

	module.exports = {
		"bouncy" : UIListRenderer.extend({
			animateIn: function(){
	            this._internalNode.setRotation(0, Math.PI / 2, 0);
	            this._internalNode.setRotation(0, 0, 0, {duration: 1100, curve: 'outBounce'});
			}
		}),
		"flip" : UIListRenderer.extend({
			animateIn: function(){
	            this._internalNode.setRotation(Math.PI, 0, 0);
	            this._internalNode.setRotation(0, 0, 0, {duration: 1100, curve: 'outQuart'});
			}
		}),
		"flyInRight" : UIListRenderer.extend({
			animateIn: function(){
	            this._internalNode.setPosition(200.0, 0, 0);
	            this._internalNode.setPosition(0, 0, 0, {duration: 600, curve: 'outQuart'});
			}
		}),
		"zipper" : UIListRenderer.extend({
			animateIn: function(){
	            this._internalNode.setScale(0, 0, 0);
	            this._internalNode.setScale(1, 1, 1, {duration: 900, curve: 'outQuart'});
	           	this._internalNode.setRotation(0, Math.PI, 0);
	            this._internalNode.setRotation(0, 0, 0, {duration: 900, curve: 'outQuart'});
			}
		}),
		"rotateIn" : UIListRenderer.extend({
			animateIn: function(){
	            this._internalNode.setScale(0, 0, 0);
	            this._internalNode.setScale(1, 1, 1, {duration: 400, curve: 'outQuad'});
	           	this._internalNode.setRotation(0, 0, 9.0);
	            this._internalNode.setRotation(0, 0, 0, {duration: 600, curve: 'outExpo'});
			}
		}),
		"slideIn" : UIListRenderer.extend({
			animateIn: function(direction){
				var rotationDir = direction === "down" ? Math.PI / 2 : Math.PI / 2;
				var startPos = direction === "down" ? [-50.0, 100.0] : [50.0, -100.0];
	           	this._internalNode.setPosition(startPos[0], startPos[1], 9.0);
	            this._internalNode.setPosition(0, 0, 0, {duration: 900, curve: 'outExpo'});
	           	this._internalNode.setRotation(0, 0, rotationDir);
	            this._internalNode.setRotation(0, 0, 0, {duration: 900, curve: 'outExpo'});

			}
		}),
		"stretchy" : UIListRenderer.extend({
			animateIn: function(direction){
				var startPos = direction === "down" ? [500.0, 600.0] : [500.0, -600.0];
	           	this._internalNode.setPosition(startPos[0], startPos[1], 9.0);
	            this._internalNode.setPosition(0, 0, 0, {duration: 900, curve: 'outExpo'});

			}
		}),
	}
});