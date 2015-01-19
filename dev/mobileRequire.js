/*globals require*/
require.config({
    shim: {

    },
    paths: {
        famous: 'js/lib/famous0.3.1',
        requirejs: 'js/lib/requirejs/require',
        almond: 'js/lib/almond/almond',
        controls: 'js/controls',
        core: 'js/core',
        containers: 'js/containers',

        'famous-scene': 'js/lib/famous-scene',
        'famous-utils': 'js/lib/famous-utils',
        'famous-web-components': 'js/lib/famous-web-components',
        'november-demos-global': 'js/lib/november-demos-global',
        'november-demo-styles': 'js/lib/november-demo-styles'
    }
});
require(['mobile']);
