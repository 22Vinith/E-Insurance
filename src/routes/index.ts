import express, { IRouter } from 'express';
const router = express.Router();

import userRoute from './manager.route';
import consultantRoute from './consultant.route'

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

  return router;
};

export default routes;
