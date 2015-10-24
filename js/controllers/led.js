/**
 * Created by ezimonczyk on 24/10/15.
 */

'use strict';

app.controller('LedCtrl',['$scope', '$location', '$http', 'appConfig', 'GameDataService','$interval', 'PuzzleService','$route', function($scope, $location, $http, appConfig, GameDataService, $interval, PuzzleService, $route){

        $scope.result = null;

        $scope.puzzle = GameDataService.getDataKey("puzzle");
        console.log($scope.puzzle);

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
