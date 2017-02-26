/* global Phaser RemotePlayer io */

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update, render:render})

var socket; // Socket connection
var currentTime;
var lastTime;
var gameStartTime;
var myName;
var rescuedScore=0;
var killedScore=0;
var myPlayerPos=[0.0,0.0];
var enemyPlayerPos=[0.0,0.0];
var myNametext;
var enemyNametext;
var gamelength=120; //seconds
var pickDelay=1000;
var speed=100
var swordSound;
var deathSound;
var rescueSound;
var ropeSound;
var compasspoints = {
    UP:5,
    UPRIGHT:15,
    RIGHT:10,
    DOWNRIGHT:20,
    DOWN:0,
    DOWNLEFT:35,
    LEFT:25,
    UPLEFT:30
    
}
var rescuerPlayingAnimation=false
var piratePlayingAnimation=false
var rescuerFacing=compasspoints.DOWN
var pirateFacing=compasspoints.DOWN
var buttonsPressed =  {
    "up":false,
    "right":false,
    "left":false,
    "down":false,
    "space":false
}
var myPlayerMoves = {
        "up":false,
        "left":false,
        "right":false,
        "down":false
}
var enemyPlayerMoves = {
    "up":false,
    "left":false,
    "right":false,
    "down":false
}
var style = { font: "16px Helvetica", fill: "#11BB11", align: "center",stroke: 'black',strokeThickness:2};

var myPosition;
var partnerPosition;
var inGame = false;
var controlKeys;
var ukkelis=[]
var group;
var rescuerEmptyTick=null
var pirateEmptyTick=null
var waves;
var wind;

function preload () {
    //Load assets and sounds
    game.load.image('background', 'assets/tausta10.png');
    game.load.image('wave', 'assets/wave_sprite6.png');
    game.load.image("healicon", 'assets/pelastaja_icon3.png')
    game.load.image("pirateicon", 'assets/pirateicon.png')
    game.load.spritesheet('shipsaver','assets/rescuersheet.png', 105, 108, 40);
    game.load.spritesheet('shippirate','assets/piratesheet.png', 105, 108, 40);
    game.load.spritesheet('swimmer', 'assets/swimmer_sprite10.png', 50, 41);
    game.load.spritesheet('swimmer2', 'assets/swimmer2_sprite.png', 50, 41);
    game.load.spritesheet('swimmer3', 'assets/swimmer3_sprite.png', 50, 41);
    game.load.audio('wind', 'sounds/strong_wind.mp3');
    game.load.audio("happymusic", 'sounds/backgroundmusic.mp3')
    game.load.audio('cheer', 'sounds/cheer_uusi.mp3');
    game.load.audio('dying', 'sounds/man_dying_uusi.mp3');
    game.load.audio('rope', 'sounds/rope_pull.mp3');
    game.load.audio('sword', 'sounds/sword_uusi.mp3');

    game.stage.disableVisibilityChange = true;
}


function create () {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0, 0, 'background');
    //Page is loaded, creating connection to the server
    socket = io.connect()
    
    this.waves = this.add.physicsGroup();

    var wave1 = new CloudPlatform(game, 0, -150, 'wave', this.waves);
    wave1.addMotionPath([
        { x: "-1396", xSpeed: 40000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);
    var wave1_loop = new CloudPlatform(game, 1396, -150, 'wave', this.waves);
    wave1_loop.addMotionPath([
        { x: "-1396", xSpeed: 40000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);

    var wave2 = new CloudPlatform(game, -100, -75, 'wave', this.waves);
    wave2.addMotionPath([
        { x: "1396", xSpeed: 39000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);
    var wave2_loop = new CloudPlatform(game, -1496, -75, 'wave', this.waves);
    wave2_loop.addMotionPath([
        { x: "1396", xSpeed: 39000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);

    var wave3 = new CloudPlatform(game, -75, -5, 'wave', this.waves);
    wave3.addMotionPath([
        { x: "-1396", xSpeed: 38000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);
    var wave3_loop = new CloudPlatform(game, 1321, -5, 'wave', this.waves);
    wave3_loop.addMotionPath([
        { x: "-1396", xSpeed: 38000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);

    var wave4 = new CloudPlatform(game, -130, 65, 'wave', this.waves);
    wave4.addMotionPath([
        { x: "1396", xSpeed: 37000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);
    var wave4_loop = new CloudPlatform(game, -1526, 65, 'wave', this.waves);
    wave4_loop.addMotionPath([
        { x: "1396", xSpeed: 37000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);

    var wave5 = new CloudPlatform(game, -20, 110, 'wave', this.waves);
    wave5.addMotionPath([
        { x: "-1396", xSpeed: 36000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);
    var wave5_loop = new CloudPlatform(game, 1376, 110, 'wave', this.waves);
    wave5_loop.addMotionPath([
        { x: "-1396", xSpeed: 36000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);

    var wave6 = new CloudPlatform(game, 0, 175, 'wave', this.waves);
    wave6.addMotionPath([
        { x: "1396", xSpeed: 35000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);
    var wave6_loop = new CloudPlatform(game, -1396, 175, 'wave', this.waves);
    wave6_loop.addMotionPath([
        { x: "1396", xSpeed: 35000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);

    var wave7 = new CloudPlatform(game, -46, 260, 'wave', this.waves);
    wave7.addMotionPath([
        { x: "-1396", xSpeed: 34000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);
    var wave7_loop = new CloudPlatform(game, 1350, 260, 'wave', this.waves);
    wave7_loop.addMotionPath([
        { x: "-1396", xSpeed: 34000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);

    var wave8 = new CloudPlatform(game, -80, 344, 'wave', this.waves);
    wave8.addMotionPath([
        { x: "1396", xSpeed: 33000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);
    var wave8_loop = new CloudPlatform(game, -1476, 344, 'wave', this.waves);
    wave8_loop.addMotionPath([
        { x: "1396", xSpeed: 33000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);

    var wave9 = new CloudPlatform(game, 0, 420, 'wave', this.waves);
    wave9.addMotionPath([
        { x: "-1396", xSpeed: 32000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);
    var wave9_loop = new CloudPlatform(game, 1396, 420, 'wave', this.waves);
    wave9_loop.addMotionPath([
        { x: "-1396", xSpeed: 32000, xEase: "Linear", y: "0", ySpeed: 2000, yEase: "Linear" }
    ]);

    this.waves.callAll('start');
    
    game.time.advancedTiming=true;
    
    group = game.add.group();
    
    rescuerImg = group.create(200,200,'shipsaver');
    
    rescuerImg.animations.add('down_left', [1, 2], 2, true);
    rescuerImg.animations.add('down_right', [3, 4], 2, true);

    rescuerImg.animations.add('up_left', [6, 7], 2, true);
    rescuerImg.animations.add('up_right', [8, 9], 2, true);

    rescuerImg.animations.add('right_up', [11, 12], 2, true);
    rescuerImg.animations.add('right_down', [13, 14], 2, true);

    rescuerImg.animations.add('upright_down', [16, 17], 2, true);
    rescuerImg.animations.add('upright_up', [18, 19], 2, true);

    rescuerImg.animations.add('downright_up', [21, 22], 2, true);
    rescuerImg.animations.add('downright_down', [23, 24], 2, true);

    rescuerImg.animations.add('left_up', [26, 27], 2, true);
    rescuerImg.animations.add('left_down', [28, 29], 2, true);

    rescuerImg.animations.add('upleft_up', [31, 32], 2, true);
    rescuerImg.animations.add('upleft_down', [33, 34], 2, true);

    rescuerImg.animations.add('downleft_up', [36, 37], 2, true);
    rescuerImg.animations.add('downleft_down', [38, 39], 2, true);

    pirateImg = group.create(400,400,'shippirate');
    pirateImg.animations.add('down_left', [1, 2], 2, true);
    pirateImg.animations.add('down_right', [3, 4], 2, true);

    pirateImg.animations.add('up_left', [6, 7], 2, true);
    pirateImg.animations.add('up_right', [8, 9], 2, true);

    pirateImg.animations.add('right_up', [11, 12], 2, true);
    pirateImg.animations.add('right_down', [13, 14], 2, true);

    pirateImg.animations.add('upright_up', [16, 17], 2, true);
    pirateImg.animations.add('upright_down', [18, 19], 2, true);

    pirateImg.animations.add('downright_up', [21, 22], 2, true);
    pirateImg.animations.add('downright_down', [23, 24], 2, true);

    pirateImg.animations.add('left_up', [26, 27], 2, true);
    pirateImg.animations.add('left_down', [28, 29], 2, true);

    pirateImg.animations.add('upleft_up', [31, 32], 2, true);
    pirateImg.animations.add('upleft_down', [33, 34], 2, true);

    pirateImg.animations.add('downleft_up', [36, 37], 2, true);
    pirateImg.animations.add('downleft_down', [38, 39], 2, true);
    //swimmer = game.add.sprite(100, 400, 'swimmer');
    //swimmer.animations.add('struggle', [0, 1, 2, 3], 5, true);
    //swimmer.animations.play('struggle');
    //game.add.tileSprite(0,0, 800, 600, "background");
    healIcon = game.add.sprite(-200,-200,'healicon')
    pirateIcon = game.add.sprite(-200,-200,'pirateicon')
    wind = game.add.audio('wind', 0.1, true); // Key, volume, loop
    wind.play();
    backgroundMusic = game.add.audio("happymusic",0.8, true)
    backgroundMusic.play()
    swordSound = game.add.audio("sword")
    deathSound  = game.add.audio("dying")
    rescueSound = game.add.audio("cheer")
    ropeSound = game.add.audio("rope")
    // Start listening for events
    setEventHandlers()
}
function render() {
    game.debug.text(game.time.fps, 2, 14, "#00ff00")
}
var setEventHandlers = function () {
  // Socket connection successful
  socket.on('connect', onSocketConnected)

  // Socket disconnection
  socket.on('disconnect', onSocketDisconnect)

  // Player move message received
  
  socket.on('move player', onMovePlayer)
  
  socket.on('no players', noPlayersYet)
  
  socket.on('match started', onMatchStarted)
  
  socket.on('new ukkeli', onNewUkkeli)
  
  socket.on('pick ukkeli', onPickUkkeli)
  
  socket.on('gameover', onGameover)
  
  socket.on("movechange", onMoveChange)
  
  socket.on("empty pick", onEmptyPick)
  
}
function onEmptyPick(data) {
    if (data.pos==0) {
        ropeSound.play()
        rescuerPlayingAnimation=true
        rescuerEmptyTick=currentTime+pickDelay
        if (rescuerFacing==compasspoints.RIGHT) {
            rescuerImg.animations.play('right_down');
        }
        else if (rescuerFacing==compasspoints.LEFT) {
            rescuerImg.animations.play('left_up');
        }
        else if (rescuerFacing==compasspoints.UP) {
            rescuerImg.animations.play('up_left');
        }
        else if (rescuerFacing==compasspoints.DOWN) {
            rescuerImg.animations.play('down_right');
        }
        else if (rescuerFacing==compasspoints.UPRIGHT) {
            rescuerImg.animations.play('upright_down');
        }
        else if (rescuerFacing==compasspoints.UPLEFT) {
            rescuerImg.animations.play('upleft_down');
        }
        else if (rescuerFacing==compasspoints.DOWNRIGHT) {
            rescuerImg.animations.play('downright_down');
        }
        else if (rescuerFacing==compasspoints.DOWNLEFT) {
            rescuerImg.animations.play('downleft_up');
        }
    }
    else {
        swordSound.play()
        piratePlayingAnimation=true
        pirateEmptyTick=currentTime+pickDelay
        if (pirateFacing==compasspoints.RIGHT) {
            pirateImg.animations.play('right_down');
        }
        else if (pirateFacing==compasspoints.LEFT) {
            pirateImg.animations.play('left_up');
        }
        else if (pirateFacing==compasspoints.UP) {
            pirateImg.animations.play('up_left');
        }
        else if (pirateFacing==compasspoints.DOWN) {
            pirateImg.animations.play('down_right');
        }
        else if (pirateFacing==compasspoints.UPRIGHT) {
            pirateImg.animations.play('upright_down');
        }
        else if (pirateFacing==compasspoints.UPLEFT) {
            pirateImg.animations.play('upleft_down');
        }
        else if (pirateFacing==compasspoints.DOWNRIGHT) {
            pirateImg.animations.play('downright_down');
        }
        else if (pirateFacing==compasspoints.DOWNLEFT) {
            pirateImg.animations.play('downleft_up');
        }
    }
}
function onMoveChange(data) {
    if (data.pos==myPosition) {
        myPlayerMoves=data.moves
        
    }
    else
        enemyPlayerMoves=data.moves
    if (data.pos==0) {
        if (data.moves.up && data.moves.left)
            rescuerFacing=compasspoints.UPLEFT
        else if(data.moves.up && data.moves.right)
            rescuerFacing=compasspoints.UPRIGHT
        else if (data.moves.up)
            rescuerFacing=compasspoints.UP
        else if(data.moves.down && data.moves.left)
            rescuerFacing=compasspoints.DOWNLEFT
        else if(data.moves.down && data.moves.right)
            rescuerFacing=compasspoints.DOWNRIGHT
        else if(data.moves.left)
            rescuerFacing=compasspoints.LEFT
        else if(data.moves.right)
            rescuerFacing=compasspoints.RIGHT
        else if(data.moves.down)
            rescuerFacing=compasspoints.DOWN
    }
    else {
        if (data.moves.up && data.moves.left)
            pirateFacing=compasspoints.UPLEFT
        else if(data.moves.up && data.moves.right)
            pirateFacing=compasspoints.UPRIGHT
        else if (data.moves.up)
            pirateFacing=compasspoints.UP
        else if(data.moves.down && data.moves.left)
            pirateFacing=compasspoints.DOWNLEFT
        else if(data.moves.down && data.moves.right)
            pirateFacing=compasspoints.DOWNRIGHT
        else if(data.moves.left)
            pirateFacing=compasspoints.LEFT
        else if(data.moves.right)
            pirateFacing=compasspoints.RIGHT
        else if(data.moves.down)
            pirateFacing=compasspoints.DOWN
    }
}
function onGameover(data) {
    //splash.play();
    inGame=false;
    //babies[0][0].frame=1;
    //player1.animations.stop();
    //player2.animations.stop();
    switch(data.reason) {
        case 0:
            $('.info').text('WTF?! ' + partnerName + ' has left the game! Rescued: ' + rescuedScore + ". Killed: " + killedScore);
            break;
        case 1:
            var winText;
            if (rescuedScore>killedScore) {
                if (myPosition==0)
                    winText="YOU WON :DD"
                else
                    winText="YOU LOST ;__;"
            }
            else if(rescuedScore==killedScore) {
                winText="EVEN!"
            }
            else {
                if (myPosition==1)
                    winText="YOU WON :DD"
                else
                    winText="YOU LOST ;__;"
            }
            $('.info').text('Time has ran out! Rescued: ' + rescuedScore + ". Killed: " + killedScore+" "+winText);
            break;
        
    }
    $('.playAgain').css('visibility','visible');
    
}

// Socket connected
function onSocketConnected () {
  console.log('Connected to socket server')
}

// Socket disconnected
function onSocketDisconnect () {
    $('.info').text("Connection has been lost! Try to press F5 for bacon.");
    inGame=false;
}
function onMovePlayer (data) {
    if (Math.abs(myPlayerPos[0]-data.myPOS[0])>5 || Math.abs(myPlayerPos[1]-data.myPOS[1])>5) {
        myPlayerPos = data.myPOS
    }
    if (Math.abs(enemyPlayerPos[0]-data.enemyPOS[0])>5 || Math.abs(enemyPlayerPos[1]-data.enemyPOS[1])>5) {
        enemyPlayerPos = data.enemyPOS
    }
}
function onPickUkkeli(data) {
    //TODO ANIMAATIO
    ukkeliIndex=getUkkeliIndex(data.id)
    ukkelis[ukkeliIndex].pickTick=currentTime+pickDelay
    ukkelis[ukkeliIndex].rescued=data.rescued
    //ukkelis[ukkeliIndex].img.destroy()
    //ukkelis.splice(ukkeliIndex,1)
    if (data.rescued) {
        ropeSound.play()
        rescuerPlayingAnimation=true
        rescuedScore+=1
        $('#rescuedscore').text("Rescued: " + rescuedScore);
        var rescuerPosition;
        if (myPosition==0)
            rescuerPosition=myPlayerPos
        else
            rescuerPosition=enemyPlayerPos
        if (rescuerFacing==compasspoints.RIGHT) {
            if (ukkelis[ukkeliIndex].y>rescuerPosition[1])
                rescuerImg.animations.play('right_down');
            else
                rescuerImg.animations.play('right_up');
        }
        else if (rescuerFacing==compasspoints.LEFT) {
            if (ukkelis[ukkeliIndex].y>rescuerPosition[1])
                rescuerImg.animations.play('left_down');
            else
                rescuerImg.animations.play('left_up');
        }
        else if (rescuerFacing==compasspoints.UP) {
            if (ukkelis[ukkeliIndex].x>rescuerPosition[0])
                rescuerImg.animations.play('up_right');
            else
                rescuerImg.animations.play('up_left');
        }
        else if (rescuerFacing==compasspoints.DOWN) {
            if (ukkelis[ukkeliIndex].x<rescuerPosition[0])
                rescuerImg.animations.play('down_left');
            else
                rescuerImg.animations.play('down_right');
        }
        else if (rescuerFacing==compasspoints.UPRIGHT) {
            if (ukkelis[ukkeliIndex].y<rescuerPosition[1])
                rescuerImg.animations.play('upright_up');
            else
                rescuerImg.animations.play('upright_down');
        }
        else if (rescuerFacing==compasspoints.UPLEFT) {
            if (ukkelis[ukkeliIndex].y<rescuerPosition[1])
                rescuerImg.animations.play('upleft_up');
            else
                rescuerImg.animations.play('upleft_down');
        }
        else if (rescuerFacing==compasspoints.DOWNRIGHT) {
            if (ukkelis[ukkeliIndex].x>rescuerPosition[0])
                rescuerImg.animations.play('downright_up');
            else
                rescuerImg.animations.play('downright_down');
        }
        else if (rescuerFacing==compasspoints.DOWNLEFT) {
            if (ukkelis[ukkeliIndex].x>rescuerPosition[0])
                rescuerImg.animations.play('downleft_down');
            else
                rescuerImg.animations.play('downleft_up');
        }
    }
    else {
        swordSound.play()
        killedScore+=1//
        $('#killedscore').text("Killed: " + killedScore);
        piratePlayingAnimation=true
        var piratePosition;
        if (myPosition==0)
            piratePosition=enemyPlayerPos
        else
            piratePosition=myPlayerPos
        if (pirateFacing==compasspoints.RIGHT) {
            if (ukkelis[ukkeliIndex].y>piratePosition[1])
                pirateImg.animations.play('right_down');
            else
                pirateImg.animations.play('right_up');
        }
        else if (pirateFacing==compasspoints.LEFT) {
            if (ukkelis[ukkeliIndex].y>piratePosition[1])
                pirateImg.animations.play('left_down');
            else
                pirateImg.animations.play('left_up');
        }
        else if (pirateFacing==compasspoints.UP) {
            if (ukkelis[ukkeliIndex].x>piratePosition[0])
                pirateImg.animations.play('up_right');
            else
                pirateImg.animations.play('up_left');
        }
        else if (pirateFacing==compasspoints.DOWN) {
            if (ukkelis[ukkeliIndex].x<piratePosition[0])
                pirateImg.animations.play('down_left');
            else
                pirateImg.animations.play('down_right');
        }
        else if (pirateFacing==compasspoints.UPRIGHT) {
            if (ukkelis[ukkeliIndex].y<piratePosition[1])
                pirateImg.animations.play('upright_up');
            else
                pirateImg.animations.play('upright_down');
        }
        else if (pirateFacing==compasspoints.UPLEFT) {
            if (ukkelis[ukkeliIndex].y<piratePosition[1])
                pirateImg.animations.play('upleft_up');
            else
                pirateImg.animations.play('upleft_down');
        }
        else if (pirateFacing==compasspoints.DOWNRIGHT) {
            if (ukkelis[ukkeliIndex].x>piratePosition[0])
                pirateImg.animations.play('downright_up');
            else
                pirateImg.animations.play('downright_down');
        }
        else if (pirateFacing==compasspoints.DOWNLEFT) {
            if (ukkelis[ukkeliIndex].x>piratePosition[0])
                pirateImg.animations.play('downleft_down');
            else
                pirateImg.animations.play('downleft_up');
        }
    }
    group.sort()
}
function onNewUkkeli(data) {
    var randInt=getRandomInt(0,2);
    if (randInt==0)
        ukkeliSprite = group.create(data.x-25,data.y-20,'swimmer')
    else if(randInt==1)
        ukkeliSprite = group.create(data.x-25,data.y-20,'swimmer2')
    else
        ukkeliSprite = group.create(data.x-25,data.y-20,'swimmer3')
    ukkeliSprite.animations.add('struggle', [0, 1, 2, 3], 5, true);
    ukkeliSprite.animations.play('struggle');
    ukkelis.push({x:data.x,y:data.y,id:data.id, img: ukkeliSprite, beingPicked:false, pickDelay:null})
    group.sort()
}
function onMatchStarted(data) {
    $('.info').text('');
    controlKeys;
    controlKeys = { 
        up : game.input.keyboard.addKey(Phaser.Keyboard.W),
		left: game.input.keyboard.addKey(Phaser.Keyboard.A),
		right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        down : game.input.keyboard.addKey(Phaser.Keyboard.S),
        space : game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    };

    currentTime=0
    rescuedScore=0
    killedScore=0
    
    
    inGame = true;
    gameStartTime = (new Date).getTime();
    $('.scoretablehere').html('');
    
    $('.playAgain').css('visibility','hidden');
    
    $('.highscores').css('visibility','hidden');
    //TODO
    //$('.score').css('visibility','visible');
    //$('.score').text("Score: " + score);
    
    partnerName = data.otherPlayerName
    myPosition=data.playerPos
    myPlayerPos = data.myPlayerPos
    enemyPlayerPos = data.enemyPlayerPos
    if (myPosition==0) {
        partnerPosition=1
        myNametext=game.add.text(myPlayerPos[0]+105/2,myPlayerPos[1]-100,myName,style);
        enemyNametext=game.add.text(enemyPlayerPos[0]+105/2,enemyPlayerPos[1]-100,partnerName,style);
    }
    else {
        partnerPosition=0
        enemyNametext=game.add.text(enemyPlayerPos[0]+105/2,enemyPlayerPos[1]-100,partnerName,style);
        myNametext=game.add.text(myPlayerPos[0]+105/2,myPlayerPos[1]-100,myName,style);
    }
    myNametext.anchor.set(0.5)
    enemyNametext.anchor.set(0.5)
}
function toMMSS (secs1){
    var secs = Math.round(secs1)
    var minutes = Math.floor(secs / 60);
    var seconds = secs - (minutes * 60);

    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes.toString()+':'+seconds.toString();
}
function playAgain() {
    myNametext.destroy();
    enemyNametext.destroy();
    //$('.scores').text()
    $('.playAgain').css('visibility','hidden');
    //$('.scoretablehere').html('');
    //$('.highscores').css('visibility','hidden');
    
    for (var i=0;i<ukkelis.length;i++) {
        ukkelis[i].img.destroy();
    }
    ukkelis.length=0
    socket.emit('restart', {});
}
function sendName(name) {
    myName = name;
    $('.nameField').remove();
    $('.sendName').remove();
    socket.emit('new name', {name: name});
}
function noPlayersYet() {
    $('.info').text("Waiting for another player to join...");
}
function tryToPick(ukkeliID) {
    socket.emit("pick ukkeli", {id:ukkeliID})
}
function getUkkeliIndex(ukkeliID) {
    for (var i=0;i<ukkelis.length;i++) {
        if (ukkelis[i].id==ukkeliID) return i
    }
    return null
}
function checkIfUkkeliClose() {
    for (var i=0;i<ukkelis.length;i++) {
        var charFacing;
        if (myPosition==0)
            charFacing=rescuerFacing
        else
            charFacing=pirateFacing
        if (charFacing==compasspoints.RIGHT || charFacing == compasspoints.LEFT) {
            if (Math.abs(myPlayerPos[1]-ukkelis[i].y)<80 && Math.abs(myPlayerPos[1]-ukkelis[i].y)>20 && Math.abs(myPlayerPos[0]-ukkelis[i].x)<32)
                return ukkelis[i].id
            }
        else if (charFacing==compasspoints.UP || charFacing == compasspoints.DOWN) {
            if (Math.abs(myPlayerPos[0]-ukkelis[i].x)<80 && Math.abs(myPlayerPos[0]-ukkelis[i].x)>20 && Math.abs(myPlayerPos[1]-ukkelis[i].y)<32)
                return ukkelis[i].id
        }
        else if (charFacing == compasspoints.UPRIGHT || charFacing == compasspoints.DOWNLEFT) {
            if ((myPlayerPos[0]-ukkelis[i].x<50 && myPlayerPos[0]-ukkelis[i].x>0 && myPlayerPos[1]-ukkelis[i].y<50 && myPlayerPos[1]-ukkelis[i].y>0) || (ukkelis[i].x-myPlayerPos[0]<50 && ukkelis[i].y-myPlayerPos[1] < 50 && ukkelis[i].y-myPlayerPos[1]>0 && ukkelis[i].x - myPlayerPos[0]>0))
                return ukkelis[i].id
        }
        else if (charFacing == compasspoints.UPLEFT || charFacing == compasspoints.DOWNRIGHT) {
            if ((myPlayerPos[0]-ukkelis[i].x<50 && ukkelis[i].y-myPlayerPos[1]<50 && myPlayerPos[0]-ukkelis[i].x>0 && ukkelis[i].y-myPlayerPos[1]>0) || (ukkelis[i].x-myPlayerPos[0]<50 && myPlayerPos[1] - ukkelis[i].y < 50 && ukkelis[i].x - myPlayerPos[0] > 0 && myPlayerPos[1]-ukkelis[i].y >0))
                return ukkelis[i].id
        }
        //if (((Math.abs(myPlayerPos[0]-ukkelis[i].x)<64 && Math.abs(myPlayerPos[0]-ukkelis[i].x)>32 && Math.abs(myPlayerPos[1]-ukkelis[i].y)<64 ) || (Math.abs(myPlayerPos[1]-ukkelis[i].y)<64 && Math.abs(myPlayerPos[1]-ukkelis[i].y)>32 && Math.abs(myPlayerPos[0]-ukkelis[i].x)<64))&& !ukkelis[i].beingPicked) {
        //    return ukkelis[i].id
        //}
    }
    return null
}
function getPosMove(moves) {
    horizontal=0;
    vertical=0;
    if (moves.left)
        horizontal-=1
    if (moves.right)
        horizontal+=1
    if (moves.up)
        vertical-=1
    if (moves.down)
        vertical+=1
    if (horizontal && vertical) {
        horizontal = Math.sqrt(2) / (horizontal*2)
        vertical = Math.sqrt(2) / (vertical*2)
    }
    return [horizontal, vertical]
}
CloudPlatform = function (game, x, y, key, group) {

    if (typeof group === 'undefined') { group = game.world; }

    Phaser.Sprite.call(this, game, x, y, key);

    game.physics.arcade.enable(this);

    this.anchor.x = 0.5;

    this.body.customSeparateX = true;
    this.body.customSeparateY = true;
    this.body.allowGravity = false;
    this.body.immovable = true;

    this.playerLocked = false;

    group.add(this);

};

CloudPlatform.prototype = Object.create(Phaser.Sprite.prototype);
CloudPlatform.prototype.constructor = CloudPlatform;

CloudPlatform.prototype.addMotionPath = function (motionPath) {

    this.tweenX = this.game.add.tween(this.body);
    this.tweenY = this.game.add.tween(this.body);

    //  motionPath is an array containing objects with this structure
    //  [
    //   { x: "+200", xSpeed: 2000, xEase: "Linear", y: "-200", ySpeed: 2000, yEase: "Sine.easeIn" }
    //  ]

    for (var i = 0; i < motionPath.length; i++)
    {
        this.tweenX.to( { x: motionPath[i].x }, motionPath[i].xSpeed, motionPath[i].xEase);
        this.tweenY.to( { y: motionPath[i].y }, motionPath[i].ySpeed, motionPath[i].yEase);
    }

    this.tweenX.loop();
    this.tweenY.loop();

};

CloudPlatform.prototype.start = function () {

    this.tweenX.start();
    this.tweenY.start();
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function update () {
    if (inGame) {
        sendMoves = []
        sendStops = []
        currentTime = (new Date).getTime()-gameStartTime;
        $("#timer").text(toMMSS(gamelength-currentTime/1000))
        
        for (var i=ukkelis.length-1;i>=0;i--) {
            if (ukkelis[i].pickTick!=null && ukkelis[i].pickTick<currentTime) {
                if (ukkelis[i].rescued) {
                    rescueSound.play()
                    rescuerPlayingAnimation=false
                    rescuerImg.animations.stop();
                }
                else {
                    deathSound.play()
                    piratePlayingAnimation=false
                    pirateImg.animations.stop()
                }
                ukkelis[i].img.destroy()
                ukkelis.splice(i,1)
            }
        }
        if (rescuerEmptyTick!=null && rescuerEmptyTick<currentTime) {
            rescuerPlayingAnimation=false
            rescuerImg.animations.stop();
            rescuerEmptyTick=null
        }
        if (pirateEmptyTick!=null && pirateEmptyTick<currentTime) {
            piratePlayingAnimation=false
            pirateImg.animations.stop();
            pirateEmptyTick=null
        }
            //ukkelis[ukkeliIndex].img.destroy()
    //ukkelis.splice(ukkeliIndex,1)
        
        if (controlKeys.down.isDown && !buttonsPressed["down"]) {
            sendMoves.push("down")
            buttonsPressed["down"]=true;
        }
        else if (!controlKeys.down.isDown && buttonsPressed["down"]) {
            buttonsPressed["down"]=false;
            sendStops.push("down")
        }
        if (controlKeys.left.isDown && !buttonsPressed["left"]) {
            sendMoves.push("left")
            buttonsPressed["left"]=true;
        }
        else if (!controlKeys.left.isDown && buttonsPressed["left"]) {
            buttonsPressed["left"]=false;
            sendStops.push("left")
        }
        if (controlKeys.right.isDown && !buttonsPressed["right"]) {
            sendMoves.push("right")
            buttonsPressed["right"]=true;
        }
        else if (!controlKeys.right.isDown && buttonsPressed["right"]) {
            buttonsPressed["right"]=false;
            sendStops.push("right")
        }
        if (controlKeys.up.isDown && !buttonsPressed["up"]) {
            sendMoves.push("up")
            buttonsPressed["up"]=true;
        }
        else if (!controlKeys.up.isDown && buttonsPressed["up"]) {
            buttonsPressed["up"]=false;
            sendStops.push("up")
        }
        if(controlKeys.space.isDown && !buttonsPressed["space"]) {
            var ukkeliID = checkIfUkkeliClose()
            //if (ukkeliID != null) {
            tryToPick(ukkeliID)
            //}
            buttonsPressed["space"]=true
        }
        else if (!controlKeys.space.isDown && buttonsPressed["space"]) {
            buttonsPressed["space"]=false
        }
        if (!rescuerPlayingAnimation)
            rescuerImg.frame=rescuerFacing;
        if (!piratePlayingAnimation)
            pirateImg.frame=pirateFacing;
        var iCanMove=true
        var enemyCanMove=true
        if ((myPosition==0 && rescuerPlayingAnimation) || (myPosition==1 && piratePlayingAnimation))
            iCanMove=false
        if ((myPosition==1 && rescuerPlayingAnimation) || (myPosition==0 && piratePlayingAnimation))
            enemyCanMove=false
        if (iCanMove) {
            myMoves = getPosMove(myPlayerMoves)
            myPlayerPos[0] +=  myMoves[0]*speed*(game.time.physicsElapsed)
            myPlayerPos[1] +=  myMoves[1]*speed*(game.time.physicsElapsed)
        }
        if (enemyCanMove) {
            enemyMoves = getPosMove(enemyPlayerMoves)
            enemyPlayerPos[0] +=  enemyMoves[0]*speed*(game.time.physicsElapsed)
            enemyPlayerPos[1] +=  enemyMoves[1]*speed*(game.time.physicsElapsed)
        }
        myCurrPos=[Math.round(myPlayerPos[0]), Math.round(myPlayerPos[1])]
        enemyCurrPos = [Math.round(enemyPlayerPos[0]),Math.round(enemyPlayerPos[1])]
        var widthCorr = Math.round(105/2)
        myNametext.x=myCurrPos[0]
        myNametext.y=myCurrPos[1]-116/2
        enemyNametext.x=enemyCurrPos[0]
        enemyNametext.y=enemyCurrPos[1]-115/2
        if (myPosition==0) {
            rescuerImg.x = myCurrPos[0]-widthCorr
            rescuerImg.y=myCurrPos[1]-108/2
            pirateImg.x=enemyCurrPos[0]-widthCorr
            pirateImg.y=enemyCurrPos[1]-108/2
            healIcon.x=myNametext.x+myNametext.width/2
            healIcon.y=myNametext.y-10
            pirateIcon.x=enemyNametext.x+enemyNametext.width/2
            pirateIcon.y=enemyNametext.y-10
        }
        else {
            rescuerImg.x = enemyCurrPos[0]-widthCorr
            rescuerImg.y=enemyCurrPos[1]-108/2
            pirateImg.x=myCurrPos[0]-widthCorr
            pirateImg.y=myCurrPos[1]-108/2
            healIcon.x=enemyNametext.x+enemyNametext.width/2
            healIcon.y=enemyNametext.y-10
            pirateIcon.x=myNametext.x+myNametext.width/2
            pirateIcon.y=myNametext.y-10
        }
        if ((sendMoves.length>0 || sendStops.length>0)) {
            socket.emit("move player", {sendMoves:sendMoves, sendStops:sendStops})
        }
        group.sort('y', Phaser.Group.SORT_ASCENDING);
    }
        
        lastTime=currentTime;
//
}

$(document).ready(function() {
    $(".sendName").click(function(){
        sendName($('.nameField').val());
    })
    $('.playAgain').click(function() {
        playAgain();
    })
});