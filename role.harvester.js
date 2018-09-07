function run(creep){
    // spread the harvesters over resources in the room evenly
    // store resource location to avoid mapped lookup
    // handle droppping resouces in a full container


    const sources = creep.room.find(FIND_SOURCES);
    if(creep.carry.energy < creep.carryCapacity) {
        
        if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
        return;
    }

    const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_EXTENSION ||
                structure.structureType === STRUCTURE_SPAWN ||
                structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
    });

    if(targets.length > 0) {
        if(creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0]);
        }
    }
}

module.exports ={
    run,
    name: 'harvester',
    desiredCount: 5,
    definition: [WORK, MOVE, MOVE, CARRY, CARRY],
};

