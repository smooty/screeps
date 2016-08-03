/**
 https://github.com/smooty/screeps
 Summer, 2016

 This module spawns new creeps
 */

"use strict";

function intCountCreeps()
{
    var intCount = 0;

    for (let i in Game.creeps)
    {
        intCount++;
    }

    return intCount;
}

module.exports = {

    manage_memory: function()
    {
        for (let name in Memory.creeps)
        {
            if (Game.creeps[name] == undefined)
            {
                delete Memory.creeps[name];
            }
        }
    },

    spawn_new_creeps: function()
    {
        var intMinNumBuilders = 1;
        var intMinNumHarvesters = 4;
        var intMinNumMasons = 1;
        var intMinNumRepairers = 1;
        var intMinNumScoutHarvesters = 4;
        var intMinNumUpgraders = 4;
        var intMinNumSettlers = 0;
        var intRequiredEnergy = 300;
        var objName;
        var objSpawn;
        var intMaxCreeps = 16;

        // initialize variables
        var intNumBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'builder');
        var intNumHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
        var intNumMasons = _.sum(Game.creeps, (c) => c.memory.role == 'mason');
        var intNumRepairers = _.sum(Game.creeps, (c) => c.memory.role == 'repairer');
        var intNumScoutHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'scout_harvester');
        var intNumUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
        var intNumSettlers = _.sum(Game.creeps, (c) => c.memory.role == 'settler');

        // check all our spawns; if the spawn has enough energy to create a creep, spawn something (provided we don't already have 'intMaxCreeps'
        if (intCountCreeps() < intMaxCreeps)
        {
            for (let i in Game.spawns)
            {
                objSpawn = Game.spawns[i];

                if (objSpawn.energy >= intRequiredEnergy)
                {
                    console.log("I have (" + intNumHarvesters + ") harvesters and need (" + intMinNumHarvesters + ") of them");
                    console.log("I have (" + intNumScoutHarvesters + ") scout_harvesters and need (" + intMinNumScoutHarvesters + ") of them");
                    console.log("I have (" + intNumUpgraders + ") upgraders and need (" + intMinNumUpgraders + ") of them");
                    console.log("I have (" + intNumBuilders + ") builders and need (" + intMinNumBuilders + ") of them");
                    console.log("I have (" + intNumRepairers + ") repairers and need (" + intMinNumRepairers + ") of them");
                    console.log("I have (" + intNumSettlers + ") settlers and need (" + intMinNumSettlers + ") of them");

                    // spawn a new harvester if we don't have enough
                    if (intNumHarvesters < intMinNumHarvesters)
                    {
                        objName = objSpawn.createCreep([WORK,CARRY,CARRY,MOVE], undefined, {role: 'harvester', blnBuilding: false, blnGettingEnergy: true, blnMasoning: false, blnRepairing: false, blnTransferring: false});
                    }
                    // spawn a new scout harvester if we don't have enough
                    else if (intNumScoutHarvesters < intMinNumScoutHarvesters)
                    {
                        objName = objSpawn.createCreep([WORK,CARRY,MOVE,MOVE], undefined, {role: 'scout_harvester', blnBuilding: false, blnGettingEnergy: true, blnMasoning: false, blnRepairing: false, blnTransferring: false});
                    }
                    // spawn a new upgrader if we don't have enough
                    else if (intNumUpgraders < intMinNumUpgraders)
                    {
                        objName = objSpawn.createCreep([WORK,CARRY,CARRY,MOVE], undefined, {role: 'upgrader', blnBuilding: false, blnGettingEnergy: true, blnMasoning: false, blnRepairing: false, blnTransferring: false});
                    }
                    // spawn a new builder if we don't have enough
                    else if (intNumBuilders < intMinNumBuilders)
                    {
                        objName = objSpawn.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'builder', blnBuilding: false, blnGettingEnergy: true, blnMasoning: false, blnRepairing: false, blnTransferring: false});
                    }
                    // spawn a new repairer if we don't have enough
                    else if (intNumRepairers < intMinNumRepairers)
                    {
                        objName = objSpawn.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'repairer', blnBuilding: false, blnGettingEnergy: true, blnMasoning: false, blnRepairing: false, blnTransferring: false});
                    }
                    // spawn a new mason if we don't have enough
                    else if (intNumMasons < intMinNumMasons)
                    {
                        objName = objSpawn.createCreep([WORK,CARRY,CARRY,MOVE], undefined, {role: 'mason', blnBuilding: false, blnGettingEnergy: true, blnMasoning: false, blnRepairing: false, blnTransferring: false});
                    }
                    // spawn a new settler if we don't have enough
                    else if (intNumSettlers < intMinNumSettlers)
                    {
                        console.log("BANANA");

                        objName = objSpawn.createCreep([CLAIM,MOVE], undefined, {role: 'settler', blnBuilding: false, blnGettingEnergy: false, blnMasoning: false, blnRepairing: false, blnTransferring: false});

                    }
                    // if we have all our minimums, and we have energy to spare, spawn a upgrader
                    else
                    {
                        objName = objSpawn.createCreep([WORK,WORK,CARRY,MOVE], undefined, {role: 'upgrader', blnBuilding: false, blnGettingEnergy: true, blnMasoning: false, blnRepairing: false, blnTransferring: false});
                    }

                    if (!(objName === undefined))
                    {
                        console.log("Spawning a new " + Game.creeps[objName].memory.role + ": " + objName);
                    }
                }
            }
        }
        else
        {
            //console.log("Not spawning creeps this tick -- we already have at least " + intMaxCreeps);
        }
    },

    tower_defense: function()
    {
        var objRoom;
        var objTowers;
        for (let i in Game.rooms)
        {
            objRoom = Game.rooms[i];

            objTowers = objRoom.find(FIND_STRUCTURES, {
                 filter: (s) => s.structureType == STRUCTURE_TOWER
            });

            if (objTowers != undefined)
            {
                for (let objTower of objTowers)
                {
                    var objTarget = objTower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    if (objTarget != undefined)
                    {
                        objTower.attack(objTarget);
                    }
                }
            }
        }
    }
};