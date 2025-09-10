export type DeezerGetTestSuiteTestConfig = {
    deezerApiCallUrl: string;
    apiName: string;
    testApiCallUrl: string;
    entityName: string;
    queriesAfterDbInit?: string[];
    photosIdToDownload?: { [picturesFolder: string]: number[]};
    dbUpsertTests: {sqlQuery: string; expectedResult: Record<string, any>[]; entityName: string;}[];
}

export type ImageUrlFileNameMapping = {
    url: string,
    fileName: string
}