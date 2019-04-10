const RoomBuilder = require('./builder.room');

const roles = [
    require('./role.harvester'),
    require('./role.builder'),
    require('./role.upgrader'),
].reduce((carry, val) => {
    carry[val.name] = val;
    return carry;
}, {});


/*
 * Make abstract builder with
 */

module.exports.loop = function () {
    clearMemory();
    // for all the rooms we have lay them out
    for (const name in Game.rooms) {
        const rcl = Game.rooms[name].controller.level;
        adjustPopulation(Game.rooms[name], rcl);

        const builder = new RoomBuilder(name, rcl);
        builder.build()
    }


    doWork();

 //   console.log("CPU:",Game.cpu.getUsed())
};

function clearMemory() {
    for (const name in Memory.creeps) {
        if (!Memory.creeps.hasOwnProperty(name)) {
            continue;
        }

        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
}

function clearStructures() {
    Object.keys(Game.constructionSites).map((cs) => {
        Game.constructionSites[cs].remove();
    });
}


function getBuildCost(body) {
    return body.reduce((cost, part) => {
        return cost + BODYPART_COST[part];
    }, 0)
}

function spawnUnit(role, energyStructures, spawnPoint) {
    const ts = new Date().getTime().toString();
    const name = `${role.name}:${ts}`;
    const resp = spawnPoint.spawnCreep(role.definition, name, {
        energyStructures,
        memory: {
            unitName: name,
            role: role.name
        },
    });

    switch (resp) {
        case OK:
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            const cost = getBuildCost(role.definition);
            console.log(`Not enough energy with ${cost}`);
            break;
        case ERR_NAME_EXISTS:
            return spawnUnit(role, spawnPoint, count + 1);
        default:
            console.log(`Got response ${resp}`);
    }
}

function adjustPopulation(room, rcl) {
    let percentRoles = determineMostNeededUnit();

    // no construction sites - no need for builders
    if (Object.keys(Game.constructionSites).length === 0 || rcl < 2) {
        percentRoles = percentRoles.filter((r) => r.role !== "builder")
    }

    const energyStructures = Object.keys(Game.structures)
        .filter((s) =>
            Game.structures[s].structureType === STRUCTURE_EXTENSION
            || Game.structures[s].structureType === STRUCTURE_SPAWN
        )
        .map((s) => Game.structures[s]);

    // for all the spawns - see if we can spawn units to fill in our requirement gaps
    for (const spawn in Game.spawns) {
        if (!Game.spawns.hasOwnProperty(spawn)) {
            continue;
        }

        const mostNeeded = percentRoles.shift();
        const ref = Game.spawns[spawn];

        if (ref.spawning) {
            continue;
        }

        const role = roles[mostNeeded.role];
        const cost = getBuildCost(role.definition);

        if (mostNeeded.percentFull >= 100 || cost > room.energyAvailable) {
            return
        }

        console.log(`Selected ${mostNeeded.role} with ${mostNeeded.percentFull}% fulfilment for production @ ${ref.name}`);

        spawnUnit(roles[mostNeeded.role], energyStructures, ref);
    }
}

function determineMostNeededUnit() {
    // get population distribution
    let totalPop = Object
        .keys(Game.creeps)
        .reduce((carry, c) => {
            const creep = Game.creeps[c];
            const cRole = creep.memory.role;
            if (!carry[cRole] && roles[cRole]) {
                carry[cRole] = {
                    role: cRole,
                    data: [1],
                    desired: roles[cRole].desiredCount,
                };
            } else {
                if (roles[cRole]){
                    carry[cRole].data.push(1);
                }
            }

            return carry;
        }, {});

    const percentRoles = [];

    for (const cat in totalPop) {
        const considering = totalPop[cat];
        const diff = Math.round((totalPop[cat].data.length / considering.desired) * 100);
        percentRoles.push(Object.assign(considering, {percentFull: diff}));
    }

    const roleKeys = Object.keys(roles);

    if (percentRoles.length < roleKeys.length) {
        const mapped = percentRoles.map((r) => r.role).reduce((carry, r) => {
            carry[r] = true;
            return carry;
        }, {});

        for (const key in roles) {
            if (!mapped[key] && roles[key]) {
                percentRoles.push({
                    role: key,
                    percentFull: 0,
                    desired: roles[key].desiredCount,
                });
            }
        }
    }

    percentRoles.sort((a, b) => {
        return a.percentFull - b.percentFull;
    });

    return percentRoles;
}

function doWork() {
    for (const name in Game.creeps) {
        if (!Game.creeps.hasOwnProperty(name)) {
            continue
        }

        const creep = Game.creeps[name];
        if (!creep.memory || !creep.memory.role) {
            const roleName = name.toLowerCase().replace(/\d/, '');
            if (!roles[roleName]) {
                console.log('no valid role for ' + name);
                delete(roles[roleName]);
                return;
            }
            creep.memory.role = roleName;
        }

        roles[creep.memory.role].run(creep);
    }
}
