export declare const fileStore: Map<string, {
    filename: string;
    key: string;
    ext: string;
    uids: Set<string>;
}>;
export declare function store(messageId: string, data: {
    filename: string;
    key: string;
    ext: string;
    uids: Set<string>;
}): void;
export declare function deleteFileStore(messageId: string): void;
declare const router: import("express-serve-static-core").Router;
export default router;
