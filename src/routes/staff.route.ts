import express, { IRouter } from 'express';
import StaffController from '../controllers/staff.controller';
import StaffValidator from '../validators/staff.validator';
import { managerAuth, staffResetAuth } from '../middlewares/auth.middleware';

class StaffRoutes {
    private router = express.Router();
    private employeeController = new StaffController();
    private employeeValidator = new StaffValidator();

    constructor() {
        this.routes();
    }

    private routes = () => {

        // Staff login route
        this.router.post('', this.employeeValidator.loginStaff, this.employeeController.loginStaff);

        // get all Staff by manager
        this.router.get('', managerAuth, this.employeeController.getAllStaff);

        // Staff registration route
        this.router.post('/register', this.employeeValidator.createStaff, this.employeeController.registerStaff);
        
        // forget password route
        this.router.post('/forgot-password', this.employeeValidator.validateForgotPassword, this.employeeController.forgotPassword);

        // Reset Password route
        this.router.post('/reset-password', staffResetAuth, this.employeeValidator.validateResetPassword, this.employeeController.resetPassword);

        //refresh token route
        this.router.get('/:id/refreshtoken',this.employeeController.refreshToken)
        
    };

    public getRoutes = (): IRouter => {
        return this.router;
    };
}

export default StaffRoutes;