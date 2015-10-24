/**
 * Created by ezimonczyk on 23/10/15.
 */

app.service('GameDataService', function() {
    var gameData = {};

    this.putData = function(newDataset) {
        gameData = newDataset;
    };

    this.getData = function(){
        return gameData;
    };

    this.addToData = function(key,value) {
        gameData[key] = value;
    };

    this.getDataKey = function(key){
        if(gameData.hasOwnProperty(key)){
            return gameData[key];
        }
    };
});
