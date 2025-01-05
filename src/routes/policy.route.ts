import express, { IRouter } from "express";
import PolicyValidator from "../validators/policy.validator";
import PolicyController from "../controllers/policy.controller";
import { managerAuth, consultantAuth, customerAuth, staffAuth } from "../middlewares/auth.middleware";
import { cacheData } from "../middlewares/redis.middleware";
import upload from "../config/multer";

class PolicyRoute {
    private router = express.Router();
    private policyController = new PolicyController();
    private policyValidator = new PolicyValidator();

    constructor(){
        this.routes();
     }
     private routes = () => {
         //route to create a policy by customer
         this.router.post('/', customerAuth, upload, this.policyValidator.createPolicy, this.policyController.createPolicy);
         
         //route to get all policy by customer
         this.router.get('/', customerAuth, this.policyValidator.validatePagination, cacheData, this.policyController.getAllPolicies);

         //route to get all policy by customer
         this.router.get('/agent', consultantAuth, cacheData, this.policyController.getAllAgentPolicies);

         //route to update status of policy
         this.router.patch('/:id', this.policyController.updateStatus);

         //route to update policy by customer
         this.router.put('/:id', customerAuth, this.policyValidator.createPolicy, this.policyController.updatePolicy);

         //route to delete policy by customer
         this.router.delete('/:id', customerAuth, this.policyController.deletePolicy);

         //route to get policy by id, by customer
         this.router.get('/:id', customerAuth, this.policyController.getPolicyById);

         //route to get policy by id, by agent
         this.router.get('/:id/agent', consultantAuth, this.policyController.getPolicyById);

         //route to get policy by id, by admin
         this.router.get('/:id/admin', managerAuth, this.policyController.getPolicyById);

         //route to get policy by id, by employee
         this.router.get('/:id/employee', staffAuth, this.policyController.getPolicyById);

         //route to update policy by agent
         this.router.put('/:id/agent', consultantAuth, this.policyValidator.createPolicy, this.policyController.updatePolicy);

         //route to update policy by admin
         this.router.put('/:id/admin', managerAuth, this.policyValidator.createPolicy, this.policyController.updatePolicy);

         //route to delete policy by admin
         this.router.delete('/:id/admin', managerAuth, this.policyController.deletePolicy);

         //route to get all customer policy by agent
         this.router.get('/:id/getall/agent', consultantAuth, this.policyValidator.validatePagination, cacheData, this.policyController.getAllPolicies);

         //route to get all policy by admin
         this.router.get('/:id/getall/admin', managerAuth, this.policyValidator.validatePagination, cacheData, this.policyController.getAllPolicies);

         //route to get all policy by employee
         this.router.get('/:id/getall/employee', staffAuth, this.policyValidator.validatePagination, cacheData, this.policyController.getAllPolicies);

     }
     
     public getRoutes = (): IRouter => {
        return this.router;
      };

}
export default PolicyRoute;