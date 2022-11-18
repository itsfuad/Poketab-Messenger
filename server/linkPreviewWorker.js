const getMetaData = require('metadata-scraper');
const { parentPort, workerData } = require('worker_threads');

async function run(url) {
	const data = await getMetaData(url)
    return data;
}

run(workerData.url).then((data) => {
    parentPort.postMessage(data);
});