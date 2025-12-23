export type Asset = {
    '@id': string;
    createdAt?: number;
    properties: {
        name?: string;
        contenttype?: string;
        type?: string;
        description?: string;
        version?: string;
        createdAt?: string;
    };
    dataAddress?: {
        baseUrl?: string;
    };
}