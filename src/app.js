// Import the various entry points that aren't imported otherwise.
import './sw-register';
import './overlay';
import { mapUI } from './map';
import './file';
import './routing';

addEventListener('load', () => {
    mapUI.init();
});
