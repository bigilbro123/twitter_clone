import express from 'express'
import { protectedRoute } from '../middleware/protectedRoute.js';
import { getAllNotification, getDeleteNotification, getDeleteNotifications } from '../controllers/noti.controller.js'
const router = express.Router();


router.get('/', protectedRoute, getAllNotification)
router.delete('/', protectedRoute, getDeleteNotification)
router.delete('/:id', protectedRoute, getDeleteNotifications)


export default router;