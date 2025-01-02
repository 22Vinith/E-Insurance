/* eslint-disable @typescript-eslint/no-explicit-any */
import HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to authenticate if user has a valid Authorization token
 * Authorization: Bearer <token>
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const auth = (secret_token: string) => {
  return async (
  req: Request,
  res: Response,
  next: NextFunction
  ): Promise<void> => {
    try {
      let bearerToken = req.header('Authorization');
      console.log('Bearer Token:', bearerToken);
      if (!bearerToken)
        throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'Authorization token is required'
        };
      bearerToken = bearerToken.split(' ')[1];
      console.log(bearerToken,secret_token)
      const { userId }: any = await jwt.verify(bearerToken, secret_token);
      res.locals.id = userId;      
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const managerResetAuth = auth(process.env.JWT_MANAGER_RESET_SECRET)

export const managerAuth = auth(process.env.JWT_MANAGER_SECRET)

export const consultantResetAuth = auth(process.env.JWT_CONSULTANT_RESET_SECRET)

export const staffAuth = auth(process.env.JWT_STAFF_SECRET)
