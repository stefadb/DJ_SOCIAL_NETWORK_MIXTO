import { ZodIntersection } from "zod";
import { GenericDeezerEntityBasic, GenericDeezerEntityBasicSchema } from "./deezer_types";
import { AssocAlbumGenereDb, AssocBranoArtistaDb, DbEntity } from "./db_types";
import axios from "axios";

export type QueryParams = Record<string, string>;

export type DeezerEntityConfig = {
  tableName: DeezerEntityTableName;
  deezerEntitySchema: ZodIntersection<typeof GenericDeezerEntityBasicSchema, any>;
  getEntityObjectsFromResponse: (response: axios.AxiosResponse<any, any>) => GenericDeezerEntityBasic[];
  showEntityInResponse: boolean;
};

type DeezerEntityConfigs = [
  DeezerEntityConfig,
  ...DeezerEntityConfig[]
];

export type DeezerEntityAPIConfig = {
  paramName: string;
  deezerAPICallback: (res: import("express").Response, param: string, limit: number | undefined, index: number | undefined) => Promise<axios.AxiosResponse<any, any> | -1>;
  entities: DeezerEntityConfigs;
  pagination?: boolean;
  association?: {
    getAssociationsFromResponse: (response: axios.AxiosResponse<any, any>) => AssocBranoArtistaDb[] | AssocAlbumGenereDb[];
    tableName: "album_genere" | "brano_artista";
    deleteOldAssociations: boolean;
  },
  maxOneCallPerDay?: boolean; //se true, limita le chiamate a questa API a una al giorno (utile per API che non cambiano spesso e hanno limiti di chiamate)
}

export type DeezerEntityAPIsConfig = Record<string, DeezerEntityAPIConfig>;

export type DeezerEntityTableName = "artista" | "album" | "genere" | "brano";