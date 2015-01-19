var test = require('tape');
var UIBase = require('../core/UIBase');

test('UI', function (t) {
    t.ok(UIBase, 'UI does exist');
    console.log(UIBase);
    t.end();
});
