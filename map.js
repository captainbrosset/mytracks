'use strict';

const tracksEl = document.querySelector('.tracks');
let map;

function getMap() {
    map = new Microsoft.Maps.Map('#map-container');
    // Disable this for now, we'll later add local storage to store added tracks.
    // displayTracks();
}

function displayTracks() {
    tracksEl.innerHTML = '';

    for (const track of tracks) {
        const li = createTrackEntry(track);
        tracksEl.appendChild(li);
    }
}

function createTrackEntry(name) {
    const li = document.createElement('li');
    li.classList.add('track');
    li.textContent = name;

    li.addEventListener('click', () => {
        loadTrackToMap(`tracks/${name}`);
    });

    return li;
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
            map.entities.push(data.shapes);
        }
    });
}
