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
    map.entities.push(data.shapes);
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
            store.addTrack(name, content);
        }
    });
}
