'use strict';

if ('launchQueue' in window) {
    console.log('File handling API is supported!');

    launchQueue.setConsumer((launchParams) => {
        // Nothing to do when the queue is empty.
        if (!launchParams.files.length) {
            return;
        }
        // Handle the first file only.
        handleOpenFile(launchParams.files[0]);
    });
} else {
    console.error('File handling API is not supported!');
}

async function handleOpenFile(fileHandle) {
    console.log(`Opening ${fileHandle.name}`);

    const blob = await fileHandle.getFile();
    blob.handle = fileHandle;

    const contents = await blob.text();

    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(contents, "application/xml");

    const date = new Date(parsedDoc.querySelector('metadata time').textContent);
    const title = parsedDoc.querySelector('trk name').textContent;

    store.addTrack(contents, date, title);
}
