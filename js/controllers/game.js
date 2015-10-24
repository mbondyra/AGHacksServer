/**
 * Created by ezimonczyk on 23/10/15.
 */

'use strict';

app.controller('GameCtrl',['$scope', '$location', '$http', 'appConfig', 'GameDataService','$interval', function($scope, $location, $http, appConfig, GameDataService, $interval){
    var endTime = GameDataService.getDataKey('endTime'),
        secondsLeft = parseInt((endTime - Date.now())/1000);

    $scope.seconds = secondsLeft%60;
    $scope.minutes = (secondsLeft-$scope.seconds)/60;
    $scope.mminutes = ($scope.minutes > 9)? "" : 0;
    $scope.sseconds = ($scope.seconds > 9)? "" : 0;

    var timer = $interval(function(){
        $scope.seconds -= 1;
        if($scope.seconds == -1){
            $scope.minutes -= 1;
            $scope.seconds = 59;
            $scope.mminutes = ($scope.minutes > 9)? "" : 0;
        }

        $scope.sseconds = ($scope.seconds > 9)? "" : 0;

        if($scope.seconds == 0 && $scope.minutes == 0){
            $interval.cancel(timer);
            detonate();
        }
    },1000);

    var detonate = function(){
        GameDataService.addToData('win',false);

    }

}]);
