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
        containers: 'js/containers'
    }
});
require(['web']);
