'use strict';

const currentUrl = new URL(document.location);

if (currentUrl.searchParams.has('show_place')) {
    const geoLink = currentUrl.searchParams.get('show_place');
    const place = geoLink.match(/geo:([^,]+),(.+)/);
    if (place && place.length === 3) {
        const latitude = parseFloat(place[1]);
        const longitude = parseFloat(place[2]);

        showPlaceOnMap(latitude, longitude);
    }
}
