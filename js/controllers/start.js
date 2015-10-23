/**
 * Created by ezimonczyk on 23/10/15.
 */

'use strict';

app.controller('NewGameCtrl',['$scope', '$location', '$http', 'appConfig', function($scope, $location, $http, appConfig){
    $scope.game = {};

    $scope.create = function(game){
        $http.post(appConfig.gameServerApi+'/modifyTime',game)
            .then(function(response){
                console.log(response);
            },function(error){
                console.log(error)
            });
    }
}]);
