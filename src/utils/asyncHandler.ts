
import { NextFunction, Request, RequestHandler, Response } from 'express'

export const wrapAsync = <P, T>(func: RequestHandler<P, any, any, T>) => {
  //đừng quan tâm đầu vào, sử dụng generic- P và T không cụ thể kiểu dữ liệu nào cả
  return async (req: Request<P, any, any, T>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}