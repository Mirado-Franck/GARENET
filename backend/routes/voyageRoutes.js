// routes/voyageRoutes.js
import express from 'express';
import {
  getVoyages,
  getVoyagesByCooperative,
  getPlacesByVoyage,
  searchVoyages,
  getVoyageById
} from '../controllers/voyageController.js';

const router = express.Router();

// IMPORTANT: Mettre /search AVANT /:voyageId pour éviter les conflits
router.get('/search', searchVoyages);
router.get('/', getVoyages);
router.get('/cooperative/:cooperativeId', getVoyagesByCooperative);
router.get("/:voyageId/places", getPlacesByVoyage);
router.get('/:id', getVoyageById); 
export default router;