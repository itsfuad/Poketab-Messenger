/// <reference types="node" />
type Input = {
    filename?: string;
    name?: string;
    type: string;
    data: Buffer;
};
/**
 * Parses a multipart body buffer and extracts the parts based on the provided boundary.
 *
 * @param {Buffer} multipartBodyBuffer - The multipart body buffer.
 * @param {string} boundary - The boundary string.
 * @returns {Input[]} An array of extracted parts.
 */
export declare function parse(multipartBodyBuffer: Buffer, boundary: string): Input[];
/**
 * Extracts the boundary string from the Content-Type header.
 *
 * @param {string} header - The Content-Type header.
 * @returns {string} The extracted boundary string.
 */
export declare function getBoundary(header: string | undefined): string;
export {};
