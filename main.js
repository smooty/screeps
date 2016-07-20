/*
    https://github.com/smooty/screeps
    Summer, 2016
*/

// global variables
var roleHarvester = require('mod.role.harvester');
var roleUpgrader = require('mod.role.upgrader');
var funcSpawn = require('mod.function.spawn');
var funcManageMemory = require('mod.function.manage_memory');

// main function; loop forever
module.exports.loop = function ()
{
    // spawn new creeps if necessary
    funcSpawn.run();

    // for each of the creeps...
    for (let name in Game.creeps) {

        var creep = Game.creeps[name]

        // if creep is harvester...
        if (creep.memory.role == 'harvester')
        {
            roleHarvester.run(creep);
        }
        // if creep is upgrader...
        else if (creep.memory.role == 'upgrader')
        {
            roleUpgrader.run(creep);
        }
    }

    // clean up memory
    funcManageMemory.run()
}