'use strict';

class TracksStore {
    constructor() {
        this.init = false;
    }

    async ensureInit() {
        if (this.init) {
            return;
        }
        await localforage.setDriver([localforage.INDEXEDDB]);
        this.init = true;
    }

    async getAllTracks() {
        await this.ensureInit();
        const keys = await localforage.keys();
        return await Promise.all(keys.map(async name => {
            const content = await localforage.getItem(name);
            return {name, content};
        }));
    }

    async addTrack(name, content) {
        await this.ensureInit();
        await localforage.setItem(name, content);
    }
}

const store = new TracksStore();
