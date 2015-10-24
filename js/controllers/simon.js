/**
 * Created by ezimonczyk on 24/10/15.
 */

'use strict';

app.controller('SimonCtrl',['$scope', '$location', '$http', 'appConfig', 'GameDataService','$interval', 'PuzzleService','$route', function($scope, $location, $http, appConfig, GameDataService, $interval, PuzzleService, $route){

        $scope.result = null;

        $scope.puzzle = GameDataService.getDataKey("puzzle");
        var sequences = [],
            seqString = $scope.puzzle.seq,
            stage = 0,
            playersTurn = false,
            playerSequence = [],
            clickCounter = 0;

        var splitSeq = function(seqString){
            for(var i = 0;i<seqString.length;i+2){
                sequences.push(seqString.substring(0,i+2));
            }
        };

        var checkSeq = function(playerSeq,stage){
              if(playerSeq === sequences[stage]){
                  if(stage < seqString.length/2)
                    initNextStage(stage+1);
                  else
                    finishSimon(true);
              } else {
                  finishSimon(false);
              }
        };

        var initNextStage = function(stage){

            $scope.currentButton = "";

            for(var i = 0;i<sequences[stage].length;i++){
                $scope.currentButton = sequences[stage].charAt(i);
                var timeoutTime = 1000 - 50*stage;
                setTimeout(function(){
                    $scope.currentButton = "";
                },timeoutTime);
            }

            playersTurn = true;
        };

        $scope.registerClick = function(button){
            if(playersTurn){
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
                detonate();
            }
        }, 1000);

        var detonate = function () {
            GameDataService.addToData('win', false);
        };

        $scope.send = function(result){
            $http.post(appConfig.gameServerApi+"/try/solve",{result: result, id: 0})
                .then(function(response){
                    GameDataService.addToData('puzzle',response.data.puzzle);
                    $location.path("/"+response.data.puzzle.type);
                    $route.reload();
                },function(error){
                   console.log(error);
                });
        }

}]);
