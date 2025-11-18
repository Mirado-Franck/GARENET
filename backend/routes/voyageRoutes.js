// routes/voyageRoutes.js
import express from 'express';
import {
  getVoyages,
  getVoyagesByCooperative,
  getPlacesByVoyage,
  searchVoyages,
  getVoyageById,
  filterVoyagesByCooperative,
} from '../controllers/voyageController.js';

const router = express.Router();

// IMPORTANT: Ordre des routes
router.get('/search', searchVoyages);
router.get('/', getVoyages);
router.get('/cooperative/:cooperativeId/filter', filterVoyagesByCooperative);
router.get('/cooperative/:cooperativeId', getVoyagesByCooperative);
router.get('/:voyageId/places', getPlacesByVoyage);
router.get('/:id', getVoyageById);

export default router;