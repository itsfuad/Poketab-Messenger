import { describe, test, expect } from '@jest/globals';
import { parse, getBoundary, DemoData } from '../utils/formParser';
describe('Multipart Parser', () => {
    test('should parse the multipart body', () => {
        const { body, boundary } = DemoData();
        const result = parse(body, boundary);
        // You can write assertions to validate the parsed results here
        expect(result.length).toBe(3);
        expect(result[0].name).toBe('uploads[]');
        expect(result[0].filename).toBe('A.txt');
        // Add more assertions as needed
    });
    test('should extract the boundary from the header', () => {
        const header = 'multipart/form-data; boundary=----CustomBoundary123';
        const boundary = getBoundary(header);
        expect(boundary).toBe('----CustomBoundary123');
    });
});
//# sourceMappingURL=formParser.test.js.map