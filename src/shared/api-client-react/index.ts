export * from "./generated/api";
export * from "./generated/api.schemas";
export {
  getLastResponseTime,
  setBaseUrl,
  setAuthTokenGetter,
  customFetch,
} from "./custom-fetch";
export type {
  CustomFetchOptions,
  ErrorType,
  BodyType,
  AuthTokenGetter,
} from "./custom-fetch";
