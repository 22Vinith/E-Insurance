import Joi from '@hapi/joi';
import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status-codes';

export class PolicyValidator {
  public createPolicy = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.object({
      policyName: Joi.string().required(),
      description: Joi.string().required(),
      planId: Joi.string().required(),
      customerId: Joi.string().required(),
      schemeId: Joi.string().required(),
      agentId: Joi.string().required(),
      premiumAmount: Joi.number().positive().required(),
      coverage: Joi.number().positive().required(),
      duration: Joi.number().positive().required()
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


  public validatePagination = (req: Request, res: Response, next: NextFunction): void => {
    const schema = Joi.object({
        page: Joi.number().integer().min(1).optional().default(1),
        limit: Joi.number().integer().min(1).max(100).optional().default(10),
    });

    const { error, value } = schema.validate(req.query);

    if (error) {
        res.status(HttpStatus.BAD_REQUEST).send({
            code: HttpStatus.BAD_REQUEST,
            message: error.message,
        });
        return;
    }

    req.query = value; // Overwrite query with validated values
    next();
  };
}

export default PolicyValidator;