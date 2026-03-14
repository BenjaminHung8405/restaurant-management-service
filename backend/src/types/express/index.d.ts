declare module 'express' {
  export interface ParamsDictionary {
    [key: string]: string | undefined;
  }

  export interface QueryDictionary {
    [key: string]: string | string[] | undefined;
  }

  export interface Request {
    body: unknown;
    params: ParamsDictionary;
    query: QueryDictionary;
    headers: Record<string, string | undefined>;
    method: string;
    originalUrl: string;
    user?: import('../../utils/jwtHelper').IJwtPayload;
  }

  export interface Response {
    status(code: number): Response;
    json(body: unknown): Response;
  }

  export type NextFunction = (err?: unknown) => void;

  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): unknown;
  }

  export interface ErrorRequestHandler {
    (err: unknown, req: Request, res: Response, next: NextFunction): unknown;
  }

  export type Handler = RequestHandler | ErrorRequestHandler | Router;

  export interface RouterMatcher {
    (path: string, ...handlers: Handler[]): Router;
    (...handlers: Handler[]): Router;
  }

  export interface Router {
    use: RouterMatcher;
    get: RouterMatcher;
    post: RouterMatcher;
    put: RouterMatcher;
    patch: RouterMatcher;
    delete: RouterMatcher;
  }

  export interface Application extends Router {}

  export interface ExpressFactory {
    (): Application;
    json(): RequestHandler;
    urlencoded(options?: { extended?: boolean }): RequestHandler;
    Router(): Router;
  }

  export function Router(): Router;

  const express: ExpressFactory;
  export default express;
}

declare module 'cors' {
  import { RequestHandler } from 'express';

  interface CorsOptions {
    origin?: string | boolean | RegExp | Array<string | RegExp>;
    credentials?: boolean;
  }

  function cors(options?: CorsOptions): RequestHandler;
  export default cors;
}
