define(function(require, exports, module) {

    var DeviceHelpers = {};

    DeviceHelpers.isMobile = function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    };

    module.exports = DeviceHelpers;

});
