//This is a worker thread which is responsible for the boundary detection and sending the data after removing the boundary.
import { parentPort, workerData } from 'worker_threads';
let chunk = workerData.chunk;
//trim the boundary layer from the chunk
const boundary = Buffer.from('\r\n--' + chunk.toString().split('\r\n--')[1].split('\r\n')[0]);
chunk = chunk.slice(boundary.length);
//trim the last boundary layer from the chunk
parentPort?.postMessage({ chunk: chunk.slice(0, chunk.length - boundary.length) });
//# sourceMappingURL=boundaryThread.js.map