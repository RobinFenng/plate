/**
 * Created by Robin on 14-11-5.
 */
var CAT = {};
CAT.SPEED = 200;
CAT.random = function (x, y) {
    return parseInt(Math.random() * (y - x) + x);
};
if(typeof SpriteTag == "undefined") {
    var SpriteTag = {};
    SpriteTag.BALL = 1;
    SpriteTag.WALL_BUTTOM = 2;
    SpriteTag.WALL_OTHER = 3;
    SpriteTag.CAT = 4;
};
