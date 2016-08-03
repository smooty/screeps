/**
 https://github.com/smooty/screeps
 Summer, 2016
 */

"use strict";

var strHomeRoom = "W41S23";
var strAdjacentRoom = "W41S24";

var intMaxWallHealth = 300000000;
var intWallHealthIncrementer = 10000;

var blnEnableLogging_blnWallsToRepair = false;
var blnEnableLogging_BuildConstructionSite = false;
var blnEnableLogging_RepairStructure = false;
var blnEnableLogging_RepairWall = false;
var blnEnableLogging_GetEnergy = false;
var blnEnableLogging_upgrader = false;
var blnEnableLogging_harvester = false;
var blnEnableLogging_builder = false;
var blnEnableLogging_mason = false;
var blnEnableLogging_repairer = false;
var blnEnableLogging_settler = false;


function _blnWallsToRepair(creep,intWallHealth)
{
    // local variables
    var objRoom;
    var objWalls;

    if (blnEnableLogging_blnWallsToRepair) {console.log(creep.name + "[" + creep.memory.role + "] is looking for walls to repair where health < " + intWallHealth);}

    // find walls to fortify
    objRoom = Game.rooms[strHomeRoom];
    objWalls = objRoom.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_WALL && s.hits < intWallHealth && s.pos.x != 0 && s.pos.x != 49 && s.pos.y != 0 && s.pos.y != 49
    });

    if (objWalls.length == 0)
    {
        if (blnEnableLogging_blnWallsToRepair) {console.log(creep.name + "[" + creep.memory.role + "] -- no walls found where health < " + intWallHealth);}
        return false;
    }
    else
    {
        if (blnEnableLogging_blnWallsToRepair) {console.log(creep.name + "[" + creep.memory.role + "] -- walls found where health < " + intWallHealth);}
        return true;
    }
}

function _BuildConstructionSite(creep,structure_type)
{
    if (blnEnableLogging_BuildConstructionSite) {console.log(creep.name + "[" + creep.memory.role + "] is looking for " + structure_type + " to build");}

    var blnFoundSwampRoad = false;
    var objConstructionSite;
    var objSites;
    var objRoom;

    // if we're working on a road, and the construction site is on swamp land, construct it first; otherwise construct the site closest
    if (structure_type == STRUCTURE_ROAD)
    {
        // are any of these roads on swamp land?
        objRoom = Game.rooms[strHomeRoom];
        objSites = objRoom.find(FIND_MY_CONSTRUCTION_SITES);
        if (objSites != undefined)
        {
            for (let i in objSites)
            {
                if (objSites[i].structureType == STRUCTURE_ROAD && Game.map.getTerrainAt(objSites[i].pos) == "swamp")
                {
                    objConstructionSite = objSites[i];
                    blnFoundSwampRoad = true;
                    break; // stop the for loop...we found a swamp to work on
                }
            }
        }
    }

    if (blnFoundSwampRoad == false)
    {
        objConstructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
            filter: (s) => s.structureType == structure_type
        });
    }

    if (objConstructionSite != undefined)
    {
        if (creep.build(objConstructionSite) == ERR_NOT_IN_RANGE)
        {
            creep.moveTo(objConstructionSite);
        }
        if (blnEnableLogging_BuildConstructionSite) {console.log(creep.name + "[" + creep.memory.role + "] is building " + objConstructionSite.structureType + " " + objConstructionSite.id + " at location " + objConstructionSite.pos);}
        return true; // exit this function; we found the construction site we're going to build
    }
    else
    {
        return false;
    }
}

function _RepairStructure(creep,structure_type)
{
    // local variables
    var objRepair;

    if (blnEnableLogging_RepairStructure) {console.log(creep.name + "[" + creep.memory.role + "] is looking for " + structure_type + " to repair");}

    objRepair = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType == structure_type && s.hits < s.hitsMax
    });

    if (objRepair != undefined)
    {
        if (creep.repair(objRepair) == ERR_NOT_IN_RANGE)
        {
            if (blnEnableLogging_RepairStructure) {console.log(creep.name + "[" + creep.memory.role + "] is moving towards " + structure_type + " at position " + objRepair.pos);}

            creep.moveTo(objRepair);
        }
        else
        {
            if (blnEnableLogging_RepairStructure) {console.log(creep.name + "[" + creep.memory.role + "] is repairing " + structure_type + " at location " + objRepair.pos);}
        }

        return true; // exit this function; we found the structure we're going to repair
    }
    else
    {
        if (blnEnableLogging_RepairStructure) {console.log(creep.name + "[" + creep.memory.role + "] found no " + structure_type + " to repair");}

        return false;
    }
}

function _RepairWall(creep,structure_type)
{
    // we want to make sure we're building up the strength of all the blocks somewhat evenly; lets...
    //
    // -- get all the walls...
    // ---- if any walls have less hit points than 'x'; fortify the walls until all are at least x
    // ---- if now walls have less hit points than 'x'; try the same test, only multiply 'x' by 2
    // ---- keep going on in this fashion...if 'x' starts at 10,000 then...
    //
    // ---- Round1 -- 10k
    // ---- Round2 -- 20k
    // ---- Round3 -- 30k....and so on

    // local variables
    var objRepair;
    var i;

    if (blnEnableLogging_RepairWall) {console.log(creep.name + "[" + creep.memory.role + "] is looking for " + structure_type + " to repair");}

    for ( i = intWallHealthIncrementer; i <= intMaxWallHealth; i = i + intWallHealthIncrementer )
    {
        if (_blnWallsToRepair(creep,i))
        {
            if (blnEnableLogging_RepairWall) {console.log("We have walls to repair that have less than " + i + " hit points");}

            objRepair = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType == structure_type && s.hits < i && s.pos.x != 0 && s.pos.x != 49 && s.pos.y != 0 && s.pos.y != 49
            });
            if (objRepair != undefined)
            {
                if (creep.repair(objRepair) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(objRepair);
                }

                if (blnEnableLogging_RepairWall) {console.log(creep.name + "[" + creep.memory.role + "] is repairing " + objRepair.structureType + " " + objRepair.id + " at location " + objRepair.pos);}
                return true; // exit this function; we found the wall we're going to repair
            }
            else
            {
                return false;
            }

        }
    }
}

function _GetEnergy(creep)
{
    // local variables
    var source;

    if (blnEnableLogging_GetEnergy) {console.log(creep.name + "[" + creep.memory.role + "] has entered the _GetEnergy function");}

    // if creep is a 'harvester' or 'scout_harvester', get energy from a natural source.  If creep is a different role, try
    // getting energy from a container first

    if (creep.memory.role == 'harvester' || creep.memory.role == 'scout_harvester')
    {
        source = creep.pos.findClosestByPath(FIND_SOURCES);
    }
    else
    {
        source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
        });
        if (source == undefined)
        {
            source = creep.pos.findClosestByPath(FIND_SOURCES);
        }
    }

    if (source != undefined)
    {
        if (source.structureType == STRUCTURE_CONTAINER)
        {
            if (creep.withdraw(source,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            {
                if (blnEnableLogging_GetEnergy) {console.log(creep.name + "[" + creep.memory.role + "] needs to move closer to the container at " + source.pos);}
                creep.moveTo(source);
            }
            else
            {
                if (blnEnableLogging_GetEnergy) {console.log(creep.name + "[" + creep.memory.role + "] is filling tank with energy at " + source.pos);}
            }
        }
        else
        {
            if (creep.harvest(source) == ERR_NOT_IN_RANGE)
            {
                if (blnEnableLogging_GetEnergy) {console.log(creep.name + "[" + creep.memory.role + "] needs to move closer to the energy source at " + source.pos);}
                creep.moveTo(source);
            }
            else
            {
                if (blnEnableLogging_GetEnergy) {console.log(creep.name + "[" + creep.memory.role + "] is filling tank with energy at " + source.pos);}
            }
        }
    }
    else
    {
        if (blnEnableLogging_GetEnergy) {console.log(creep.name + "[" + creep.memory.role + "] could not find a path to an energy source");}
    }
}

function _upgrader(creep)
{
    if (blnEnableLogging_upgrader) {console.log(creep.name + "[" + creep.memory.role + "] has entered the _upgrader function");}
    // if creep had been getting energy last tick...
    if (creep.memory.blnGettingEnergy == true)
    {
        // if it's full, stop getting energy and start transferring
        if (creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.blnGettingEnergy = false;
            creep.memory.blnTransferring = true;
        }
        // not full, continue getting energy (or continue traveling to source)
        else
        {
            _GetEnergy(creep)
        }
    }
    // creep had been transferring...
    else
    {
        if (creep.memory.blnTransferring == true)
        {
            // if it's empty; stop transferring and go get energy
            if (creep.carry.energy == 0)
            {
                creep.memory.blnGettingEnergy = true;
                creep.memory.blnTransferring = false;
            }
            // not empty; keep transferring (or continue traveling to controller)
            else
            {
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
                {
                    if (blnEnableLogging_upgrader) {console.log(creep.name + "[" + creep.memory.role + "] is moving towards " + creep.room.controller.structureType + " at " + creep.room.controller.pos);}
                    creep.moveTo(creep.room.controller);
                }
                else
                {
                    if (blnEnableLogging_upgrader) {console.log(creep.name + "[" + creep.memory.role + "] is transferring energy to the " + creep.room.controller.structureType + " at " + creep.room.controller.pos);}
                }
            }
        }
    }
}

function _harvester(creep)
{
    // we have (2) different types of harvesters; the original and the new 'scout harvester'.  The 'scout harvester' performs
    // the same as the regular harvester, with the only caveat being that it harvests it's energy from an adjacent room.  Adding
    // logic to this function so that in the event the creep is a 'scout harvester', it will make sure it's operating in the correct
    // room when gathering / transferring energy

    if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] has entered the _harvester function");}

    // if creep had been getting energy last tick...
    if (creep.memory.blnGettingEnergy == true)
    {
        // if it's full, stop getting energy and start transferring
        if (creep.carry.energy == creep.carryCapacity)
        {
            if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] is full of energy");}

            creep.memory.blnGettingEnergy = false;
            creep.memory.blnTransferring = true;
        }
        // not full, continue getting energy (or continue traveling)
        else
        {
            if (creep.memory.role == 'scout_harvester')
            {
                // am i in the adjacent room?
                if (creep.room.name == strAdjacentRoom)
                {
                    _GetEnergy(creep);
                }
                else
                {
                    // i'm not in the adjacent room; if temporary protection walls aren't blocking me, go there
                    if (Game.map.isRoomProtected(strAdjacentRoom) == false)
                    {
                        if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] need to move to adjacent room " + strAdjacentRoom);}

                        var route = Game.map.findRoute(strHomeRoom,strAdjacentRoom);
                        if (route.length > 0)
                        {
                            var exit = creep.pos.findClosestByRange(route[0].exit);
                            creep.moveTo(exit);
                        }
                        else
                        {
                            if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] has no route to " + strAdjacentRoom);}
                        }
                    }
                    else
                    {
                        if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] can't get to adjacent room " + strAdjacentRoom + "; staying in home base and operating as regular harvester");}

                        // the room is protected -- just act like a regular harvester and get energy from this room
                        _GetEnergy(creep);
                    }
                }
            }
            else
            {
                _GetEnergy(creep);
            }
        }
    }
    // creep had been transferring...
    else
    {
        if (creep.memory.role == 'scout_harvester')
        {

            // Disabling this section temporarily -- until I can better manage my 2nd room -- for now just dump energy into 2nd controller
            /*

            // if creep isn't in home room, move there first
            if (creep.room.name != strHomeRoom)
            {
                if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] need to move to home room " + strHomeRoom);}

                var route = Game.map.findRoute(strAdjacentRoom,strHomeRoom);
                if (route.length > 0)
                {
                    var exit = creep.pos.findClosestByRange(route[0].exit);
                    creep.moveTo(exit);
                }
                else
                {
                    if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] has no route to " + strAdjacentRoom);}
                }
                return; // get out of this function
            }

            */

            _upgrader(creep);
            return; // get out of this function
        }

        if (creep.memory.blnTransferring == true)
        {
            // if it's empty; stop transferring and go get energy
            if (creep.carry.energy == 0)
            {
                if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] out of energy; need to refill");}

                creep.memory.blnGettingEnergy = true;
                creep.memory.blnTransferring = false;
            }
            // not empty; keep transferring (or continue traveling)
            else
            {
                // fill priority:  tower -> spawns -> extensions -> containers -> controller

                // 1.  Tower
                var objTower = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity
                });
                if (objTower != undefined)
                {
                    if (creep.transfer(objTower,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    {
                        if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] moving towards " + STRUCTURE_TOWER + " at " + objTower.pos + " to transfer my energy");}

                        creep.moveTo(objTower);
                    }
                    else
                    {
                        if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] transferring energy to " + STRUCTURE_TOWER + " at " + objTower.pos);}
                    }
                    return; // exit this function; we found the tower we're going to fill up
                }

                // 2.  Spawns -- check all our spawns; if they need energy, go transfer to them
                var objSpawn;

                for (let i in Game.spawns)
                {
                    objSpawn = Game.spawns[i];
                    if (objSpawn.energy < objSpawn.energyCapacity)
                    {
                        if (creep.transfer(objSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                        {
                            if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] moving towards Spawn point at " + objSpawn.pos + " to transfer my energy");}

                            creep.moveTo(objSpawn);
                        }
                        else
                        {
                            if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] transferring energy to Spawn point at " + objSpawn.pos);}
                        }
                        return; // exit this function; we found the spawn we're going to fill up
                    }
                }

                // 3.  Extensions -- check all our extensions; if they need energy, go transfer to them
                var objStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_EXTENSION && s.energy < s.energyCapacity
                });
                if (objStructure != undefined)
                {
                    if (creep.transfer(objStructure,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    {
                        if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] moving towards " + STRUCTURE_EXTENSION + " at " + objStructure.pos + " to transfer my energy");}

                        creep.moveTo(objStructure);
                    }
                    else
                    {
                        if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] transferring energy to " + STRUCTURE_EXTENSION + " at " + objStructure.pos);}
                    }
                    return; // exit this function; we found the extensions we're going to fill up
                }
                else
                {
                    if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] can't find any extensions");}
                }

                // 4.  Containers
                var objContainer = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < s.storeCapacity
                });
                if (objContainer != undefined)
                {
                    if (creep.transfer(objContainer,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    {
                        if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] moving towards " + STRUCTURE_CONTAINER + " at " + objContainer.pos + " to transfer my energy");}

                        creep.moveTo(objContainer);
                    }
                    else
                    {
                        if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] transferring energy to " + STRUCTURE_CONTAINER + " at " + objContainer.pos);}
                    }
                    return; // exit this function; we found the containers we're going to fill up
                }
                else
                {
                    if (blnEnableLogging_harvester) {console.log(creep.name + "[" + creep.memory.role + "] can't find any containers");}
                }

                // 5.  Controller -- if the spawns and extensions are full, dump energy into the controller
                _upgrader(creep);
            }
        }
    }
}

function _builder(creep)
{
    // local variables
    var intContainerReq = 1;
    var intExtensionReq = 2;
    var intExtractorReq = 6;
    var intLabReq = 6;
    var intLinkReq = 5;
    var intNukerReq = 8;
    var intObserverReq = 8;
    var intPowerSpawnReq = 8;
    var intRampartReq = 2;
    var intRoadReq = 1;
    var intSpawnReq = 7;
    var intStorageReq = 4;
    var intTerminalReq = 6;
    var intTowerReq = 3;
    var intWallReq = 2;
    var intControllerLevel;

    if (blnEnableLogging_builder) {console.log(creep.name + "[" + creep.memory.role + "] has entered the _builder function");}

    // if creep had been getting energy last tick...
    if (creep.memory.blnGettingEnergy == true)
    {
        // if it's full, stop getting energy and start building
        if (creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.blnGettingEnergy = false;
            creep.memory.blnBuilding = true;
        }
        // not full, continue getting energy (or continue traveling to source)
        else
        {
            _GetEnergy(creep);
        }
    }
    // creep had been building...
    else
    {
        // if it's empty; stop building and go get energy
        if (creep.carry.energy == 0)
        {
            creep.memory.blnGettingEnergy = true;
            creep.memory.blnBuilding = false;
        }
        // not empty; keep building (or continue traveling to construction site)
        else
        {
            var objConstructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            if (objConstructionSite != undefined)
            {
                // get controller level
                intControllerLevel = creep.room.controller.level;

                // build priority:  nuker -> power spawn -> observer -> spawn -> terminal -> lab -> extractor -> link -> storage -> container -> tower -> rampart -> wall -> road -> extension

                // 1. nuker
                if (intControllerLevel >= intNukerReq && _BuildConstructionSite(creep,STRUCTURE_NUKER) == true) { return; }
                // 2. power spawn
                if (intControllerLevel >= intPowerSpawnReq && _BuildConstructionSite(creep,STRUCTURE_POWER_SPAWN) == true) { return; }
                 // 3. observer
                if (intControllerLevel >= intObserverReq && _BuildConstructionSite(creep,STRUCTURE_OBSERVER) == true) { return; }
                // 4. spawn
                if (intControllerLevel >= intSpawnReq && _BuildConstructionSite(creep,STRUCTURE_SPAWN) == true) { return; }
                // 5. terminal
                if (intControllerLevel >= intTerminalReq && _BuildConstructionSite(creep,STRUCTURE_TERMINAL) == true) { return; }
                // 6. lab
                if (intControllerLevel >= intLabReq && _BuildConstructionSite(creep,STRUCTURE_LAB) == true) { return; }
                 // 7. extractor
                if (intControllerLevel >= intExtractorReq && _BuildConstructionSite(creep,STRUCTURE_EXTRACTOR) == true) { return; }
                // 8. link
                if (intControllerLevel >= intLinkReq && _BuildConstructionSite(creep,STRUCTURE_LINK) == true) { return; }
                // 9. storage
                if (intControllerLevel >= intStorageReq && _BuildConstructionSite(creep,STRUCTURE_STORAGE) == true) { return; }
                // 10. container
                if (intControllerLevel >= intContainerReq && _BuildConstructionSite(creep,STRUCTURE_CONTAINER) == true) { return; }
                // 11. tower
                if (intControllerLevel >= intTowerReq && _BuildConstructionSite(creep,STRUCTURE_TOWER) == true) { return; }
                // 12. rampart
                if (intControllerLevel >= intRampartReq && _BuildConstructionSite(creep,STRUCTURE_RAMPART) == true) { return; }
                // 13. wall
                if (intControllerLevel >= intWallReq && _BuildConstructionSite(creep,STRUCTURE_WALL) == true) { return; }
                // 14. road
                if (intControllerLevel >= intRoadReq && _BuildConstructionSite(creep,STRUCTURE_ROAD) == true) { return; }
                // 15. extension
                if (intControllerLevel >= intExtensionReq && _BuildConstructionSite(creep,STRUCTURE_EXTENSION) == true) {}
            }
            else
            {
                // there are no construction sites; let's go upgrade the controller
                creep.memory.blnBuilding = false;
                creep.memory.blnTransferring = true;
                _upgrader(creep);
            }
        }
    }
}

function _mason(creep)
{
    if (blnEnableLogging_mason) {console.log(creep.name + "[" + creep.memory.role + "] has entered the _mason function");}

    // if creep had been getting energy last tick...
    if (creep.memory.blnGettingEnergy == true)
    {
        // if it's full, stop getting energy and start repairing walls
        if (creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.blnGettingEnergy = false;
            creep.memory.blnMasoning = true;
        }
        // not full, continue getting energy (or continue traveling to source)
        else
        {
            _GetEnergy(creep);
        }
    }
    // creep had been repairing walls...
    else
    {
        // if it's empty; stop repairing walls and go get energy
        if (creep.carry.energy == 0)
        {
            creep.memory.blnGettingEnergy = true;
            creep.memory.blnMasoning = false;
        }
        // not empty; keep repairing walls (or continue traveling to repair site)
        else
        {
            // while under protection, the game spawns temp walls around the perimeter of the room
            // let's filter these out, so that we don't waste energy trying to repair them
            // perimeter:   x == 0 (left wall)
            //              y == 0 (top wall)
            //              x == 49 (right wall)
            //              y == 49 (bottom wall)
            var objRepair = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_WALL && s.hits < intMaxWallHealth && s.pos.x != 0 && s.pos.x != 49 && s.pos.y != 0 && s.pos.y != 49
            });
            if (objRepair != undefined)
            {
                _RepairWall(creep, STRUCTURE_WALL);
            }
            else
            {
                // there are no walls to repair; let's go upgrade the controller
                creep.memory.blnMasoning = false;
                creep.memory.blnBuilding = true;
                _builder(creep);
            }
        }
    }
}

function _repairer(creep)
{
    // local variables
    var intContainerReq = 1;
    var intExtensionReq = 2;
    var intExtractorReq = 6;
    var intLabReq = 6;
    var intLinkReq = 5;
    var intNukerReq = 8;
    var intObserverReq = 8;
    var intPowerSpawnReq = 8;
    var intRampartReq = 2;
    var intRoadReq = 1;
    var intSpawnReq = 7;
    var intStorageReq = 4;
    var intTerminalReq = 6;
    var intTowerReq = 3;
    var intControllerLevel;

    if (blnEnableLogging_repairer) {console.log(creep.name + "[" + creep.memory.role + "] has entered the _repairer function");}
    // if creep had been getting energy last tick...
    if (creep.memory.blnGettingEnergy == true)
    {
        // if it's full, stop getting energy and start repairing
        if (creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.blnGettingEnergy = false;
            creep.memory.blnRepairing = true;
        }
        // not full, continue harvesting (or continue traveling to source)
        else
        {
            _GetEnergy(creep);
        }
    }
    // creep had been repairing...
    else
    {
        // if it's empty; stop repairing and go get energy
        if (creep.carry.energy == 0)
        {
            creep.memory.blnGettingEnergy = true;
            creep.memory.blnRepairing = false;
        }
        // not empty; keep repairing (or continue traveling to repair site)
        else
        {
            var objRepair = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
            });
            if (objRepair != undefined)
            {
                // get controller level
                intControllerLevel = creep.room.controller.level;

                // repair priority:  nuker -> power spawn -> observer -> spawn -> terminal -> lab -> extractor -> link -> storage -> container -> tower -> road -> extension -> rampart

                // 1. nuker
                if (intControllerLevel >= intNukerReq && _RepairStructure(creep,STRUCTURE_NUKER) == true) { return; }
                // 2. power spawn
                if (intControllerLevel >= intPowerSpawnReq && _RepairStructure(creep,STRUCTURE_POWER_SPAWN) == true) { return; }
                // 3. observer
                if (intControllerLevel >= intObserverReq && _RepairStructure(creep,STRUCTURE_OBSERVER) == true) { return; }
                // 4. spawn
                if (intControllerLevel >= intSpawnReq && _RepairStructure(creep,STRUCTURE_SPAWN) == true) { return; }
                // 5. terminal
                if (intControllerLevel >= intTerminalReq && _RepairStructure(creep,STRUCTURE_TERMINAL) == true) { return; }
                // 6. lab
                if (intControllerLevel >= intLabReq && _RepairStructure(creep,STRUCTURE_LAB) == true) { return; }
                // 7. extractor
                if (intControllerLevel >= intExtractorReq && _RepairStructure(creep,STRUCTURE_EXTRACTOR) == true) { return; }
                // 8. link
                if (intControllerLevel >= intLinkReq && _RepairStructure(creep,STRUCTURE_LINK) == true) { return; }
                // 9. storage
                if (intControllerLevel >= intStorageReq && _RepairStructure(creep,STRUCTURE_STORAGE) == true) { return; }
                // 10. container
                if (intControllerLevel >= intContainerReq && _RepairStructure(creep,STRUCTURE_CONTAINER) == true) { return; }
                // 11. tower
                if (intControllerLevel >= intTowerReq && _RepairStructure(creep,STRUCTURE_TOWER) == true) { return; }
                // 12. road
                if (intControllerLevel >= intRoadReq && _RepairStructure(creep,STRUCTURE_ROAD) == true) { return; }
                // 13. extension
                if (intControllerLevel >= intExtensionReq && _RepairStructure(creep,STRUCTURE_EXTENSION) == true) { return; }
                // 14. rampart
                if (intControllerLevel >= intRampartReq && _RepairStructure(creep,STRUCTURE_RAMPART) == true) {}
            }
            else
            {
                // there are no repair sites; let's go upgrade the controller
                creep.memory.blnRepairing = false;
                creep.memory.blnTransferring = true;
                _upgrader(creep);
            }
        }
    }
}

function _settler(creep)
{
    // the settler is used to move to an adjacent room and claim that room's controller for us, thereby making us the owner of the room

    if (blnEnableLogging_settler) {console.log(creep.name + "[" + creep.memory.role + "] has entered the _settler function");}

    // if creep isn't in adjacent room, move there first
    if (creep.room.name != strAdjacentRoom)
    {
        if (blnEnableLogging_settler) {console.log(creep.name + "[" + creep.memory.role + "] need to move to adjacent room " + strAdjacentRoom);}

        var route = Game.map.findRoute(strHomeRoom,strAdjacentRoom);
        if (route.length > 0)
        {
            var exit = creep.pos.findClosestByRange(route[0].exit);
            creep.moveTo(exit);
        }
        else
        {
            if (blnEnableLogging_settler) {console.log(creep.name + "[" + creep.memory.role + "] has no route to " + strAdjacentRoom);}
        }
    }
    else
    {
        // try to claim the controller; if my GCL isn't high enough, reserve it instead
        if (creep.room.controller)
        {
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE)
            {
                if (blnEnableLogging_settler) {console.log(creep.name + "[" + creep.memory.role + "] moving towards controller at " + creep.room.controller.pos);}

                creep.moveTo(creep.room.controller);
            }
            else
            {
                if (creep.claimController(creep.room.controller) == ERR_GCL_NOT_ENOUGH)
                {
                    if (blnEnableLogging_settler) {console.log(creep.name + "[" + creep.memory.role + "] GCL is not high enough to claim controller; reserve it instead");}

                    if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE)
                    {
                        if (blnEnableLogging_settler) {console.log(creep.name + "[" + creep.memory.role + "] moving towards controller at " + creep.room.controller.pos);}

                        creep.moveTo(creep.room.controller);
                    }
                    else
                    {
                        if (blnEnableLogging_settler) {console.log(creep.name + "[" + creep.memory.role + "] reserving controller at " + creep.room.controller.pos);}
                    }
                }
            }
        }
        else
        {
            if (blnEnableLogging_settler) {console.log(creep.name + "[" + creep.memory.role + "] there in no controller in room " + strAdjacentRoom);}
        }
    }
}

module.exports = {

    builder: function(creep)
    {
        _builder(creep);
    },

    harvester: function(creep)
    {
        _harvester(creep);
    },

    mason: function(creep)
    {
        _mason(creep);
    },

    repairer: function(creep)
    {
        _repairer(creep);
    },

    scout_harvester: function(creep)
    {
        _harvester(creep);
    },

    upgrader: function(creep)
    {
        _upgrader(creep);
    },

    settler: function(creep)
    {
        _settler(creep);
    }
};