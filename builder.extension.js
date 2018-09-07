class BuilderExtension {
    constructor(myRoom, rcl) {
        this.room = myRoom;
    }

    initMemory(){
        if (!this.room.memory.extensions) {
            this.room.memory.extensions = {
                locations: []
            };
        }

        return this;
    }

    build() {
    }



}

module.exports = BuilderExtension;
