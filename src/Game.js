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
    score:0,
    livesLabel:null,
    scoreLabel:null,
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

        this.addTouch();

    },
    addTouch: function () {
        var self = this;
        self.listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            startPosY: 0,
            startPosX: 0,
            onTouchBegan: function (touch, event) {
                this.startPosY = touch.getLocation().y;
                this.startPosX = touch.getLocation().x;
                return true;
            },
            onTouchMoved: function (touch, event) {

            },
            onTouchEnded: function (touch, event) {
                    var deltaY = touch.getLocation().y - this.startPosY;
                    var deltaX = touch.getLocation().x - this.startPosY;
                    var target = event.getCurrentTarget();
                    target.preventTouch(deltaX,deltaY);
            },
            onTouchCancelled: function (touch, event) {

            }
        });
        cc.eventManager.addListener(self.listener, self);
    },
    collisionTouchWall:function(arbiter, space){

        var shapes = arbiter.getShapes();
        var shapeA =  shapes[0];
        var shapeB =  shapes[1];

        var collisionTypeA =  shapeA.collision_type;
        var collisionTypeB =  shapeB.collision_type;

        if(collisionTypeB==SpriteTag.CAT){

          this.score ++;
            this.scoreLabel.setString("Score："+this.score);
        }else if(collisionTypeB==SpriteTag.WALL_BUTTOM){
            CAT.LIVES --;
            this.livesLabel.setString("Lives："+CAT.LIVES );
            if(CAT.LIVES<0){
                this.gameOver();
            }
        }
            this.space.addPostStepCallback(function () {
            var x = CAT.random(this.winSize.width/5,this.winSize.width/5*4);
             var action = cc.moveTo(0.5,cc.p(x,this.goddess.y));
            this.goddess.runAction(action);
            this.ball.removeFromParent(true);
            this.space.removeShape(this.ballShape);
            this.initBall();

        }.bind(this));
        return true;

    },
    gameOver:function(){

        var scene = new cc.Scene();
        var layer = new GameOverLayer(this.score);
        scene.addChild(layer);
        cc.director.runScene(new cc.TransitionFade(1.2, scene));

    },
    preventTouch:function(x,y){
        this.doForceBird(x/this.winSize.width,y/this.winSize.height);
    },
    doForceBird:function(x,y){
        var x1  = CAT.SPEED * 2.5*x;
        var y =  CAT.SPEED * 2.5*y;
        this.cat.getBody().setVel(cp.v(0,0));
        this.cat.getBody().applyImpulse(cp.v(x1,y),cp.v(0,30));
    },

    update:function(dt){
        this.space.step(1/60.0);
    },
    init:function(){
        this.initLives();
        this.initScore();
        this.initGround();
        this.initPhysics();
        this.initCat();
        this.initGoddess();
        this.initBall();
    },
    initLives:function(){
        this.livesLabel =  new cc.LabelTTF("Lives："+CAT.LIVES+"","Arial Black",25);
        this.livesLabel.x =  65;
        this.livesLabel.y = this.winSize.height - 20;
        this.livesLabel.color = cc.color(0,0,0);
        this.addChild(this.livesLabel);
        this.livesLabel.setVisible(true);
    },
    initScore:function(){
        this.scoreLabel =  new cc.LabelTTF("Score："+this.score+"","Arial Black",25);
        this.scoreLabel.x =  this.winSize.width-65;
        this.scoreLabel.y = this.winSize.height - 20;
        this.scoreLabel.color = cc.color(0,0,0);
        this.addChild(this.scoreLabel);
        this.scoreLabel.setVisible(true);
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

        var speed  = 50;
        var d = CAT.random(0,180);
        var x = speed*Math.cos(d*Math.PI/180);
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
        var body = new cp.Body(mass,cp.momentForBox(10, this.cat.width,this.cat.height));
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
