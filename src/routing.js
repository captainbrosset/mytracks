import { mapUI } from "./map";

const currentUrl = new URL(document.location);

if (currentUrl.searchParams.has('show_place')) {
    const geoLink = currentUrl.searchParams.get('show_place');
    const place = geoLink.match(/geo:([^,]+),(.+)/);
    if (place && place.length === 3) {
        const latitude = parseFloat(place[1]);
        const longitude = parseFloat(place[2]);

        mapUI.showPlaceOnMap(latitude, longitude);
    }
}

if (currentUrl.searchParams.has('show_all')) {
    const isVisible = currentUrl.searchParams.get('show_all') === 'true';
    mapUI.toggleAllTrackStates(isVisible);
}
