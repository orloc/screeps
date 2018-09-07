class BuilderExtension {

    constructor(myRoom, rcl) {
        this.room = myRoom;

        this.rcl = rcl;
        this.cluster_size = 6;
        this.capacity_map = {
            1: 0, 2: 5, 3: 10, 4: 20,
            5: 30, 6: 40, 7: 50, 8: 60
        };
    }

    // search dirs
    // N: 0
    // S: 1
    // E: 2
    // W: 3

    initMemory() {
        if (!this.room.memory.extensions) {
            this.room.memory.extensions = {
                clusters: {},
                search_dir: 0
            };
        }

        this.room.memory.extensions.allowed = this.capacity_map[this.rcl];

        return this;
    }

    build() {
        const clusters = this.room.memory.extensions.clusters;
        let allowed = this.room.memory.extensions.allowed;

        const have = Object.keys(clusters)
            .reduce((carry, x) => carry + clusters[x].length, 0);

        if (allowed === 0) return;

        let toBuild = allowed - have;
        if (toBuild) {
            // if we have old clusters - fill them first and subtract from toBuild
            // if tobuild is empty we done
            const numClusters = this.cluster_size % toBuild;

            for (let clusters = 0; clusters < numClusters; clusters++) {
                const clusterPos = this._getClusterPos(0);
                if (clusterPos === false) {
                    console.log(`Could not find valid placement for extension in ${this.room.name}`);
                    return;
                }

                // find a valid cluster or make one;
                const cKeys = Object.keys(clusters);

                let selectedCluster;
                if(!cKeys.length) {
                    selectedCluster = 0;
                    clusters[selectedCluster] = [];
                } else {
                    selectedCluster = cKeys.length - 1;
                }

                if (clusters[selectedCluster].length === clusterPos.length) {
                    selectedCluster = selectedCluster + 1;
                    clusters[selectedCluster] = [];
                }

                for (let i = 0; i <= toBuild; i++) {
                    if (clusters[selectedCluster].length === clusterPos.length) {
                        console.log('Cluster overflow - trying again in new cluster');
                        this.room.memory.extensions.clusters = clusters;
                        this.room.memory.extensions.allowed = allowed;
                        return
                    }
                    const pos = clusterPos[i];
                    const resp = this.room.createConstructionSite(pos.x, pos.y, STRUCTURE_EXTENSION);

                    switch (resp){
                        case OK:
                            clusters[selectedCluster].push(pos);
                            toBuild = toBuild - 1;
                            allowed = allowed - 1;
                            break;
                        case ERR_RCL_NOT_ENOUGH:
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        this.room.memory.extensions.clusters = clusters;
    }

    _getClusterPos(tries) {
        if (tries === 3) {
            return false;
        }
        const searchDir = this._getDir();
        for(const spawn in Game.spawns) {
            const startPos = Game.spawns[spawn].pos;
            const coords = BuilderExtension._searchClearInDir(searchDir, startPos);

            // check the things out
            const available = coords.filter((i) => {
                const blocks = this.room.lookAt(i.x, i.y);
                for (const b in blocks) {
                    if (blocks[b].type !== 'terrain') return false;
                }
                return true;
            });

            if (coords.length === available.length) {
                return coords;
            }

            return this._getClusterPos(tries + 1);
        }
    }

    static _searchClearInDir(dir, pos) {
        const dirAdjustmentMap = {
            0: {x: 0, y: 2}, //n
            1: {x: 0, y: -2}, //s
            2: {x: 2, y: 0},// e
            3: {x: -2, y: 0}, // w
        };

        const adjustedPos = BuilderExtension._adjustPos(pos, dirAdjustmentMap[dir]);

        return BuilderExtension._getChunkGraph(dir)
            .map((adjustment) => BuilderExtension._adjustPos(adjustedPos, adjustment));
    }

    static _adjustPos(pos, adjustment) {
        let x, y;
        x = pos.x + adjustment.x;
        y = pos.y + adjustment.y;

        return Object.assign({}, pos, {x, y});

    }

    static _getChunkGraph(dir) {
        let map;
        switch (dir) {
            case 0:   // check left right up and diagonlly up including self
                map = [
                    {x: 1, y: 0},
                    {x: -1, y: 0},
                    {x: 0, y: 1},
                    {x: 0, y: 0},
                    {x: 1, y: 1},
                    {x: -1, y: 1},
                ];
                break;

            case 1:
                // check left right down and diagonlly down including self
                map = [
                    {x: 1, y: 0},
                    {x: -1, y: 0},
                    {x: 0, y: -1},
                    {x: 0, y: 0},
                    {x: 1, y: -1},
                    {x: -1, y: -1},
                ];
                break;
            case 2:
                // check up down right and diagonlly right and up / right and down including self
                map = [
                    {x: 0, y: 1},
                    {x: 0, y: -1},
                    {x: 1, y: 0},
                    {x: 0, y: 0},
                    {x: 1, y: 1},
                    {x: 1, y: -1},
                ];
                break;
            case 3:
                // check up down left and diagonlly left and up / right and down including self
                map = [
                    {x: 0, y: 0},
                    {x: -1, y: 0},
                    {x: 0, y: 1},
                    {x: 0, y: -1},
                    {x: -1, y: 1},
                    {x: -1, y: -1},
                ];
                break;
            default:
                return false;
        }

        return map;
    }

    _getDir() {
        const dir = this.room.memory.extensions.search_dir;
        this.room.memory.extensions.search_dir = dir === 3 ? 0 : dir + 1;
        return dir;
    }


}

module.exports = BuilderExtension;
