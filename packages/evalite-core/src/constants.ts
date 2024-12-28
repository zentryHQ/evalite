import path from "node:path";

export const DEFAULT_SERVER_PORT = 3006;
export const CACHE_LOCATION = "./node_modules/.evalite";
export const DB_LOCATION = path.join(CACHE_LOCATION, "cache.sqlite");
export const FILES_LOCATION = path.join(CACHE_LOCATION, "files");
