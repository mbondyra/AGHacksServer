/**
 * Created by ezimonczyk on 23/10/15.
 */

'use strict';

app.controller('NewGameCtrl',['$scope', '$location', '$http', 'appConfig', 'GameDataService', '$timeout', function($scope, $location, $http, appConfig, GameDataService, $timeout){
    $scope.game = {time: 5, players: 5};

    $scope.create = function(game){
        if(game && game.time && game.players && game.name)
            $http.post(appConfig.gameServerApi+'/new/game',game)
                .then(function(response){
                    GameDataService.putData(game);
                    $location.path('/lobby').replace();
                },function(error){
                    $scope.toast = "Something went wrong :( Try again!";
                    $scope.showToast = true;
                });
        else {
            $scope.toast = "Wrong parameters";
            $scope.showToast = true;
            $timeout(function(){
                $scope.showToast = false;
            },3000);

        }
    }
}]);
