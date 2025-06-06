import { Response } from 'express'
interface IResponseSuccess {
  status: boolean
  message: string
  errors: null
  statusCode: Number
}
interface IResponseError {
  status: boolean
  message: string
  errors: any
  statusCode: number
}
export class ResponseHandle {
  public static responseSuccess(
    res: Response,

    message: string = 'Success',
    statusCode: number = 200
  ): Response {
    const response: IResponseSuccess = {
      status: true,
      message,
      errors: null,
      statusCode
    }
    return res.status(statusCode).json(response)
  }

  public static responseError(
    res: Response,
    errors: any,
    message: string = 'Response Error',
    statusCode: number = 400
  ): Response {
    const respone: IResponseError = {
      status: false,
      message,
      errors,
      statusCode
    }
    return res.status(statusCode).json(respone)
  }
}
