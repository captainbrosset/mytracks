import localforage from "localforage";

class TracksStore {
    constructor() {
        this.init = false;
        this.listeners = [];
    }

    static id() {
        return 'id-' + Date.now();
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
        return await Promise.all(keys.map(async id => {
            const track = await localforage.getItem(id);
            return {id, track};
        }));
    }

    async addTrack(content, date, title) {
        await this.ensureInit();

        const id = TracksStore.id();
        await localforage.setItem(id, {
            content,
            date,
            title,
            visible: false,
            color: '#FF0000',
        });
        this.callListeners();
    }

    async deleteTrack(id) {
        await this.ensureInit();
        await localforage.removeItem(id);
        this.callListeners();
    }

    async setTrackColor(id, color) {
        await this.ensureInit();
        const track = await localforage.getItem(id);
        track.color = color;
        await localforage.setItem(id, track);
        this.callListeners();
    }

    async setTrackVisibility(id, visible) {
        await this.ensureInit();
        const track = await localforage.getItem(id);
        track.visible = visible;
        await localforage.setItem(id, track);
        this.callListeners();
    }

    async setAllTracksVisibility(visible) {
        await this.ensureInit();
        for (const {id, track} of await this.getAllTracks()) {
            track.visible = visible;
            await localforage.setItem(id, track);
        }
        this.callListeners();
    }

    onUpdate(cb) {
        this.listeners.push(cb);
    }

    callListeners() {
        this.listeners.forEach(cb => cb());
    }
}

export const store = new TracksStore();
