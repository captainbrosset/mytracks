'use strict';

const tracksEl = document.querySelector('.tracks');
let map;

function getMap() {
    map = new Microsoft.Maps.Map('#map-container');
    displayTracks();
}

const tracks = [
    'activity_7156173446.gpx',
    'activity_7129487986.gpx',
    'activity_7079829402.gpx',
];

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

function loadTrackToMap(fileName) {
    Microsoft.Maps.loadModule('Microsoft.Maps.GeoXml', function () {
        const layer = new Microsoft.Maps.GeoXmlLayer(fileName, true);
        map.layers.clear();
        map.layers.insert(layer);
    });
}
