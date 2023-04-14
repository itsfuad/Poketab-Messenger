import getMetaData from 'metadata-scraper';
import { parentPort, workerData } from 'worker_threads';

async function run(url: string) {
	const data = await getMetaData(url)
    return data;
}

run(workerData.url).then((data) => {
    parentPort?.postMessage(data);
});