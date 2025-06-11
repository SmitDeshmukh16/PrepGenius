import express from 'express';
import { authenticate } from '../middleware/auth.js';
import * as companyController from '../controllers/companyController.js';

const router = express.Router();

router.post('/', authenticate, companyController.createCompany);
router.get('/', authenticate, companyController.getCompaniesByMonth);
router.put('/:companyId', authenticate, companyController.updateCompany);
router.delete('/:companyId', authenticate, companyController.deleteCompany);

export default router;