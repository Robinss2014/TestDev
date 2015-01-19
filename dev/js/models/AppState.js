define(function(require, exports, module) {
    var id = "appState";
    var AppState = Backbone.DemoboStorage.Model.extend({
        demoboID: id,
        defaults: {

        }
    });

    AppState.load = _.memoize(function() {
        this.appState = new AppState({
            id: id
        });
        return this.appState;
    });
    module.exports = AppState.load();
});