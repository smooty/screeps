/*
 https://github.com/smooty/screeps
 Summer, 2016

 This module spawns new creeps

 TO FIX:

 Currently I use 'Marysville' below -- need to figure out a way to get the spawn name dynamically
 */

module.exports = {

    run: function()
    {
        var intMinNumHarvesters = 10;
        var intMinNumUpgraders = 5;
        var intNumHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
        var intNumUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
        var name = undefined;

        // spawn a new harvester if we don't have enough
        if (intNumHarvesters < intMinNumHarvesters)
        {
            var name = Game.spawns.Marysville.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'harvester', blnHarvesting: true, blnTransferring: false});
        }
        // spawn a new upgrader if we don't have enough (and we didn't try and spawn a harvester this round)
        else if (intNumUpgraders < intMinNumUpgraders)
        {
            var name = Game.spawns.Marysville.createCreep([WORK,CARRY,MOVE,MOVE], undefined, {role: 'upgrader', blnHarvesting: true, blnTransferring: false});
        }

        if (!(name < 0))
        {
            console.log("Spawned new creep: " + name)
        }
    }
};