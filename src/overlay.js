import { debounce } from "./utils";

if ('windowControlsOverlay' in navigator) {
    document.documentElement.classList.toggle('has-control-overlay', navigator.windowControlsOverlay.visible);

    navigator.windowControlsOverlay.ongeometrychange = debounce((e) => {
        document.documentElement.classList.toggle('has-control-overlay', navigator.windowControlsOverlay.visible);
    }, 250);
}
