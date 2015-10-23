/**
 * Created by ezimonczyk on 23/10/15.
 */

'use strict';

app.controller('GameOverCtrl',['$scope', '$location', 'ConfigService', 'AuthenticationService', function($scope, $location, ConfigService, AuthenticationService){

    ConfigService.getMenu()
        .then(
        function(res){
            $scope.menu = res.data;
        },
        function(error){
            throw error.status+" : "+error.statusText;
        });
}]);