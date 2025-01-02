import express, { IRouter } from 'express';
import managerController from '../controllers/manager.controller';
import managerValidator from '../validators/manager.validator';
import {managerResetAuth } from '../middlewares/auth.middleware';

class UserRoutes {
  private managerController = new managerController();
  private router = express.Router();
  private managerValidator = new managerValidator();

  constructor() {
    this.routes();
  }

  private routes = () => {
   // manager login 
   this.router.post('',  this.managerValidator.loginAdmin, this.managerController.loginManager);

   // manager registration 
   this.router.post('/register', this.managerValidator.createAdmin, this.managerController.registerManager);

   // forget password
   this.router.post('/forgot-password', this.managerValidator.validateForgotPassword, this.managerController.forgotPassword);

   // Reset Password
   this.router.post('/reset-password', managerResetAuth, this.managerValidator.validateResetPassword, this.managerController.resetPassword);

   //refresh token
   this.router.get('/:id/refreshtoken',this.managerController.refreshToken)
  };

  public getRoutes = (): IRouter => {
    return this.router;
  };
}

export default UserRoutes;
