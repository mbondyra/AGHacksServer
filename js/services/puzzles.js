/**
 * Created by ezimonczyk on 23/10/15.
 */

'use strict';

app.service('PuzzleService', ['$http', 'appConfig', 'GameDataService', function($http,appConfig,GameDataService) {

    this.checkGameType = function() {
        return $http.get(appConfig.gameServerApi+'/game/0');
    }
}]);
