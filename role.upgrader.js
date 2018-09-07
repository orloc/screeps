function run(creep) {
    // try and fetch resources from the nearest available source
    // go to the least crowded resources when determining where to mine from

    if (creep.memory.upgrading && creep.carry.energy === 0) {
        creep.memory.upgrading = false;
        creep.say('harvesting');
    }
    if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
        creep.memory.upgrading = true;
        creep.say('upgrading');
    }

    if (creep.memory.upgrading) {
        if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller);
        }
    }
    else {
        const sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[3]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[3]);
        }
    }
}

module.exports = {
    run,
    name:"upgrader",
    desiredCount: 4,
    definition: [WORK, MOVE, MOVE, CARRY, CARRY]
};
