import Joi from '@hapi/joi';
import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status-codes';

class PlanValidator {
    public createPlan = (req: Request, res: Response, next: NextFunction): void => {
        const schema = Joi.object({
            planName: Joi.string().min(3).required(),
            description: Joi.string().optional(),
            category: Joi.string().required(),
            highlight: Joi.array().items(Joi.string().max(31)).max(5).optional()
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


    public updatePlan = (req: Request, res: Response, next: NextFunction): void => {
        const schema = Joi.object({
            planName: Joi.string().optional(),
            description: Joi.string().optional(),
            category: Joi.string().optional(),
            highlight: Joi.array().items(Joi.string().max(31)).max(5).optional()
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

    public validatePagination = (req: Request, res: Response, next: NextFunction): void => {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).optional().default(1),
            limit: Joi.number().integer().min(1).max(100).optional().default(10), // Limit max to 100
        });
    
        const { error, value } = schema.validate(req.query);
    
        if (error) {
            res.status(HttpStatus.BAD_REQUEST).send({
                code: HttpStatus.BAD_REQUEST,
                message: error.message
            });
            return;
        }
    
        req.query = value;    // Overwrite query with validated values
        next();
    };
}

export default PlanValidator;