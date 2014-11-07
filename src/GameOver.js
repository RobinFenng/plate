/**
 * Created by Robin on 14-11-7.
 */
var GameOverLayer = cc.Layer.extend({

    score:0,
    winSize:null,
    ctor:function(score){
        this._super();
        this.score = score;
        this.winSize = cc.winSize;
        var bg = new cc.Sprite(res.bg_png);
        bg.attr({
            anchorX : 0,
            anchorY : 0,
            x : 0,
            y : 0,
            scaleX:this.winSize.width/bg.width,
            scaleY:this.winSize.height/bg.height
        });
        this.addChild(bg);
    },
    onEnter:function(){


    }

});
