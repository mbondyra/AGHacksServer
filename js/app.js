'use strict';

/**
 * @ngdoc overview
 * @name trunkApp
 * @description
 * # trunkApp
 *
 * Main module of the application.
 */

var app = angular.module('hacksApp', ['ngRoute']);

// basic routing config
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .when('/new', {
            templateUrl: 'views/start.html',
            controller: 'NewGameCtrl'
        })
        .when('/game', {
            templateUrl: 'views/game.html',
            controller: 'GameCtrl'
        })
        .when('/rank', {
            templateUrl: 'views/rank.html',
            controller: 'RankingCtrl'
        })
        .when('/end', {
            templateUrl: 'views/end.html',
            controller: 'GameOverCtrl'
        })
        .when('/lobby', {
            templateUrl: 'views/lobby.html',
            controller: 'LobbyCtrl'
        })
        .when('/howto', {
            templateUrl: 'views/howto.html',
            controller: 'HowToCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
    })
    .filter('forceInt', function(){
        return function(input) {
            return parseInt(input, 10);
        };
    })
    .filter('forceFloat', function(){
        return function(input){
            return parseFloat(input);
        }
    });


app.config(['$httpProvider', function($httpProvider) {

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

app.constant('appConfig',{
    gameServerApi:'http://localhost:8081'
});
