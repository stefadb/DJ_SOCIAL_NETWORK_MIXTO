import app from "../src/server";
import { checkApiSuccessResponse, checkDbUpsert, createOrDeleteTablesOnTestDb, prepareMocksForDeezerResponseAndImages, testPicturesDownload } from "./common_functions";
import { DeezerGetTestSuiteTestConfig } from "./types";
import { DeezerResponseMultipleItems, DeezerResponseSingleItem } from "../src/types";
import axios from "axios";

export default function commonDeezerGetTestSuite(testConfig: DeezerGetTestSuiteTestConfig, mockDeezerResponseRaw: DeezerResponseSingleItem | DeezerResponseMultipleItems, expectedApiSuccessResponse: Object, expectedDbUpsertResult: Record<string, any>[], mockedAxios: jest.Mocked<typeof axios>) {
    const picturesFolder = testConfig.picturesFolder;
    const deezerApiCallUrl = testConfig.deezerApiCallUrl;
    const apiName = testConfig.apiName;
    const testApiCallUrl = testConfig.testApiCallUrl;
    const entityName = testConfig.entityName;
    const upsertTestSqlQuery = testConfig.upsertTestSqlQuery;

    describe(`GET ${apiName}`, () => {
        //Configurazione dei mock delle API
        beforeEach(async () => {
            await createOrDeleteTablesOnTestDb(false, false);
            await createOrDeleteTablesOnTestDb(true, true);
            await prepareMocksForDeezerResponseAndImages(mockDeezerResponseRaw, picturesFolder, deezerApiCallUrl, mockedAxios);
        });
        afterEach(async () => {
            await createOrDeleteTablesOnTestDb(false, false);
            await jest.clearAllMocks();
        });

        //Descrizioni dei test

        it(`should return the same ${entityName} that Deezer returns`, async () => {
            await checkApiSuccessResponse(testApiCallUrl, app, expectedApiSuccessResponse);
        });

        it(`should upsert to the db the same ${entityName} that Deezer returns`, async () => {
            await checkDbUpsert(upsertTestSqlQuery, testApiCallUrl, app, expectedDbUpsertResult);
        });

        it(`should upload the photo/photos of the same ${entityName} that Deezer returns`, async () => { await testPicturesDownload(picturesFolder, mockDeezerResponseRaw, testApiCallUrl, app) });
    });
}