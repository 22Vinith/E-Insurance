import { Request, Response, NextFunction } from 'express';
import consultantService from "../services/consultant.service";
import httpstatus from "http-status-codes";


class consultantController{

    public consultantService = new consultantService()

    // consultant login
    public consultantLogin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try{
            const data = await this.consultantService.signin(req.body)
            res.status(httpstatus.ACCEPTED).json({
                code: httpstatus.ACCEPTED,
                message: data.message,
                username: data.username,
                token: data.token
            })
        } catch(error) {
            res.status(httpstatus.UNAUTHORIZED).json({
                code: httpstatus.UNAUTHORIZED,
                message: error.message
            })
        }

    }

    // consultant Registration
    public consultantSignup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try{
            const data = await this.consultantService.signup(req.body)
            res.status(httpstatus.CREATED).json({
                code: httpstatus.CREATED,
                message: data
            })
        } catch(error) {
            res.status(httpstatus.CONFLICT).json({
                code: httpstatus.CONFLICT,
                message: error.message
            })
        }
    };

    // Get all Consultants
    public getAllConsultant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('[[[[[[[[[[')
            const agents = await this.consultantService.getAllConsultants();
            res.status(httpstatus.OK).json({ 
                code: httpstatus.OK, 
                data: agents.data,
                source: agents.source
            });
        } catch (error) {
            next(error);
        }
    };


    // refresh token 
    public refreshToken=async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<any> => {
        try {
            const agentId=req.params.id;
            const token = await this.consultantService.refreshToken(agentId);
            res.status(httpstatus.OK).json({
                code: httpstatus.OK,
                message: 'Access token refreshed successfully',
                token:token
            });
        } catch (error) {
            res.status(httpstatus.BAD_REQUEST).json({
                code: httpstatus.BAD_REQUEST,
                message: error.message 
            })
        };
    }
    

    // forget password 
    public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
        await this.consultantService.forgotPassword(req.body.email);
        res.status(httpstatus.OK).json({
            code: httpstatus.OK,
            message: "Reset password token sent to registered email id"
        });
        } catch (error) {
        res.status(httpstatus.NOT_FOUND).json({
            code: httpstatus.NOT_FOUND,
            message: 'User not found'
        });
        }
    };


    //Reset Password
    public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
        const agentId = res.locals.id;
        await this.consultantService.resetPassword(req.body, agentId);

        res.status(httpstatus.OK).json({
            code: httpstatus.OK,
            message: 'Password reset successfully',
        });
        } catch (error) {
        res.status(httpstatus.UNAUTHORIZED).send({
            code: httpstatus.UNAUTHORIZED,
            message : error.message
        });
        }
      };
  

}



export default consultantController