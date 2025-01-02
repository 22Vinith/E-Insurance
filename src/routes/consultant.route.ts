import AgentController from '../controllers/consultant.controller';
import { managerAuth, consultantResetAuth, staffAuth } from '../middlewares/auth.middleware';
import ConsultantValidator from '../validators/consultant.validator';
import express, { IRouter } from 'express';

class UserRoutes {
  private consultantController = new AgentController();
  private router = express.Router();
  private consultantValidator = new ConsultantValidator();

  constructor() {
    this.routes();
  }

  private routes = () => {
    //route to login an consultant
    this.router.post('', this.consultantValidator.loginConsultant, this.consultantController.consultantLogin);

    // get all consultant by manager (called by manager)
    this.router.get('/manager', managerAuth, this.consultantController.getAllConsultant);

    // get all consultants by staff (called by staff)
    this.router.get('/staff', staffAuth, this.consultantController.getAllConsultant);

    //route to register an consultant    
    this.router.post('/register', this.consultantValidator.newConsultant, this.consultantController.consultantSignup);

    // forget password route
    this.router.post('/forgot-password', this.consultantValidator.validateForgotPassword, this.consultantController.forgotPassword);

    // Reset Password route
    this.router.post('/reset-password', consultantResetAuth, this.consultantValidator.validateResetPassword, this.consultantController.resetPassword);

    //route to refresh token
    this.router.get('/:id/refreshtoken',this.consultantController.refreshToken)

  };

  public getRoutes = (): IRouter => {
    return this.router;
  };
}

export default UserRoutes;
