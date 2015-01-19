define(function(require, exports, module){
  var UIApplication          = require('ui/containers/UIApplication');
  var UIButton               = require('ui/controls/UIButton');
  var UICheckBox             = require('ui/controls/UICheckBox');
  var UIPlayerUI             = require('ui/containers/UIPlayerUI');



  var icons = [ 'ion-ios7-cart','ion-email','ion-heart','ion-trash-a'];
  var text = ['Checkout','Send','Like','Empty'];
  var iconPlacements = ['left','right','top','bottom'];

  var butt = new UIButton();



  var app = new UIApplication({
        children: [
          new UIButton({
            size:[100,40],
            position: [10,20],
            backgroundStyle:{
              background: 'linear-gradient(to bottom, #a9e4f7 0%,#0fb4e7 100%)',
              border:'1px solid #666666',
//              backgroundColor:'red',
              borderRadius: '6px',
              boxShadow:'7px 7px 15px 0px rgba(50, 50, 50, 0.34)'
            },
            labelStyle: {
              color:'#666666'
            }
          }),
          new UICheckBox ({
            size: [100,40],
            position: [10, 60],
            labelStyle: {
              textShadow: '4px 4px 6px rgba(150, 150, 150, 1)'
            }
          }),

          new UIPlayerUI ({
            position:[10,150]
          })
        ]
  });
});
