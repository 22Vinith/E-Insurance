import express, { IRouter } from 'express';
const router = express.Router();

import userRoute from './manager.route';
import consultantRoute from './consultant.route'
import customerRoute from './customer.route'
import staffRoute from './staff.route'
import planRoute from './plan.route'
import policyRoute from './plan.route'

/**
 * Function contains Application routes
 *
 * @returns router
 */
const routes = (): IRouter => {
  router.get('/', (req, res) => {
    res.json('Welcome');
  });
  router.use('/manager', new userRoute().getRoutes());
  router.use('/consultant', new consultantRoute().getRoutes());
  router.use('/customer', new customerRoute().getRoutes());
  router.use('/staff', new staffRoute().getRoutes());
  router.use('/plan', new planRoute().getRoutes());
  router.use('/policy', new policyRoute().getRoutes());

  return router;
};

export default routes;
