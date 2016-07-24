/**
    https://github.com/smooty/screeps
    Summer, 2016

    TO FIX:  Clean up the tower defense code so that I'm not hard coding the room ID
*/

"use strict";

require('mod.screeps-perf')({
    speedUpArrayFunctions: true,
    cleanUpCreepMemory: true,
    optimizePathFinding: false
});

// global variables
var objRoles = require('mod.roles');
var objFunctions = require('mod.functions');

// main function
module.exports.loop = function ()
{
    // spawn new creeps if necessary
    objFunctions.spawn_new_creeps();

    // for each of the creeps...
    for (let name in Game.creeps)
    {
        var creep = Game.creeps[name]

        // if creep is builder...
        if (creep.memory.role == 'builder')
        {
            objRoles.builder(creep);
        }
        // if creep is harvester...
        else if (creep.memory.role == 'harvester')
        {
            objRoles.harvester(creep);
        }
        // if creep is mason...
        else if (creep.memory.role == 'mason')
        {
            objRoles.mason(creep);
        }
        // if creep is repairer...
        else if (creep.memory.role == 'repairer')
        {
            objRoles.repairer(creep);
        }
        // if creep is scout harvester...
        else if (creep.memory.role == 'scout_harvester')
        {
            objRoles.scout_harvester(creep);
        }
        // if creep is upgrader...
        else if (creep.memory.role == 'upgrader')
        {
            objRoles.upgrader(creep);
        }
    }

    // tower defense
    objFunctions.tower_defense();

    // manage memory
    objFunctions.manage_memory();
}