/*
 https://github.com/smooty/screeps
 Summer, 2016

 This module cleans up our memory
 */

module.exports = {

    run: function()
    {
        for (let name in Memory.creeps)
        {
            if (Game.creeps[name] == undefined)
            {
                delete Memory.creeps[name];
            }
        }
    }
};