
class BuilderUtils {
    static _getSearchPath(from, to) {
        const paths = PathFinder.search(from, {
            pos: to,
            range: 1
        });

        if (paths.incomplete) {
            console.log(`Could not find viable path to ${target}`);
            return null
        }
        return paths.path
    }

    static _getSquareMap(pos, map) {
        return [
            {x: pos.x + 1, y: pos.y},
            {x: pos.x - 1, y: pos.y},
            {x: pos.x, y: pos.y + 1},
            {x: pos.x, y: pos.y - 1},
            {x: pos.x + 1, y: pos.y + 1},
            {x: pos.x - 1, y: pos.y - 1},
            {x: pos.x - 1, y: pos.y + 1},
            {x: pos.x + 1, y: pos.y - 1},
        ].filter((i) =>  map[i.x][i.y]  !== 'wall');
    }

}

module.exports = BuilderUtils;
