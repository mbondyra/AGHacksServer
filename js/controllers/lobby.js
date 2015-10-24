/**
 * Created by ezimonczyk on 24/10/15.
 */

'use strict';

app.controller('LobbyCtrl',['$scope', '$location', '$http', 'appConfig', 'GameDataService','$interval', 'PuzzleService', function($scope, $location, $http, appConfig, GameDataService, $interval, PuzzleService) {
    var game = GameDataService.getData();
    var totalPlayers = game.players;
    $scope.startGame = false;

    var refresh = function (callback) {
        $http.get(appConfig.gameServerApi + "/game/players")
            .then(function (response) {
                $scope.players = response.data.players;
                callback(response.data.players.length);
            }, function (error) {
                callback(null);
            }
        );
    };

    var checkPlayers = function(data){
        if(data >= totalPlayers){
            $scope.startGame = true;
            $interval.cancel(lobbyRefresh);
        }
    };



    var lobbyRefresh = $interval(function(){
        refresh(function(data){
            checkPlayers(data);
        });
    },1000);

    $scope.start = function(){
        $interval.cancel(lobbyRefresh);
        $http.post(appConfig.gameServerApi+"/game/start",{start: true})
            .then(function(response){
                GameDataService.addToData('endTime',response.data.time);
                PuzzleService.checkGameType()
                    .then(function(response){
                        GameDataService.addToData('puzzle',response.data.puzzle);
                        $location.path("/"+response.data.puzzle.type).replace();
                    }, function (error) {
                        console.log(error);
                    });

            },function(error){
                $scope.toast = "Something went wrong :( Try again!";
                $scope.showToast = true;
            });
    }

}]);
