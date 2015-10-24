/**
 * Created by ezimonczyk on 24/10/15.
 */

'use strict';

app.controller('LobbyCtrl',['$scope', '$location', '$http', 'appConfig', 'GameDataService','$interval', function($scope, $location, $http, appConfig, GameDataService, $interval) {
    var game = GameDataService.getData();
    var totalPlayers = game.players;
    $scope.startGame = false;
    $scope.players = [1,2,3,4];

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
        if(data === totalPlayers){
            $scope.startGame = true;
            $interval.cancel(lobbyRefresh);
        }
    };

    var lobbyRefresh = $interval(function(){
        refresh(function(data){
            checkPlayers(data);
        });
    },1000)

}]);
