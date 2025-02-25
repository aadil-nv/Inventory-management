export enum UserRole {
    ADMIN = "admin",
    USER = "user",
  }
  
  export enum ResponseStatus {
    SUCCESS = "success",
    ERROR = "error",
  }
  
  export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
  }
  
  export enum TokenType {
    ACCESS = "access",
    REFRESH = "refresh",
  }
  