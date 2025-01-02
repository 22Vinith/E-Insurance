import express, { IRouter } from 'express';
const router = express.Router();

import userRoute from './manager.route';
import consultantRoute from './consultant.route'
import customerRoute from './customer.route'
import staffRoute from './staff.route'

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

  return router;
};

export default routes;
