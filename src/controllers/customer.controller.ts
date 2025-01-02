import HttpStatus from 'http-status-codes';
import customerService from '../services/customer.service';
import { Request, Response, NextFunction } from 'express';

class UserController {
  public CustomerService = new customerService();

  /**
   * Controller to create new user
   * @param  {object} Request - request object
   * @param {object} Response - response object
   * @param {Function} NextFunction
   */

  // register a new customer
  public createCustomer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      await this.CustomerService.createCustomer(req.body);
      
      res.status(HttpStatus.CREATED).json({
        code: HttpStatus.CREATED,
        message: 'customer created successfully'
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        code: HttpStatus.BAD_REQUEST,
        message: `${error}`});
    }
  };

  // login customer
  public customerLogin=async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const customerData= await this.CustomerService.customerLogin(req.body);
      res.status(HttpStatus.OK).json({
        code: HttpStatus.OK,
        token:customerData.token,
        username: customerData.username,
        message: ` ${customerData.username} logged in successfully`
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        code: HttpStatus.BAD_REQUEST,
        message: `${error}`})
    }
  };

  // Get all customers
  public getAllCustomers = async (req: Request,
     res: Response,
     next: NextFunction
    ) => {
    try {
      let agentId;
      if(req.params.id === undefined){
        agentId = res.locals.id;
      } else {
        agentId = req.params.id;
      }
      const data = await this.CustomerService.getAllCustomers(agentId);
      res.status(HttpStatus.OK).json({ 
          code: HttpStatus.OK, 
          data: data.data,
          source: data.source
      });
    } catch (error) {
        next(error);
    }
  };

  
  public getCustomerById=async(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try{
     const customer=await this.CustomerService.getCustomerById(res.locals.id)
     res.status(HttpStatus.OK).json({
      code: HttpStatus.OK,
      data:customer,
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({
      code: HttpStatus.BAD_REQUEST,
      message: `${error}`})
  }
}
  public refreshToken = async (req: Request,
     res: Response, 
     next: NextFunction
    ): Promise<any> => {
    try {
      const customerId = req.params.id;
      const newAccessToken = await this.CustomerService.refreshToken(customerId);
      res.status(HttpStatus.OK).json({
        code: HttpStatus.OK,
        message: 'Access token refreshed successfully',
        token: newAccessToken,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        code: HttpStatus.BAD_REQUEST,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };


  // forget password 
  public forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      await this.CustomerService.forgotPassword(req.body.email);
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
      const customerId = res.locals.id;
      await this.CustomerService.resetPassword(req.body, customerId);

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

export default UserController;

