/**
 * Created by Robin on 14-11-5.
 */
var MainLayer = cc.Layer.extend({

    //space:null,
    winSize:null,
    groundArray:[],
    cat:null,
    space:null,
    goddess:null,
    ground:null,
    ball:null,
    ballShape :null,
    ctor:function(){
        this._super();
        this.space = new cp.Space();
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
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.jqm_plist);
        cc.textureCache.addImage(res.jqm_png);

        cc.spriteFrameCache.addSpriteFrames(res.godness_plist);
        cc.textureCache.addImage(res.godness_png);

        cc.spriteFrameCache.addSpriteFrames(res.circle_plist);
        cc.textureCache.addImage(res.circle_png);


        cc.animationCache.addAnimations(res.jqm_frame_plist);
        cc.animationCache.addAnimations(res.godness_frame_plist);


        this.scheduleUpdate();
        this.init();

        this.space.addCollisionHandler(SpriteTag.BALL,SpriteTag.CAT,this.collisionTouchWall.bind(this),null,null,null);
        this.space.addCollisionHandler(SpriteTag.BALL,SpriteTag.WALL_BUTTOM,this.collisionTouchWall.bind(this),null,null,null);


        cc.eventManager.addListener({
            event:cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan:function(touches,event){
                var target = event.getCurrentTarget();
                target.preventTouch(touches[0]);
            }
        },this);


    },
    collisionTouchWall:function(arbiter, space){

        this.space.addPostStepCallback(function () {
            this.ball.removeFromParent(true);
            this.space.removeShape(this.ballShape);

            this.initBall();

        }.bind(this));
        return true;

    },

    preventTouch:function(event){

        var catPos = this.cat.getPosition();
        var location = event.getLocation();
        var x = catPos.x - location.x;
        var y = catPos.y - location.y;
        this.doForceBird(x/this.winSize.width*2+y/this.winSize.height,1);
    },
    doForceBird:function(x,y){
        var x1 = x*CAT.SPEED *Math.cos(45*Math.PI/180)*2.5;
        var y =  CAT.SPEED * 2.5*y;
        this.cat.getBody().setVel(cp.v(0,0));
        this.cat.getBody().applyImpulse(cp.v(x1,y),cp.v(0,30));
    },

    update:function(dt){
        this.space.step(1/60.0);
    },
    init:function(){
        this.initGround();
        this.initPhysics();
        this.initCat();
        this.initGoddess();
        this.initBall();
    },
    initBall:function(){

        var key = CAT.random(0,14);
        this.ball=  new cc.PhysicsSprite("#"+key+".png");
        var mass = 0.1;
        var body = new cp.Body(mass,cp.momentForCircle(mass, 0, this.ball.width/2, cp.v(0,0)));
        body.setPos(cc.p(this.goddess.x,this.goddess.y));
        this.space.addBody(body);

        var circle =  this.space.addShape(new cp.CircleShape(body, 8, cp.v(0, 0)));
        circle.setElasticity(0.8);
        circle.setFriction(1);
        circle.setCollisionType(SpriteTag.BALL);

        this.ballShape  = circle;
        this.ball.setBody(body);
        this.addChild(this.ball);

        var speed  = 100;
        var x = speed*Math.cos(45*Math.PI/180);
        var y =  false*speed * Math.sin(60*Math.PI/180);
        this.ball.getBody().setVel(cp.v(0,0));
        this.ball.getBody().applyImpulse(cp.v(x,y),cp.v(0,0));

    },
    initGoddess:function(){
        this.goddess = new cc.Sprite("#godness_0_0");
        this.goddess.attr({
            x:this.winSize.width/2,
            y:this.winSize.height/4*3+100,
            scaleX : 2,
            scaleY : 2
        });
        this.addChild(this.goddess);

//        var actionFrame = new cc.Animate(cc.animationCache.getAnimation("flygodness"));
//        var flyAction = new cc.Repeat(actionFrame, 90000);
//        this.goddess.runAction(new cc.Sequence(flyAction));
    },
    initPhysics:function(){

        var space = this.space;
        space.gravity = cp.v(0, -980);
        var staticBody = space.staticBody;
        space.sleepTimeThreshold = 0.5;
        space.collisionSlop = 0.5;
        var walls = [
            new cp.SegmentShape( staticBody, cp.v(0,this.winSize.height-24), cp.v(this.winSize.width,this.winSize.height-24), 0 ),//top
            new cp.SegmentShape( staticBody, cp.v(0,83), cp.v(this.winSize.width,83), 0 ),// bottom
            new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(0,this.winSize.height), 0),				// left
            new cp.SegmentShape( staticBody, cp.v(this.winSize.width,0), cp.v(this.winSize.width,this.winSize.height), 0)	// right
        ];


        for( var i=0; i < walls.length; i++ ) {
            var shape = walls[i];
            shape.setElasticity(1);         //弹性
            shape.setFriction(2);           //摩擦
            space.addShape( shape );
            if(i==1){
                shape.setCollisionType(SpriteTag.WALL_BUTTOM);
            }else{
                shape.setCollisionType(SpriteTag.WALL_OTHER);
            }
        }

    },
    initCat:function(){

        this.cat =  new cc.PhysicsSprite("#jqm_3_0");
        var mass = 1;
        var body = new cp.Body(mass,cp.momentForBox(mass, this.cat.width,this.cat.height));
        body.setPos(cc.p(this.winSize.width/2,this.winSize.height/2));
        this.space.addBody(body);
        var shape = new cp.BoxShape(body,this.cat.width,this.cat.height);
        shape.setElasticity(0);
        shape.setFriction(0);
        shape.setCollisionType(SpriteTag.CAT);

        this.space.addShape(shape);
        this.cat.setBody(body);
        this.cat.x = this.winSize.width/4*1;
        this.cat.y =  this.ground.height+this.cat.height/2+10;
        this.cat.scaleX = 2;
        this.cat.scaleY = 2;
        this.addChild(this.cat);


        var actionFrame = new cc.Animate(cc.animationCache.getAnimation("fly"));
        var flyAction = new cc.Repeat(actionFrame, 90000);
        this.cat.runAction(new cc.Sequence(flyAction));

    },
    initGround:function(){
        this.ground  =  new cc.Sprite(res.ground_png);
        this.ground.setAnchorPoint(cc.p(0, 0));
        this.ground.setScaleX(this.winSize.width/this.ground.width);
        this.addChild(this.ground);
    }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MainLayer();
        this.addChild(layer);
    }
});
