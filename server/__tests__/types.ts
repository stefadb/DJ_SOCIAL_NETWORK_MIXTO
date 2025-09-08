export type DeezerGetTestSuiteTestConfig = {
    picturesFolder?: string;
    deezerApiCallUrl: string;
    apiName: string;
    testApiCallUrl: string;
    entityName: string;
    upsertTestSqlQuery: string;
    queriesAfterDbInit?: string[];
    photosIdToDownload?: { [picturesFolder: string]: number[]};
}

export type ImageUrlFileNameMapping = {
    url: string,
    fileName: string
}