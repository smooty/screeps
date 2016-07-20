/*
    Jason M. Stoops
*/

// global variables
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

module.exports.loop = function ()
{
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
}