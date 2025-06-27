import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { Request, Response, NextFunction } from 'express'

import HTTP_STATUS from '~/constant/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/errors.schema'


// hàm validate sẽ nhận vào checkSchema và trả ra midleWare xử lý lỗi
//runnable có khả năng chạy
export const validate = (validattion: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validattion.run(req) // tạo danh sách lỗi cất vào req
    const errors = validationResult(req) //lấy danh sách lỗi trong req dưới dạng mảng
    if (errors.isEmpty()) {
      return next()
    } else {
      const errorObject = errors.mapped()
      const entityError = new EntityError({ errors: {} })
      for (const key in errorObject) {
        const { msg } = errorObject[key]
        //*nếu có dạng ErrorWithStatus và status khác 422 thì next đi trước (lỗi đặc biệt bị tách ra riêng)
        if (msg instanceof ErrorWithStatus && msg.status != HTTP_STATUS.UNPROCESSABLE_ENTITY) {
          return next(msg)
        }
        entityError.errors[key] = msg
      }
      next(entityError)
    }
  }
}
