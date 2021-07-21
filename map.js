'use strict';

const tracksEl = document.querySelector('.tracks');

let map;

function getMap() {
    map = new Microsoft.Maps.Map('#map-container');
    displayTracks();
}

async function displayTracks() {
    tracksEl.innerHTML = '';

    const tracks = await store.getAllTracks();
    for (const track of tracks) {
        const li = createTrackEntry(track);
        tracksEl.appendChild(li);
    }
}

function createTrackEntry(track) {
    const li = document.createElement('li');
    li.classList.add('track');
    li.textContent = track.name;

    li.addEventListener('click', () => {
        displayTrackFromGPXContent(track.content);
    });

    return li;
}

function clearMap() {
    map.entities.clear();
}

function displayTrackFromGPXContent(content) {
    // When opening a file from the disk, the queue consumer gets called earlier than the map initialization logic.
    // So we need to wait here for the map to be ready before proceeding.
    if (!map) {
        setTimeout(() => {
            displayTrackFromGPXContent(content);
        }, 100);
        return;
    }

    Microsoft.Maps.loadModule('Microsoft.Maps.GeoXml', function () {
        const data = Microsoft.Maps.GeoXml.read(content);

        map.entities.clear();
        if (data.shapes) {
            clearMap();
            const name = data.shapes[0].metadata.title;
            map.setView({bounds: data.summary.bounds, padding: 0});
            map.entities.push(data.shapes);
            store.addTrack(name, content);
        }
    });
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

    map.setView({center: new Microsoft.Maps.Location(lat, long)});
}
