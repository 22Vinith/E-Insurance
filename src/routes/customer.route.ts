import express, { IRouter } from 'express';
import CustomerController from '../controllers/customer.controller';
import customerValidator from '../validators/customer.validator'; 
import { managerAuth, consultantAuth, customerAuth, customerResetAuth, staffAuth } from '../middlewares/auth.middleware';

class UserRoutes {
  private CustomerController = new CustomerController();
  private router = express.Router();
  private CustomerValidator = new customerValidator();  

  constructor() {
    this.routes();
  }

  private routes = () => {

    //route to login a customer
    this.router.post('', this.CustomerValidator.customerLogin, this.CustomerController.customerLogin); 

    //route to get all customer, by consultant (called by consultant)
    this.router.get('', consultantAuth, this.CustomerController.getAllCustomers);

    //route to get customer details with consultant id (called by customer)
    this.router.get('/getcustomer',customerAuth,this.CustomerController.getCustomerById)

    //route to register a customer
    this.router.post( '/register', this.CustomerValidator.createCustomer, this.CustomerController.createCustomer);

    // forget password route
    this.router.post('/forgot-password', this.CustomerValidator.validateForgotPassword, this.CustomerController.forgotPassword);
    
    // Reset Password route
    this.router.post('/reset-password', customerResetAuth, this.CustomerValidator.validateResetPassword, this.CustomerController.resetPassword);
    
    //route to refresh token
    this.router.get('/:id/refreshtoken', this.CustomerController.refreshToken);

    //route to get all customer, by manager with consultant id (called by manager)
    this.router.get('/:id/manager', managerAuth, this.CustomerController.getAllCustomers);

    //route to get all customer, by staff with consultant id (called by staff)
    this.router.get('/:id/staff', staffAuth, this.CustomerController.getAllCustomers);

  };

  public getRoutes = (): IRouter => {
    return this.router; 
  };
}

export default UserRoutes;
