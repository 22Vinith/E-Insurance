import { Request, Response, NextFunction } from 'express';
import managerService from '../services/manager.service';
import HttpStatus from 'http-status-codes';
import { log } from 'winston';

class managerController {
  private managerService = new managerService();

  // Admin register
    public registerManager = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const message = await this.managerService.createManager(req.body);
            res.status(HttpStatus.CREATED).json({
                code: HttpStatus.CREATED,
                message,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
            code: HttpStatus.BAD_REQUEST,
            message: `${error}`});
        }
    };

    // manager login
    public loginManager = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {token, refreshToken,username, email} = await this.managerService.loginManager(req.body);
            res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                token,
                email,
                message: `${username} logged in successfully as manager`,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: `${error}`,
            });
        }
    };


    //Refresh token
    public refreshToken=async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<any> => {
        try {
            const adminId = req.params.id;
            const token = await this.managerService.refreshToken(adminId);
            res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                message: 'Access token refreshed successfully',
                token:token
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                code:HttpStatus.BAD_REQUEST,
                message: `${error}`})
            }
        };

        
      // forget password 
      public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
          await this.managerService.forgotPassword(req.body.email);
          res.status(HttpStatus.OK).json({
              code: HttpStatus.OK,
              message: "Reset password token sent to registered email id"
          });
        } catch (error) {
          res.status(HttpStatus.NOT_FOUND).json({
              code: HttpStatus.NOT_FOUND,
              message: 'User not found'
          });
        }
      };

      //Reset Password
      public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
          const adminId = res.locals.id;
          await this.managerService.resetPassword(req.body, adminId);

          res.status(HttpStatus.OK).json({
            code: HttpStatus.OK,
            message: 'Password reset successfully',
          });
        } catch (error) {
          res.status(HttpStatus.UNAUTHORIZED).send({
            code: HttpStatus.UNAUTHORIZED,
            message : error.message
          });
        }
      };
    

}

export default managerController;