import express, { IRouter } from 'express';
import PlanController from '../controllers/plan.controller';
import PlanValidator from '../validators/plan.validator';
import { managerAuth } from '../middlewares/auth.middleware';
import { cacheData } from '../middlewares/redis.middleware';

class PlanRoutes {
  private router = express.Router();
  private planController = new PlanController();
  private planValidator = new PlanValidator();

  constructor() {
    this.routes();
  }

  private routes = () => {

    // create plan route by manager
    this.router.post('/', managerAuth, this.planValidator.createPlan, this.planController.createPlan);

    // get all plans
    this.router.get('/', this.planValidator.validatePagination, cacheData, this.planController.getAllPlans);

    // get plan by id
    this.router.get('/:id', this.planController.getPlanById);

    // update a plan by id, by manager
    this.router.put('/:id', managerAuth, this.planValidator.updatePlan, this.planController.updatePlan);

    // delete a plan by id, by manager
    this.router.delete('/:id', managerAuth, this.planController.deletePlan);

  };

  public getRoutes = (): IRouter => {
    return this.router;
  };
}

export default PlanRoutes;