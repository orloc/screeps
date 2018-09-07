const utils = require('./builder.utils');

class BuilderRoad {

    constructor(myRoom) {
        this.room = myRoom;
        this.initMemory();
    }

    static _generateRoads(room) {
        let roads = [];
        const toPos = {};
        const controllerPos = room.controller.pos;

        // box all the spawns
        for (const spawn in Game.spawns) {
            const pos = Game.spawns[spawn].pos;
            toPos[spawn] = pos;
            roads = roads.concat(utils._getSquareMap(pos));

            // from spawn to sources
            room.find(FIND_SOURCES).map((s) => {
                roads = roads.concat(utils._getSearchPath(pos, s.pos));
            });
        }

        // add the controller
        roads = roads.concat(utils._getSquareMap(controllerPos));

        // from controller to spawns
        for (const target in toPos) {
            const paths = utils._getSearchPath(controllerPos, toPos[target]);
            roads = roads.concat(paths);
        }

        const dedup = roads.reduce((carry, r) => {
            const key = `${r.x}::${r.y}`;
            carry[key] = { x: r.x, y : r.y };
            return carry;
        }, {});

        return Object.keys(dedup).map((k) => dedup[k]);
    }

    static _doBuildroads(coords, room) {
        coords.map((c) => {
            const item = Game.map.getTerrainAt(c.x, c.y, room.name);
            if (item !== 'wall') {
                const resp = room.createConstructionSite(c.x, c.y, STRUCTURE_ROAD);
                switch (resp) {
                    case OK:
                        break;
                    case ERR_INVALID_TARGET:
                        //console.log(`Invalid build target at ${c.x}, ${c.y}`);
                        break;
                    case ERR_FULL:
                        break;
                    default:
                }
            }
        });
    }

    static _hasRoadToBuild(mem) {
        if (mem.current_roads < mem.generated_roads.length) {
            // if we cannot do anything dont try
            return mem.roads_building.length < 100;
        }
        return false;
    }

    initMemory() {
        if (!this.room.memory.roads) {
            this.room.memory.roads = {};
        }

        const roadMem = this.room.memory.roads;

        if (!roadMem.generated_roads) {
            console.log(`Generating roads.`);
            roadMem.generated_roads = BuilderRoad._generateRoads(this.room);
        }

        const currentRoads = Object.keys(this.room.find(FIND_STRUCTURES, {
            filter: {structureType: STRUCTURE_ROAD}
        }));

        roadMem.roads_building = Object.keys(Game.constructionSites)
            .filter((cs) =>
                Game.constructionSites[cs].room.name === this.room.name
                && Game.constructionSites[cs]._my
                && Game.constructionSites[cs].structureType === STRUCTURE_ROAD
            );

        roadMem.current_roads = currentRoads.length + roadMem.roads_building.length;

        this.room.memory.roads = roadMem;

        return this;
    }

    build() {
        const mem = this.room.memory.roads;

        if (!BuilderRoad._hasRoadToBuild(mem)) {
            return;
        }

        const canBuild = Math.min(mem.generated_roads.length, 100) - mem.roads_building.length;

        if (canBuild === 0) {
            return;
        }

        const last = mem.current_roads
            ? mem.current_roads
            : 0;

        const next = Math.min(last + canBuild, mem.generated_roads.length);

        const toBuild = mem.generated_roads.slice(last, next-1);

        console.log(toBuild[0].x, toBuild[0].y);

        BuilderRoad._doBuildroads(toBuild, this.room);
    }
}

module.exports = BuilderRoad;
