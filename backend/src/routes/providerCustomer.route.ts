import { Router } from 'express';
import { verifyJWT, authorizeRole } from '../middleware/auth.middleware.js';
import {
    getProviderCustomers,
    getProviderCustomerDetails,
} from '../controllers/providerCustomer.controller.js';

const providerCustomerRouter = Router();

// Protect routes for PROVIDER or ADMIN roles only
providerCustomerRouter.use(verifyJWT, authorizeRole('PROVIDER', 'ADMIN'));

providerCustomerRouter.get('/', getProviderCustomers);
providerCustomerRouter.get('/:customerId/details', getProviderCustomerDetails);

export default providerCustomerRouter;
