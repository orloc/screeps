const RoadManager = require('./builder.road');
const ExtensionManager = require('./builder.extension');

class BuilderRoom {
    constructor(myRoom, rcl) {
        // is this a real room?
        this.room = Game.rooms[myRoom];
        this.managers = [];

        if (!this.room.memory.map) {
            this._mapRoom();
            console.log(`Generating grid for ${this.room.name}.`);
        }

        if (!this.room.memory.sources) {
            this._mapSources();
        }

        this.managers.push(new ExtensionManager(this.room, rcl));
        this.managers.push(new RoadManager(this.room, rcl))

    }


    build() {
        this.managers.map((m) => m.initMemory().build())
    }

    _mapSources() {
        const targets = this.room.find(FIND_SOURCES);
    }

    _mapRoom() {
        const map = [];

        for (let x = 0; x < 50; x++) {
            map[x] = [];
            for (let y = 0; y < 50; y++) {
                const res = Game.map.getTerrainAt(x, y, this.room.name);
                map[x].push(res);
            }
        }

        this.room.memory = Object.assign(this.room.memory, { map });
    }

}

module.exports = BuilderRoom;
