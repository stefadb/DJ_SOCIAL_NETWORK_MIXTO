export type DeezerGetTestSuiteTestConfig = {
    picturesFolder?: string;
    deezerApiCallUrl: string;
    apiName: string;
    testApiCallUrl: string;
    entityName: string;
    upsertTestSqlQuery: string;
}

export type ImageUrlFileNameMapping = {
    url: string,
    fileName: string
}