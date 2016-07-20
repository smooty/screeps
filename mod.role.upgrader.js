/*
 An upgrader should be either:

 'blnHarvesting'    -- gathering energy from source (includes traveling to the source)
 'blnTransferring'  -- moving energy from itself to controller (includes traveling to controller)
 */

module.exports = {

    run: function(creep)
    {
        // creep had been harvesting last tick...
        if (creep.memory.blnHarvesting == true)
        {
            // if it's full, stop harvesting and start transferring
            if (creep.carry.energy == creep.carryCapacity)
            {
                creep.memory.blnHarvesting = false;
                creep.memory.blnTransferring = true;
            }
            // not full, continue harvesting (or continue traveling to source)
            else
            {
                var source = creep.pos.findClosestByPath(FIND_SOURCES);

                if (creep.harvest(source) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(source);
                }
            }
        }
        // creep had been transferring...
        else
        {
            if (creep.memory.blnTransferring == true)
            {
                // if it's empty; stop transferring and start harvesting
                if (creep.carry.energy == 0)
                {
                    creep.memory.blnHarvesting = true;
                    creep.memory.blnTransferring = false;
                }
                // not empty; keep transferring (or continue traveling to spawn)
                else
                {
                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(creep.room.controller);
                    }
                }
            }
        }
    }
};