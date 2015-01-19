define(function(require, exports, module) {
    var UIApplication       = require('ui/containers/UIApplication');
    var UITooltip           = require('ui/controls/UITooltip');
    var UIFab               = require('ui/controls/UIFab');

    var fab = new UIFab();
    fab.center();

    var tooltip = new UITooltip({
        text: 'Hello'
    });

    fab.setTooltip(tooltip);

    var app = new UIApplication({
        children: [fab]
    });
});
