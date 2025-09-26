export type DeezerGetTestSuiteTestConfig = {
    deezerApiCallUrl: string;
    apiName: string;
    testApiCallUrl: string;
    entityName: string;
    queriesAfterDbInit?: string[];
    dbUpsertTests: {sqlQuery: string; expectedResult: Record<string, any>[]; entityName: string;}[];
}

export type GetApiTestSuiteTestConfig = {
    testApiCallUrl: string
}[]

export type ImageUrlFileNameMapping = {
    url: string,
    fileName: string
}