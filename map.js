'use strict';

const tracksEl = document.querySelector('.tracks');

let map;
function getMap() {
    map = new Microsoft.Maps.Map('#map-container', {
        disableBirdseye: true,
        enableClickableLogo: false,
        showTrafficButton: false,
        showTermsLink: false,
        disableStreetside: true,
    });
    refreshStoredTrackList();
}

async function refreshStoredTrackList() {
    tracksEl.innerHTML = '';

    const tracks = await store.getAllTracks();
    for (const track of tracks) {
        const li = createTrackEntry(track);
        tracksEl.appendChild(li);
    }
}

const MAP_STATE = {
    tracks: {}
};

function toggleTrackState(track, state) {
    if (!MAP_STATE.tracks[track.name]) {
        MAP_STATE.tracks[track.name] = {
            content: track.content,
        };
    }

    MAP_STATE.tracks[track.name].state = state;

    refreshDisplayedTracks();
}

function updateTrackColor(track, color) {
    if (!MAP_STATE.tracks[track.name]) {
        MAP_STATE.tracks[track.name] = {
            content: track.content,
            state: false,
        };
    }

    MAP_STATE.tracks[track.name].color = color;

    refreshDisplayedTracks();
}

function createTrackEntry(track) {
    const li = document.createElement('li');
    li.classList.add('track');

    const nameLabel = document.createElement('div');
    nameLabel.classList.add('name');
    nameLabel.textContent = track.name;
    li.appendChild(nameLabel);

    const overlayBox = document.createElement('input');
    overlayBox.classList.add('toggle');
    overlayBox.setAttribute('type', 'checkbox');
    overlayBox.setAttribute('title', 'Toggle this track');
    li.appendChild(overlayBox);
    overlayBox.addEventListener('input', () => {
        toggleTrackState(track, overlayBox.checked);
    });

    const colorInput = document.createElement('input');
    colorInput.classList.add('color');
    colorInput.setAttribute('type', 'color');
    colorInput.setAttribute('value', '#FF0000');
    colorInput.setAttribute('title', 'Change track color');
    li.appendChild(colorInput);
    colorInput.addEventListener('input', () => {
        updateTrackColor(track, colorInput.value);
    });

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'export';
    li.appendChild(exportBtn);
    exportBtn.addEventListener('click', async () => {
        download(generateTrackFileName(track.name), track.content);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'delete';
    li.appendChild(deleteBtn);
    deleteBtn.addEventListener('click', async () => {
        await store.deleteTrack(track.name);
        await refreshStoredTrackList();
    });

    return li;
}

function refreshDisplayedTracks() {
    clearMap();

    const combinedShapes = [];
    for (const name in MAP_STATE.tracks) {
        if (MAP_STATE.tracks[name].state) {
            combinedShapes.push(displayTrackFromGPXContent(MAP_STATE.tracks[name].content, MAP_STATE.tracks[name].color));
        }
    }
    const bounds = Microsoft.Maps.LocationRect.fromShapes(combinedShapes.flat());
    map.setView({ bounds, padding: 0 });
}

function clearMap() {
    map.entities.clear();
}

function displayTrackFromGPXContent(content, color) {
    // When opening a file from the disk, the queue consumer gets called earlier than the map initialization logic.
    // So we need to wait here for the map to be ready before proceeding.
    if (!map) {
        setTimeout(() => {
            displayTrackFromGPXContent(content);
        }, 100);
        return;
    }

    let allShapes = [];
    Microsoft.Maps.loadModule('Microsoft.Maps.GeoXml', function () {
        const data = Microsoft.Maps.GeoXml.read(content);
        if (data.shapes) {
            for (const shape of data.shapes) {
                shape.setOptions({strokeColor: color || 'red'});
            }
            map.entities.push(data.shapes);
            allShapes = data.shapes;
            
            // FIXME: this does not belong here.
            const name = data.shapes[0].metadata.title;
            store.addTrack(name, content);
        }
    });

    return allShapes;
}

function showPlaceOnMap(lat, long) {
    // When we're opened from a protocol handler, the map might not have been init yet. Wait for it.
    // FIXME: need to find something better as this keeps coming up.
    if (!map) {
        setTimeout(() => {
            showPlaceOnMap(lat, long);
        }, 100);
        return;
    }

    map.setView({ center: new Microsoft.Maps.Location(lat, long) });
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function generateTrackFileName(name) {
    return name.replace(/\s+/g, '-') + '.gpx';
}
