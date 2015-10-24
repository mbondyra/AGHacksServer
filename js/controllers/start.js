/**
 * Created by ezimonczyk on 23/10/15.
 */

'use strict';

app.controller('NewGameCtrl',['$scope', '$location', '$http', 'appConfig', 'GameDataService', function($scope, $location, $http, appConfig, GameDataService){
    $scope.game = {time: 5, players: 5, difficulty: '2'};

    $scope.create = function(game){
        if(game && game.time && game.players && game.difficulty)
            $http.post(appConfig.gameServerApi+'/new/game',game)
                .then(function(response){
                    GameDataService.putData(game);
                    $location.path('/lobby').replace();
                },function(error){
                    $scope.toast = "Something went wrong :( Try again!";
                    $scope.showToast = true;
                });
        else {

        }
    }
}]);
