var util = require('util')
var http = require('http')
var path = require('path')
var ecstatic = require('ecstatic')
var io = require('socket.io')

var Match = require("./Match")
var Player = require('./Player')
var mysql = require('mysql'); //

var port = process.env.PORT || 8080

var serverTickrate = 1000/60 // 50ms
var currentTick = 0
var lastTickTime=0
var currentTickTime=0

var speed=100 //pixels per second

/* ************************************************
** GAME VARIABLES
************************************************ */
var socket	
var players
var playerQueue=[]
var matches = []
var matchStartPausetime = 3000 // ms
var matchLength=120 //seconds
var pickDelay=1000
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
/* ************************************************
** GAME INITIALISATION
************************************************ */

// Create and start the http server
var server = http.createServer(
  ecstatic({ root: path.resolve(__dirname, '../public') })
).listen(port, function (err) {
  if (err) {
    throw err
  }

  init()
})

function init () {
  players = []
  socket = io.listen(server)

  socket.configure(function () {
    socket.set('transports', ['websocket'])
    socket.set('log level', 2)
  })
  setEventHandlers()
}

/* ************************************************
** GAME EVENT HANDLERS
************************************************ */
var setEventHandlers = function () {
  // Socket.IO
  socket.sockets.on('connection', onSocketConnection)
}

// New socket connection
function onSocketConnection (client) {

  // Listen for client disconnected
  client.on('disconnect', onClientDisconnect)
  
  client.on('new name', onNewName)
  
  

  // Listen for move player message
  client.on('move player', onMovePlayer)
  client.on('pick ukkeli', onPickUkkeli)
    client.on('restart', onRestart);

}

function checkIfUkkeliClose(charX,charY,ukkeliID, ukkelis, charFacing) {
    for (var i=0;i<ukkelis.length;i++) {
        if (ukkeliID == ukkelis[i].id) {
            if (charFacing==compasspoints.RIGHT || charFacing == compasspoints.LEFT) {
                if (Math.abs(charY-ukkelis[i].y)<80 && Math.abs(charY-ukkelis[i].y)>20 && Math.abs(charX-ukkelis[i].x)<40)
                    return i
            }
            else if (charFacing == compasspoints.DOWN || charFacing == compasspoints.UP){
                if (Math.abs(charX-ukkelis[i].x)<80 && Math.abs(charX-ukkelis[i].x)>20 && Math.abs(charY-ukkelis[i].y)<40)
                    return i
            }
            else if (charFacing == compasspoints.UPRIGHT || charFacing == compasspoints.DOWNLEFT) {
                if ((charX-ukkelis[i].x<50 && charX-ukkelis[i].x>0 && charY-ukkelis[i].y<50 && charY-ukkelis[i].y>0) || (ukkelis[i].x-charX<50 && ukkelis[i].y-charY < 50 && ukkelis[i].y-charY>0 && ukkelis[i].x - charX>0))
                    return i
                }
            else if (charFacing == compasspoints.UPLEFT || charFacing == compasspoints.DOWNRIGHT) {
                if ((charX-ukkelis[i].x<50 && ukkelis[i].y-charY<50 && charX-ukkelis[i].x>0 && ukkelis[i].y-charY>0) || (ukkelis[i].x-charX<50 && charY - ukkelis[i].y < 50 && ukkelis[i].x - charX > 0 && charY-ukkelis[i].y >0))
                    return i
            }
        }
        
    }
    return null
}
function onPickUkkeli(data) {
    var match=matchById(this.id)
    if (!match) return
    var playerPos = playerById(this.id).position
    if (data.id==null) {
        socket.sockets.socket(match.playerID1).emit('empty pick', {pos: playerPos})
        socket.sockets.socket(match.playerID2).emit('empty pick', {pos: playerPos})
        if (playerPos==0)
            match.playerPicking1=currentTickTime+=pickDelay
        else
            match.playerPicking2=currentTickTime+=pickDelay
        return
    }
    var ukkeliIndex;
    if (playerPos==0)
        ukkeliIndex = checkIfUkkeliClose(match.playerPOS1[0],match.playerPOS1[1],data.id,match.ukkelis, match.playerFacing1)
    else
        ukkeliIndex = checkIfUkkeliClose(match.playerPOS2[0],match.playerPOS2[1],data.id,match.ukkelis, match.playerFacing2)
    if (ukkeliIndex == null) return;
    match.ukkelis[ukkeliIndex].beingPicked=true;
    match.ukkelis.splice(ukkeliIndex,1);
    var rescued=false
    if (playerPos==0) {
        match.rescueScore+=1
        match.playerPicking1=currentTickTime+=pickDelay
        rescued=true
    }
    else {
        match.killScore+=1
        match.playerPicking2=currentTickTime+=pickDelay
    }
    socket.sockets.socket(match.playerID1).emit('pick ukkeli', {id: data.id, rescued: rescued})
    socket.sockets.socket(match.playerID2).emit('pick ukkeli', {id: data.id, rescued: rescued})
}
// Socket client has disconnected
function onClientDisconnect () {
  util.log('Player has disconnected: ' + this.id)

  var removePlayer = playerById(this.id)
  if (!removePlayer) {
    util.log('Player not found: ' + this.id)
    return
  }
  if (playerQueue.length>0) {
      if(playerQueue[0].id==this.id) playerQueue.shift();
  }
  destroyMatch(removePlayer.id,0)
  players.splice(players.indexOf(removePlayer),1)
}
function destroyMatch(id, tmpReason) {
    var tmpMatch = matchById(id);
    if (!tmpMatch) return;
    socket.sockets.socket(tmpMatch.playerID1).emit('gameover', {reason: tmpReason})
    socket.sockets.socket(tmpMatch.playerID2).emit('gameover', {reason: tmpReason})
    matches.splice(matches.indexOf(tmpMatch),1);
    
}
function onRestart() {
    var tmpPlayer=playerById(this.id);
    
    if (playerQueue.length==0) {
        tmpPlayer.position=0;
        playerQueue.push(tmpPlayer);
        this.emit('no players', {})
    }
    else {
        var Time = (new Date).getTime();
        tmpPlayer.position=1;
        var newMatch = new Match(playerQueue[playerQueue.length-1].id,tmpPlayer.id,playerQueue[playerQueue.length-1].name,tmpPlayer.name, Time)
        newMatch.nextSpawnedChar = newMatch.gameStartTime+matchStartPausetime
        matches.push(newMatch)
        this.emit('match started', {otherPlayerName:playerQueue[playerQueue.length-1].name, playerPos: tmpPlayer.position, pauseTime:matchStartPausetime, myPlayerPos:newMatch.playerPOS2, enemyPlayerPos:newMatch.playerPOS1});
        socket.sockets.socket(playerQueue[playerQueue.length-1].id).emit('match started', {otherPlayerName: tmpPlayer.name, playerPos: playerQueue[playerQueue.length-1].position, pauseTime:matchStartPausetime, myPlayerPos:newMatch.playerPOS1, enemyPlayerPos:newMatch.playerPOS2})
        playerQueue.splice(playerQueue.length-1,1)
    }
}
function onNewName(data) {
    util.log(data.name + ' has joined! Checking the queue...' + playerQueue.length);
    var newPlayer = new Player(data.name);
    players.push(newPlayer)
    newPlayer.id = this.id;
    if (playerQueue.length==0) {
        util.log('Placing ' + data.name + ' in queue waiting for the other player.');
        newPlayer.position = 0;
        this.emit('no players', {})
        
        playerQueue.push(newPlayer);
    }
    else {
        var Time = (new Date).getTime();
        util.log('Match found for ' + data.name + ' and ' + playerQueue[playerQueue.length-1].name + '!')
        newPlayer.position=1;
        var newMatch = new Match(playerQueue[playerQueue.length-1].id,newPlayer.id,playerQueue[playerQueue.length-1].name,newPlayer.name, Time)
        newMatch.nextSpawnedChar = newMatch.gameStartTime+matchStartPausetime
        matches.push(newMatch)
        this.emit('match started', {otherPlayerName:playerQueue[playerQueue.length-1].name, playerPos: newPlayer.position, pauseTime:matchStartPausetime, myPlayerPos:newMatch.playerPOS2, enemyPlayerPos:newMatch.playerPOS1});
        socket.sockets.socket(playerQueue[playerQueue.length-1].id).emit('match started', {otherPlayerName: data.name, playerPos: playerQueue[playerQueue.length-1].position, pauseTime:matchStartPausetime, myPlayerPos:newMatch.playerPOS1, enemyPlayerPos:newMatch.playerPOS2})
        playerQueue.splice(playerQueue.length-1,1);
    }
}
// Player has moved

function onMovePlayer (data) {
   var match=matchById(this.id)
   
   if (!match) return
   var playerPos = playerById(this.id).position
   if (playerPos==0) {
       data.sendMoves.forEach(function(key1) {
           match.player1Moves[key1]=true
       })
       data.sendStops.forEach(function(key) {
           match.player1Moves[key]=false
       })
       socket.sockets.socket(match.playerID1).emit('movechange', {pos:playerPos, moves:match.player1Moves})
        socket.sockets.socket(match.playerID2).emit('movechange', {pos:playerPos, moves:match.player1Moves})
   }
   else {
       data.sendMoves.forEach(function(key1) {
           match.player2Moves[key1]=true
       })
       data.sendStops.forEach(function(key) {
           match.player2Moves[key]=false
       })
        socket.sockets.socket(match.playerID1).emit('movechange', {pos:playerPos, moves:match.player2Moves})
        socket.sockets.socket(match.playerID2).emit('movechange', {pos:playerPos, moves:match.player2Moves})
   }
}

/* ************************************************
** GAME HELPER FUNCTIONS
************************************************ */

function matchById(id) {
    for (var i=0;i<matches.length;i++) {
        if (matches[i].playerID1 == id || matches[i].playerID2 == id) return matches[i]
    }
    return false
}
function playerById (id) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }
  return false
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
function getCompass(i,j) {
    if (i>0 && j==0) {
        return compasspoints.RIGHT
    }
    else if(i<0 && j==0) {
        return compasspoints.LEFT
    }
    else if(j<0 && i==0) {
        return compasspoints.UP
    }
    else if(j>0 && i==0) 
        return compasspoints.DOWN
    else if(j>0 && i>0)
        return compasspoints.DOWNRIGHT
    else if(j>0 && i<0)
        return compasspoints.DOWNLEFT
    else if(j<0 && i>0)
        return compasspoints.UPRIGHT
    else if(j<0 && i<0)
        return compasspoints.UPLEFT
    else
        return null
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function serverTick() {
    currentTickTime=(new Date).getTime();
    deltaTime = (currentTickTime-lastTickTime)/1000;
    for (var i=0; i<matches.length; i++) {
        if (currentTickTime-matches[i].gameStartTime>matchLength*1000) {
            destroyMatch(matches[i].playerID1,1)
        }
        else {
            if (matches[i].nextSpawnedChar < currentTickTime) {
                xpos = getRandomInt(32,800-32)
                ypos = getRandomInt(32,600-32)
                matches[i].lastID+=1
                matches[i].ukkelis.push({id:matches[i].lastID,x:xpos,y:ypos,beingPicked:false})
                socket.sockets.socket(matches[i].playerID1).emit('new ukkeli', {id:matches[i].lastID,x:xpos,y:ypos})
                socket.sockets.socket(matches[i].playerID2).emit('new ukkeli', {id: matches[i].lastID,x:xpos,y:ypos})
                matches[i].nextSpawnedChar+=5000*(Math.pow(0.965,matches[i].lastID)) //TODO
                
            }
            if (matches[i].playerPicking1<currentTickTime) {
                player1move = getPosMove(matches[i].player1Moves)
                matches[i].playerPOS1[0]+=player1move[0]*speed*deltaTime
                matches[i].playerPOS1[1]+=player1move[1]*speed*deltaTime
                compDir = getCompass(player1move[0],player1move[1])
                if (compDir!=null)
                    matches[i].playerFacing1=compDir
            }
            if (matches[i].playerPicking2<currentTickTime) {
                player2move = getPosMove(matches[i].player2Moves)
                matches[i].playerPOS2[0]+=player2move[0]*speed*deltaTime
                matches[i].playerPOS2[1]+=player2move[1]*speed*deltaTime
                compDir = getCompass(player2move[0],player2move[1])
                if (compDir!=null)
                    matches[i].playerFacing2=compDir
            }
            if (matches[i].playerPOS1[0]>800-50)
                matches[i].playerPOS1[0]=750
            else if(matches[i].playerPOS1[0]<50)
                matches[i].playerPOS1[0]=50
            if (matches[i].playerPOS1[1]>550)
                matches[i].playerPOS1[1]=550
            else if (matches[i].playerPOS1[1]<50)
                matches[i].playerPOS1[1]=50
            if (matches[i].playerPOS2[0]>800-50)
                matches[i].playerPOS2[0]=750
            else if(matches[i].playerPOS2[0]<50)
                matches[i].playerPOS2[0]=50
            if (matches[i].playerPOS2[1]>550)
                matches[i].playerPOS2[1]=550
            else if (matches[i].playerPOS2[1]<50)
                matches[i].playerPOS2[1]=50
            socket.sockets.socket(matches[i].playerID1).emit('move player', {myPOS: matches[i].playerPOS1, enemyPOS: matches[i].playerPOS2})
            socket.sockets.socket(matches[i].playerID2).emit('move player', {enemyPOS: matches[i].playerPOS1, myPOS: matches[i].playerPOS2})
        }
    }
    lastTickTime = currentTickTime
    currentTick++;
    
};
setInterval(serverTick, serverTickrate)
