/**
 * Created by ezimonczyk on 23/10/15.
 */

'use strict';

app.controller('GameOverCtrl',['$scope', '$location','GameDataService','$http','appConfig', function($scope, $location,GameDataService,$http, appConfig){
    $scope.result = false;
    $scope.header = "Enter secret code";

    $http.get(appConfig.gameServerApi + "/game/players")
        .then(function (response) {
            response.data.players.pop();
            $scope.players = response.data.players;
        }, function (error) {
            console.log(error);
        }
    );

    $scope.codes = [];

    $scope.sendCodes = function(){

        $http.post(appConfig.gameServerApi+"/submit/secret",{secretCode: $scope.codes})
            .then(function(response){
                if(response.data.success){
                    $scope.header = "Epic win!";
                } else {
                    $scope.header = "Epic fail!";
                }

                $scope.result = true;
            },function(error){
                console.log(error);
            });
    };

}]);