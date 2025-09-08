import { ZodIntersection } from "zod";
import { GenericDeezerEntityBasic, GenericDeezerEntityBasicSchema } from "./deezer_types";
import { AssocAlbumGenereDb, AssocBranoArtistaDb, DbEntity } from "./db_types";
import axios from "axios";

export type QueryParams = Record<string, string>;

type DeezerEntityConfigs = [
  { multiple: boolean; 
    tableName: DeezerEntityTableName; 
    deezerEntitySchema: ZodIntersection<typeof GenericDeezerEntityBasicSchema, any>;
    getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => GenericDeezerEntityBasic[];
  }, ...{
    multiple: boolean;
    tableName: DeezerEntityTableName;
    deezerEntitySchema: ZodIntersection<typeof GenericDeezerEntityBasicSchema, any>;
    getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => GenericDeezerEntityBasic[];
  }[]];

export type DeezerEntityConfig = { multiple: boolean; tableName: DeezerEntityTableName; keyOfDeezerResponse: string };

export type DeezerEntityAPIConfig = {
  paramName: string;
  deezerAPICallback: (res: import("express").Response, param: string, limit: string, index: string) => Promise<axios.AxiosResponse<any, any> | -1>;
  entities: DeezerEntityConfigs;
  association?: {
    getAssociationsFromResponse: (response: axios.AxiosResponse<any, any>) => AssocBranoArtistaDb[] | AssocAlbumGenereDb[];
    tableName: "album_genere" | "brano_artista";
    deleteOldAssociations: boolean;
  }
}

export type DeezerEntityAPIsConfig = Record<string, DeezerEntityAPIConfig>;

export type DeezerEntityTableName = "Artista" | "Album" | "Genere" | "Brano";