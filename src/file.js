import { store } from "./storage";

if ('launchQueue' in window) {
    console.log('File handling API is supported!');

    launchQueue.setConsumer((launchParams) => {
        // Nothing to do when the queue is empty.
        if (!launchParams.files.length) {
            return;
        }
        // Handle the first file only.
        handleFileFromFileHandlingAPI(launchParams.files[0]);
    });
} else {
    console.error('File handling API is not supported!');
}

async function handleFileFromFileHandlingAPI(fileHandle) {
    console.log(`Opening ${fileHandle.name}`);

    const blob = await fileHandle.getFile();
    blob.handle = fileHandle;

    const contents = await blob.text();

    await addFile(contents);
}

document.querySelector('.import-button').addEventListener('change', handleFileFromFileInputField);

function handleFileFromFileInputField(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = async e => {
        await addFile(e.target.result);
    };
    reader.readAsText(file);
}

async function addFile(contents) {
    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(contents, "application/xml");

    const timeEl = parsedDoc.querySelector('metadata time');
    const date = timeEl ? new Date(timeEl.textContent) : null;
    const title = parsedDoc.querySelector('trk name').textContent;

    await store.addTrack(contents, date, title);
}
