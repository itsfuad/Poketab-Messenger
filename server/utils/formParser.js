var ParsingState;
(function (ParsingState) {
    ParsingState[ParsingState["INIT"] = 0] = "INIT";
    ParsingState[ParsingState["READING_HEADERS"] = 1] = "READING_HEADERS";
    ParsingState[ParsingState["READING_DATA"] = 2] = "READING_DATA";
    ParsingState[ParsingState["READING_PART_SEPARATOR"] = 3] = "READING_PART_SEPARATOR";
})(ParsingState || (ParsingState = {}));
/**
 * Parses a multipart body buffer and extracts the parts based on the provided boundary.
 *
 * @param {Buffer} multipartBodyBuffer - The multipart body buffer.
 * @param {string} boundary - The boundary string.
 * @returns {Input[]} An array of extracted parts.
 */
export function parse(multipartBodyBuffer, boundary) {
    let lastline = '';
    let contentDispositionHeader = '';
    let contentTypeHeader = '';
    let state = ParsingState.INIT;
    let buffer = [];
    const allParts = [];
    let currentPartHeaders = [];
    for (let i = 0; i < multipartBodyBuffer.length; i++) {
        const oneByte = multipartBodyBuffer[i];
        const prevByte = i > 0 ? multipartBodyBuffer[i - 1] : null;
        const newLineDetected = oneByte === 0x0a && prevByte === 0x0d;
        const newLineChar = oneByte === 0x0a || oneByte === 0x0d;
        if (!newLineChar)
            lastline += String.fromCharCode(oneByte);
        if (state === ParsingState.INIT && newLineDetected) {
            // searching for boundary
            if ('--' + boundary === lastline) {
                state = ParsingState.READING_HEADERS; // found boundary, start reading headers
            }
            lastline = '';
        }
        else if (state === ParsingState.READING_HEADERS && newLineDetected) {
            // parsing headers
            if (lastline.length) {
                currentPartHeaders.push(lastline);
            }
            else {
                // found empty line, search for the headers we want and set the values
                for (const h of currentPartHeaders) {
                    if (h.toLowerCase().startsWith('content-disposition:')) {
                        contentDispositionHeader = h;
                    }
                    else if (h.toLowerCase().startsWith('content-type:')) {
                        contentTypeHeader = h;
                    }
                }
                state = ParsingState.READING_DATA;
                buffer = [];
            }
            lastline = '';
        }
        else if (state === ParsingState.READING_DATA) {
            // parsing data
            if (lastline.length > boundary.length + 4) {
                lastline = ''; // memory save
            }
            if ('--' + boundary === lastline) {
                const j = buffer.length - lastline.length;
                const part = buffer.slice(0, j - 1);
                allParts.push(processPart({ contentDispositionHeader, contentTypeHeader, part }));
                buffer = [];
                currentPartHeaders = [];
                lastline = '';
                state = ParsingState.READING_PART_SEPARATOR;
                contentDispositionHeader = '';
                contentTypeHeader = '';
            }
            else {
                buffer.push(oneByte);
            }
            if (newLineDetected) {
                lastline = '';
            }
        }
        else if (state === ParsingState.READING_PART_SEPARATOR) {
            if (newLineDetected) {
                state = ParsingState.READING_HEADERS;
            }
        }
    }
    return allParts;
}
/**
 * Extracts the boundary string from the Content-Type header.
 *
 * @param {string} header - The Content-Type header.
 * @returns {string} The extracted boundary string.
 */
export function getBoundary(header) {
    if (!header) {
        return '';
    }
    const items = header.split(';');
    if (items.length > 1) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i].trim();
            if (item.indexOf('boundary') >= 0) {
                const k = item.split('=');
                return k[1].trim().replace(/^["']|["']$/g, '');
            }
        }
    }
    return '';
}
/**
 * Processes a part and transforms it into Input format.
 *
 * @param {Part} part - The part to process.
 * @returns {Input} Processed input.
 */
function processPart(part) {
    const obj = function (str) {
        const k = str.split('=');
        const a = k[0].trim();
        const b = JSON.parse(k[1].trim());
        const o = {};
        Object.defineProperty(o, a, {
            value: b,
            writable: true,
            enumerable: true,
            configurable: true,
        });
        return o;
    };
    const header = part.contentDispositionHeader.split(';');
    const filenameData = header[2];
    let input = {};
    if (filenameData) {
        input = obj(filenameData);
        const contentType = part.contentTypeHeader.split(':')[1].trim();
        Object.defineProperty(input, 'type', {
            value: contentType,
            writable: true,
            enumerable: true,
            configurable: true,
        });
    }
    Object.defineProperty(input, 'name', {
        value: header[1].split('=')[1].replace(/"/g, ''),
        writable: true,
        enumerable: true,
        configurable: true,
    });
    Object.defineProperty(input, 'data', {
        value: Buffer.from(part.part),
        writable: true,
        enumerable: true,
        configurable: true,
    });
    return input;
}
