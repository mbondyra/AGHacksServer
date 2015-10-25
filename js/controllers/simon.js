/**
 * Created by ezimonczyk on 24/10/15.
 */

'use strict';

app.controller('SimonCtrl',['$scope', '$location', '$http', 'appConfig', 'GameDataService','$interval', 'PuzzleService','$route', function($scope, $location, $http, appConfig, GameDataService, $interval, PuzzleService, $route){

        $scope.result = null;

        var puzzle = GameDataService.getDataKey("puzzle");
        $scope.puzzle = puzzle;

        var sequences = [],
            seqString = puzzle.inputValues.seq,
            stage = 0,
            playersTurn = false,
            playerSequence = [],
            clickCounter = 0;

        var splitSeq = function(seqString){
            for(var i = 0 ; i < seqString.length ; i += 2){
                sequences.push(seqString.substring(0,i+2));
            }
            console.log(sequences);
        };

        splitSeq(seqString);

        var finishSimon = function(result) {
            console.log("FINISH!");
            $http.post(appConfig.gameServerApi+"/try/solve",{result: result, id: 0})
                .then(function(response){
                    GameDataService.addToData('puzzle',response.data.puzzle);
                    $location.path("/"+response.data.puzzle.type);
                    $route.reload();
                },function(error){
                    console.log(error);
                });
        };

        var checkSeq = function(playerSeq){
              var playerSeqString = playerSeq.join("");
              console.log(playerSeqString,sequences[stage]);
              if(playerSeqString === sequences[stage]){
                  if(stage+1 < seqString.length/2){
                      playerSequence = [];
                    stage += 1;
                    turnOnBox(sequences[stage].charAt(0),0);
                  }
                  else {
                      finishSimon(1);
                  }
              } else {
                  finishSimon(0);
              }
        };

        var turnOnBox = function(boxNr,index) {
            console.log("turnOn -"+boxNr);
            $scope.currentButton = boxNr;
            setTimeout(function(){turnOffBox(index)},800)

        };

        var turnOffBox = function(index) {
            $scope.currentButton = "";
            if(index+1 < sequences[stage].length) {
                var boxNr = sequences[stage].charAt(index + 1);
                setTimeout(function(){turnOnBox(boxNr,index+1)},800)
            } else {
                playersTurn = true
            }
        };


        $scope.registerClick = function(button){
            if(playersTurn){
                console.log(button);
                playerSequence.push(button);
                clickCounter += 1;
                if(clickCounter == sequences[stage].length){
                    playersTurn = false;
                    clickCounter = 0;
                    checkSeq(playerSequence,stage);
                }
            }
        };

        var endTime = GameDataService.getDataKey('endTime'),
            secondsLeft = parseInt((endTime - Date.now()) / 1000);

        $scope.seconds = secondsLeft % 60;
        $scope.minutes = (secondsLeft - $scope.seconds) / 60;
        $scope.mminutes = ($scope.minutes > 9) ? "" : 0;
        $scope.sseconds = ($scope.seconds > 9) ? "" : 0;

        var timer = $interval(function () {
            $scope.seconds -= 1;
            if ($scope.seconds == -1) {
                $scope.minutes -= 1;
                $scope.seconds = 59;
                $scope.mminutes = ($scope.minutes > 9) ? "" : 0;
            }

            $scope.sseconds = ($scope.seconds > 9) ? "" : 0;

            if ($scope.seconds == 0 && $scope.minutes == 0) {
                $interval.cancel(timer);
                $location.path("/end");
            }
        }, 1000);

        $scope.send = function(result){
            $http.post(appConfig.gameServerApi+"/try/solve",{result: result, id: 0})
                .then(function(response){
                    console.log(response.data.secret);
                    if(response.data.secret){
                        $location.path("/end").replace();
                    } else {
                        GameDataService.addToData('puzzle', response.data.puzzle);
                        $location.path("/" + response.data.puzzle.type);
                        $route.reload();
                    }
                },function(error){
                   console.log(error);
                });
        };

        turnOnBox(sequences[stage].charAt(0),0);

}]);
