const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

if ('windowControlsOverlay' in navigator) {
    document.documentElement.classList.toggle('has-control-overlay', navigator.windowControlsOverlay.visible);

    navigator.windowControlsOverlay.ongeometrychange = debounce((e) => {
        document.documentElement.classList.toggle('has-control-overlay', navigator.windowControlsOverlay.visible);
    }, 250);
}