/**
 * Created by ezimonczyk on 23/10/15.
 */

app.service('PuzzleService', ['$http', 'appConfig', 'GameDataService', function($http,appConfig,GameDataService) {

    var checkGameType = function() {

        var type = "";

        $http.get(appConfig.gameServerApi+'/game/0')
            .then(function(response){
                type = response.data.type;
                GameDataService.addToData('puzzle',response.data);
            },
            function(){
                console.log("error");
                type = "";
            });
        return type;
    };

}]);
