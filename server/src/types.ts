import { ZodIntersection } from "zod";
import { GenericDeezerEntityBasicSchema } from "./deezer_types";
import { DbEntity } from "./db_types";
import axios from "axios";

export type QueryParams = Record<string, string>;

type DeezerEntityConfigs = [{ multiple: boolean; tableName: DeezerEntityTableName; keyOfDeezerResponse: "" }, ...{ multiple: boolean; tableName: DeezerEntityTableName; keyOfDeezerResponse: string }[]];

export type DeezerEntityConfig = { multiple: boolean; tableName: DeezerEntityTableName; keyOfDeezerResponse: string };

export type DeezerEntityAPIConfig = {
  paramName: string;
  deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => Promise<axios.AxiosResponse<any, any> | -1>;
  entities: DeezerEntityConfigs;

}

export type DeezerEntityAPIsConfig = Record<string, DeezerEntityAPIConfig>;

export type DeezerEntityTableName = "Artista" | "Album" | "Genere" | "Brano";