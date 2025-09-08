import app from "../src/server";
import { checkApiSuccessResponse, checkDbUpsert, createOrDeleteTablesOnTestDb, prepareMocksForDeezerResponseAndImages, testPicturesDownload } from "./common_functions";
import { DeezerGetTestSuiteTestConfig } from "./types";
import { DeezerResponseDataItemsArray, DeezerResponseSingleItem } from "../src/deezer_types";
import axios from "axios";

export default function commonDeezerGetTestSuite(testConfig: DeezerGetTestSuiteTestConfig, mockDeezerResponseRaw: DeezerResponseSingleItem | DeezerResponseDataItemsArray, expectedApiSuccessResponse: Object, expectedDbUpsertResult: Record<string, any>[], mockedAxios: jest.Mocked<typeof axios>) {    const deezerApiCallUrl = testConfig.deezerApiCallUrl;
    const apiName = testConfig.apiName;
    const testApiCallUrl = testConfig.testApiCallUrl;
    const entityName = testConfig.entityName;
    const upsertTestSqlQuery = testConfig.upsertTestSqlQuery;

    describe(`GET ${apiName}`, () => {
        //Configurazione dei mock delle API
        beforeEach(async () => {
            await createOrDeleteTablesOnTestDb(undefined, false);
            await createOrDeleteTablesOnTestDb(testConfig.queriesAfterDbInit, true);
            await prepareMocksForDeezerResponseAndImages(mockDeezerResponseRaw, deezerApiCallUrl, mockedAxios);
        });
        afterEach(async () => {
            await createOrDeleteTablesOnTestDb(undefined, false);
            await jest.clearAllMocks();
        });

        //Descrizioni dei test
        
        it(`should return the same ${entityName} that Deezer returns`, async () => {
            await checkApiSuccessResponse(testApiCallUrl, app, expectedApiSuccessResponse);
        });

        it(`should upsert to the db the same ${entityName} that Deezer returns`, async () => {
            await checkDbUpsert(upsertTestSqlQuery, testApiCallUrl, app, expectedDbUpsertResult);
        });
        
        
        if (testConfig.photosIdToDownload !== undefined) {
            it(`should upload the photo/photos that Deezer returns`, async () => { await testPicturesDownload(testConfig.photosIdToDownload, testApiCallUrl, app) });
        }
        
    });
}