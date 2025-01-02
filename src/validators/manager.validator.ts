import Joi from '@hapi/joi';
import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status-codes';

class managerValidator {
    public createAdmin = (req: Request, res: Response, next: NextFunction): void => {
        const schema = Joi.object({
            username: Joi.string().min(3).required(),
            email: Joi.string().email().required(),
            password: Joi.string()
              .min(6)
              .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
              .message("Password must contain at least one uppercase letter, one lowercase letter, and one special character")
              .required(),
            phno: Joi.string().pattern(/^[0-9]{10}$/).optional()
        });
        
        const { error } = schema.validate(req.body);
        
        if (error) {
            res.status(HttpStatus.BAD_REQUEST).send({
                code: HttpStatus.BAD_REQUEST,
                message: error.message
            });
            return;
        }
        next();
    };  

    public loginAdmin = (req: Request, res: Response, next: NextFunction): void => {
        const schema = Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required()
        });
    
        const { error } = schema.validate(req.body);
    
        if (error) {
          res.status(HttpStatus.BAD_REQUEST).send({
            code: HttpStatus.BAD_REQUEST,
            message: error.message,
          });
          return;
        }
        next();
      };

    public validateForgotPassword = (req: Request, res: Response, next: NextFunction): void => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
      });
    
      const { error } = schema.validate(req.body);
      if (error) {
        res.status(HttpStatus.BAD_REQUEST).send({
          code: HttpStatus.BAD_REQUEST,
          message: error.message,
        });
        return;
      }
      next();
    };

    public validateResetPassword = (req: Request, res: Response, next: NextFunction): void => {
      const schema = Joi.object({
        newPassword: Joi.string()
            .min(6)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
            .message("Password must contain at least one uppercase letter, one lowercase letter, and one special character")
            .required()
      });
      const { error } = schema.validate(req.body);
      if (error) {
        res.status(HttpStatus.BAD_REQUEST).send({
          code: HttpStatus.BAD_REQUEST,
          message: error.message,
        });
        return;
      }
      next();
    };
}

export default managerValidator;
