var test = require('tape');
var Router = require('../Router');

function ToBeNotified () {
    this._data;
}

ToBeNotified.prototype.trigger = function (eventName, data) {
    this._data = data;
}
ToBeNotified.prototype.getData = function () {
    return this._data;
}


test('Router', function (t) {
    var testRouter = new Router();
    var notified = new ToBeNotified();

    var ROUTES = {
        'test1': 'test1',
        'test2': 'test2',
        'idTest/:id': 'idTest',
        'idTest/:firstId/another/:secondId': 'idTest',
        'globTest/*': 'glob'
    };

    var REDIRECTS = {
        'redirect1': 'test1',
        'globRedirect/*': 'test1'
    };

    testRouter.addRoutes(ROUTES);
    testRouter.addRedirects(REDIRECTS);

    t.test('getState', function (t) { 
        var state = testRouter.getState();
        t.equal(window.location.pathname, state.pathname);  
        t.equal(window.location.hash, state.hash);  
        t.end();
    });

    t.test('Set Route', function (t) {
        var notified = new ToBeNotified();
        testRouter.connect(notified);
        testRouter.setRoute('test1');
        t.equal(ROUTES['test1'], notified.getData().key);
        testRouter.disconnect(notified);
        t.end();
    });

    t.test('setRoute fails on not defined route', function (t) {
        testRouter.setRoute('/');
        t.equal(testRouter.setRoute('never_before_named_route'), false);
        t.end();
    });

    t.test('Regular redirects should redirect', function (t) {
        var notified = new ToBeNotified();
        testRouter.setRoute('/');
        testRouter.connect(notified);
        testRouter.setRoute('redirect1');
        t.equal(ROUTES['test1'], notified.getData().key);
        testRouter.disconnect(notified);
        t.end();
    });

    t.test('Regular redirects should redirect', function (t) {
        var notified = new ToBeNotified();
        testRouter.setRoute('/');
        testRouter.connect(notified);
        testRouter.setRoute('redirect1');
        t.equal(ROUTES['test1'], notified.getData().key);
        testRouter.disconnect(notified);
        t.end();
    });

    t.test('Param parsing should parse params', function (t) {
        var notified = new ToBeNotified();
        testRouter.setRoute('/');
        testRouter.connect(notified);
        testRouter.setRoute('idTest/5');
        t.equal(5, notified.getData().params.id);
        t.equal('idTest', notified.getData().key);
        t.end();
    });

    t.test('Param parsing should parse many nested params', function (t) {
        var notified = new ToBeNotified();
        testRouter.setRoute('/');
        testRouter.connect(notified);
        testRouter.setRoute('idTest/5/another/10');
        t.equal(5, notified.getData().params.firstId);
        t.equal(10, notified.getData().params.secondId);
        t.equal('idTest', notified.getData().key);
        t.end();
    });

    t.test('Glob Route should hit the key', function (t) {
        var notified = new ToBeNotified();
        testRouter.setRoute('/');
        testRouter.connect(notified);
        testRouter.setRoute('globTest/awef/awef/awef/awef');
        t.equal(ROUTES['globTest/*'], notified.getData().key);
        testRouter.disconnect(notified);
        t.end();
    });

    //  Bug found: Test Fails! TODO: 
    ///t.test('Glob Redirects should redirect', function (t) {
    ///    var notified = new ToBeNotified();
    ///    testRouter.setRoute('/');
    ///    testRouter.connect(notified);
    ///    testRouter.setRoute('globRedirect/awef/awef/awef/awef');
    ///    t.equal(ROUTES['globRedirect/*'], notified.getData().key);
    ///    testRouter.disconnect(notified);
    ///    t.end();
    ///});

});
