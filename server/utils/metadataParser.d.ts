export declare function getLinkMetadata(message: string): Promise<{
    success: boolean;
    data: {
        title: string;
        description: string;
        image: string;
        url: string;
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    data?: undefined;
}>;
