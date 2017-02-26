var Match = function(id1, id2, name1, name2,timestamp) {
    var playerID1 = id1
    var playerID2 = id2
    var playerPOS1 = [200.0,200.0]
    var playerPOS2 = [400.0, 400.0]
    var playerName1 = name1
    var playerName2 = name2
    var gameStartTime = timestamp;
    var rescueScore = 0
    var killScore =0
    var ukkelis = []
    var nextSpawnedChar
    var lastID=0;
    var playerFacing1=0
    var playerFacing2=0
    var playerPicking1=0
    var playerPicking2=0
    var player1Moves = {
        "up":false,
        "left":false,
        "right":false,
        "down":false
    }
    var player2Moves = {
        "up":false,
        "left":false,
        "right":false,
        "down":false
    }
    
    return {
        playerID1: playerID1,
        playerID2: playerID2,
        playerPOS1 : playerPOS1,
        playerPOS2 : playerPOS2,
        playerName1: playerName1,
        playerName2: playerName2,
        rescueScore: rescueScore,
        killScore : killScore,
        player1Moves : player1Moves,
        player2Moves : player2Moves,
        gameStartTime: gameStartTime,
        ukkelis : ukkelis,
        nextSpawnedChar : nextSpawnedChar,
        lastID : lastID,
        playerFacing1:playerFacing1,
        playerFacing2:playerFacing2,
        playerPicking1:playerPicking1,
        playerPicking2:playerPicking2
    }
    
}
module.exports = Match