'use strict';

class MapUI {
    constructor() {
        this.map = null;
        this.currentBounds = [];
        this.tracksEl = document.querySelector('.tracks');
    }

    async ensureInit() {
        if (!this.isMapLoaded) {
            await new Promise(r => {
                const checkForMap = () => {
                    if (!this.map) {
                        setTimeout(checkForMap, 100);
                        return;
                    }
                    r();
                }
                checkForMap();
            });
            this.isMapLoaded = true;
        }

        if (!this.isGeoXmlModuleLoaded) {
            await new Promise(r => {
                Microsoft.Maps.loadModule('Microsoft.Maps.GeoXml', r);
            });
            this.isGeoXmlModuleLoaded = true;
        }
    }

    init() {
        this.map = new Microsoft.Maps.Map('#map-container', {
            disableBirdseye: true,
            enableClickableLogo: false,
            showTrafficButton: false,
            showTermsLink: false,
            disableStreetside: true,
        });
        this.update();
        store.onUpdate(this.update.bind(this));
    }

    async update() {
        await this.ensureInit();

        const tracks = await store.getAllTracks();

        // 1. Refresh the track list in the sidebar.
        this.tracksEl.innerHTML = '';
    
        for (const {id, track} of tracks) {
            const li = this.createTrackEntry(id, track);
            this.tracksEl.appendChild(li);
        }

        // 2. Refresh the map and visible shapes.
        this.map.entities.clear();
        this.currentBounds = [];
    
        for (const {track} of tracks) {
            if (track.visible) {
                await this.displayTrackFromGPXContent(track.content, track.color);
            }
        }
        const bounds = Microsoft.Maps.LocationRect.fromShapes(this.currentBounds.flat());
        this.map.setView({ bounds, padding: 0 });
    }

    createTrackEntry(id, track) {
        const li = document.createElement('li');
        li.classList.add('track');
    
        const nameLabel = document.createElement('div');
        nameLabel.classList.add('name');
        nameLabel.textContent = track.title;
        nameLabel.setAttribute('title', track.date);
        li.appendChild(nameLabel);
    
        const overlayBox = document.createElement('input');
        overlayBox.classList.add('toggle');
        overlayBox.setAttribute('type', 'checkbox');
        overlayBox.setAttribute('title', 'Toggle this track');
        overlayBox.checked = track.visible;
        li.appendChild(overlayBox);
        overlayBox.addEventListener('input', async () => {
            await this.toggleTrackState(id, overlayBox.checked);
        });
    
        const colorInput = document.createElement('input');
        colorInput.classList.add('color');
        colorInput.setAttribute('type', 'color');
        colorInput.setAttribute('value', track.color);
        colorInput.setAttribute('title', 'Change track color');
        li.appendChild(colorInput);
        colorInput.addEventListener('change', async () => {
            await this.updateTrackColor(id, colorInput.value);
        });
    
        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'export';
        li.appendChild(exportBtn);
        exportBtn.addEventListener('click', async () => {
            download(track);
        });
    
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'delete';
        li.appendChild(deleteBtn);
        deleteBtn.addEventListener('click', async () => {
            await store.deleteTrack(id);
        });
    
        return li;
    }

    async toggleTrackState(id, state) {
        await store.setTrackVisibility(id, state);
    }

    async updateTrackColor(id, color) {
        await store.setTrackColor(id, color);
    }

    async showPlaceOnMap(lat, long) {
        await this.ensureInit();
    
        this.map.setView({ center: new Microsoft.Maps.Location(lat, long) });
    }
    
    async displayTrackFromGPXContent(content, color) {
        await this.ensureInit();
    
        let allShapes = [];

        const data = Microsoft.Maps.GeoXml.read(content);
        if (data.shapes) {
            for (const shape of data.shapes) {
                shape.setOptions({strokeColor: color, strokeThickness: 3});
            }
            this.map.entities.push(data.shapes);
            allShapes = data.shapes;
        }
    
        this.currentBounds.push(allShapes);
    }
}

const mapUI = new MapUI();

function download(track) {
    const safeName = generateTrackFileName(track.title);

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(track.content));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function generateTrackFileName(name) {
    return name.replace(/\s+/g, '-') + '.gpx';
}
