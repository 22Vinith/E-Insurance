import { NextFunction, Request, Response } from "express";
import StaffService from "../services/staff.service";
import HttpStatus from 'http-status-codes';


class StaffController{

    private employeeService = new StaffService();

    //login employee
    public loginStaff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {token, username, email} = await this.employeeService.loginStaff(req.body);
            res.status(HttpStatus.OK).json({
                code: HttpStatus.OK,
                token,
                email,
                username,
                message: `${username} logged in successfully as employee`,
            });
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({
                code: HttpStatus.BAD_REQUEST,
                message: `${error}`,
            });
        }
    };

    //register an employee
    public registerStaff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const message = await this.employeeService.createStaff(req.body);
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

    // Get all Employee
    public getAllStaff = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const employees = await this.employeeService.getAllStaff();
            res.status(HttpStatus.OK).json({ 
                code: HttpStatus.OK, 
                data: employees.data,
                source: employees.source
            });
        } catch (error) {
            next(error);
        }
    };

    public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
          await this.employeeService.forgotPassword(req.body.email);
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

    public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
          const employeeId = res.locals.id;
          await this.employeeService.resetPassword(req.body, employeeId);
    
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

    public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const employeeId = req.params.id;
            const token = await this.employeeService.refreshToken(employeeId);
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

}

export default StaffController;