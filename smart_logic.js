var smartLogic = function(){

  var BATCH_COUNT = 60 * 24;

  var logic = {
  };

  logic.initialize = function(initialState) {
    // map every second on most frequent level
    var model = {};

    for(var batchIndex = 0; batchIndex < BATCH_COUNT; batchIndex++) {
      model[batchIndex] = {};
      for(var levelIndex = 0; levelIndex < initialState.levels.length; levelIndex++) {
        model[batchIndex][levelIndex] = 0;
      }
    }
    logic.model = model
  }

  logic.getLevelScore = function(level, pastMinutes) {
    var requestSumOverall = 0;
    var requestSumLevel = 0;
    for(var pastMinute = 0; pastMinute < pastMinutes; pastMinute++) {
      var past = getMinutesOfTheDay(looper.currentTimeStamp) - pastMinute
      if(past < 0) {
        past = 0;
      }
      var currentRequests = logic.model[past];
      for(var levelIndex = 0; levelIndex < Object.keys(currentRequests).length; levelIndex++) {
        requestSumOverall += currentRequests[levelIndex]
        if(levelIndex == level) {
          requestSumLevel += currentRequests[levelIndex]
        }
      }
    }
    if(requestSumOverall == 0) {
      return 0;
    }
    return requestSumLevel/requestSumOverall;
  }

  function getNearestElevatorIndex(level) {
    var nearestElevatorIndex = 0
    var minimalDistance = Math.abs(looper.state.elevators[nearestElevatorIndex].currentLevel - level.id)
    for (var i = 0; i < looper.state.elevators.length; i++) {
        if(Math.abs(looper.state.elevators[i].currentLevel - level.id) < minimalDistance) {
            minimalDistance = Math.abs(looper.state.elevators[i].currentLevel - level.id)
            nearestElevatorIndex = i
        }
    }
    //console.log('Nearest elevator for level ' + level + ' is elevator ' + nearestElevatorIndex)
    return nearestElevatorIndex
  }
  
  logic.onElevatorUpRequested = function(level) {
    //console.log("onElevatorUpRequested");
    seconds = getMinutesOfTheDay(looper.currentTimeStamp)
    logic.model[seconds][level.id]++
    looper.state.elevators[getNearestElevatorIndex(level)].addTargetLevel(level.id);
    looper.state.elevators[getNearestElevatorIndex(level)].sortTargetLevels(logic.model)
  }

  logic.onElevatorDownRequested = function(level) {
    //console.log("onElevatorDownRequested");
    seconds = getMinutesOfTheDay(looper.currentTimeStamp)
    logic.model[seconds][level.id]++
    looper.state.elevators[getNearestElevatorIndex(level)].addTargetLevel(level.id);
    looper.state.elevators[getNearestElevatorIndex(level)].sortTargetLevels(logic.model)
  }

  logic.onTargetLevelsChanged = function(currentState, elevator, targetLevels) {
    //go to target levels one after another
  }

  logic.onElevatorIdle = function(elevator) {
    //move to most frequented level
    //console.log("onElevatorIdle");
    currentSeconds = getMinutesOfTheDay(looper.currentTimeStamp)
    maxRequests = 0
    maxRequestsIndex = 0
    for(levelIndex = 0; levelIndex < logic.model[currentSeconds].length; levelIndex++) {
      if(logic.model[currentSeconds][levelIndex] > maxRequests) {
        maxRequests = logic.model[currentSeconds][levelIndex]
        maxRequestsIndex = levelIndex
      }
    }
    looper.state.elevators[elevator.id].addTargetLevel(maxRequestsIndex);
  }

  logic.onElevatorStopped = function(elevator) {
    //console.log("onElevatorStopped");
  }

  function getMinutesOfTheDay(timestamp) {
    var dt = new Date(timestamp)
    return dt.getMinutes() + (60 * dt.getHours())
  }

  return logic;
}();
