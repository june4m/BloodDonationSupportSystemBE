
import {ParamSchema} from 'express-validator'
import { USERS_MESSAGES } from '~/constant/message'
import {Request} from 'express'
import { error } from 'console'
const passwordSchema : ParamSchema = {
    notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
    },
    isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRING
    },
    isStrongPassword: {
        options:{
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
    },
    isLength: {
        options:{
            min: 8,
            max:50
        },
        errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_IS_BETWEEN_8_50
    }
}
const  confirmPasswordSchema: ParamSchema ={
    notEmpty:{
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
    },
    isStrongPassword:{
        options:{
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers:1,
            minSymbols:1
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
    },
    isLength:{
        options:{
            min: 8,
            max: 50
        },
        errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_IS_BETWEEN_8_50
    },
    isString:{
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRING
    },
    custom:{
        options:(value,{req})=>{
            if(value!== req.body){
                throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_SAME_AS_PASSWORD);
            }else{
                return true
            }
        }
    }
}
const  forrgotPasswordTokenSchema: ParamSchema = {
    
}