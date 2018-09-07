const ROLE_BUILDER = 'builder';
function run(creep) {
    // implement upgrading logic
    // assign 80% of workforce to upgrade - the rest can build
    // use the same least crowded logic for harvesting

    if (creep.memory.building && creep.carry.energy === 0) {
        creep.memory.building = false;
        creep.say('harvesting');
    }
    if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
        creep.memory.building = true;
        creep.say('building');
    }

    if (creep.memory.building) {
        const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
            if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        }
    }
    else {
        const sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[1]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[1]);
        }
    }
}

module.exports = {
    run,
    name: ROLE_BUILDER,
    desiredCount: 10,
    definition: [WORK, MOVE, MOVE, CARRY, CARRY]
};


