var DeviceHelper = {};

DeviceHelper.isMobile = function() { 
   var userAgent = navigator.userAgent;
   if( /webOS|iPhone|iPod|BlackBerry/i.test(userAgent) || (/android/i.test(userAgent) && /mobile/i.test(userAgent))) {
       return true;
   } 
   return false;
};

DeviceHelper.isIpad = function() {
  var userAgent = navigator.userAgent;
  if( /iPad/i.test(userAgent) ){
    return true;
  }
  return false;
}

module.exports = DeviceHelper;
