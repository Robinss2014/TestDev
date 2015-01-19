define(function(require, exports, module) {
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var Modifier = require('famous/core/Modifier');
    var StateModifier = require('famous/modifiers/StateModifier');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Transitionable   = require('famous/transitions/Transitionable');

    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var Particle = require('famous/physics/bodies/Particle');
    var Rectangle = require('famous/physics/bodies/Rectangle');
    var VectorField = require('famous/physics/forces/VectorField');
    var Spring = require('famous/physics/forces/Spring');
    var Vector = require('famous/math/Vector');
    var Distance = require('famous/physics/constraints/Distance');
    var Wall = require('famous/physics/constraints/Wall');
    var Drag = require('famous/physics/forces/Drag');
    var RotationalSpring = require('famous/physics/forces/RotationalSpring');
    var RotationalDrag = require('famous/physics/forces/RotationalDrag');

    var Polaroid = require('js/views/ui/Polaroid');

    function PhysicsPolaroid(context, physicsEngine, walls, options) {
        View.apply(this, arguments);

        this.physics = new PhysicsEngine();

        _initParticle.call(this);
        _initPolaroid.call(this);
        _createForces.call(this);
        _setListeners.call(this);
    }

    PhysicsPolaroid.prototype = Object.create(View.prototype);
    PhysicsPolaroid.prototype.constructor = PhysicsPolaroid;

    PhysicsPolaroid.DEFAULT_OPTIONS = {
        size: [400, 450],
        filmBorder: 15,
        photoBorder: 3,
        photoUrl: undefined,
        angle: -0.5
    };

    function _initParticle() {
        this.guide = new Surface({
            properties: {
                backgroundColor: 'pink',
                borderRadius: '50px'
            }
        });

        this.guideParticle = new Particle({
            position: [0, -window.innerHeight/2, 0]
        });

        this.physics.addBody(this.guideParticle);

        this.guideMod = new Modifier({
            size: [25, 25],
            align: [0.13, 0.65],
            origin: [0.5, 0.5],
            transform: function() {
                return this.guideParticle.getTransform();
            }.bind(this)
        });

        this.add(this.guideMod).add(this.guide);
    }

    function _initPolaroid() {
        this.physicsPolaroid = new Polaroid({
            size: this.options.size,
            photoUrl: this.options.photoUrl,
            zIndex: -5
        });

        this.polaroidBody = new Rectangle({
            size: this.options.size
        });

        this.physics.addBody(this.polaroidBody);

        this.polaroidMod = new Modifier({
            align: [0.13, 0.62],
            origin: [0.5, 0.5],
            transform: function() {
                return this.polaroidBody.getTransform();
            }.bind(this)
        });

        this.add(this.polaroidMod).add(this.physicsPolaroid);

    }

    function _createForces() {
        this.forwardForce = new Spring({
            period: 1000,
            anchor: [0,-window.innerHeight/2,0],
            dampingRatio: 0.4
        });

        this.gravity = new VectorField({
            direction: new Vector(0,1,0),
            strength: 0.001
        });

        this.distance = new Distance({
            length: window.innerHeight/2
        });

        this.drag = new Drag({strength: 0.001});

        var sign = Math.ceil(Math.random()*2)%2 ? 1 : -1;
        var angle = sign * Math.min(Math.random()/250, 0.04); console.log(angle)
        this.rotation = new RotationalSpring({
            anchor: [0,0,angle]
        });

        this.rotationDrag = new RotationalDrag({strength: 0.0005});

        this.wall = new Wall({
            normal: [0,1,0],
            distance: 25
        });

        this.physics.attach(this.forwardForce, this.guideParticle);
        this.physics.attach(this.gravity, this.polaroidBody);
        this.physics.attach(this.distance, [this.polaroidBody], this.guideParticle);
        this.physics.attach(this.drag, this.polaroidBody);
        this.physics.attach(this.rotation, this.polaroidBody);
        this.physics.attach(this.rotationDrag, this.polaroidBody);
        this.physics.attach(this.wall, this.polaroidBody);
    }

    function _setListeners() {
        this.guide.on('click', function() {
            this.play.call(this);

        }.bind(this));
    }

    PhysicsPolaroid.prototype.fadeIn = function(){
        this.physicsPolaroid.fadeIn();
    };

    PhysicsPolaroid.prototype.play = function(){
        var position = this.guideParticle.getPosition();
        var newPos = [position[0]+450, -window.innerHeight/2, position[2]];
        this.forwardForce.setOptions({anchor: newPos});
    };


    module.exports = PhysicsPolaroid;
});

