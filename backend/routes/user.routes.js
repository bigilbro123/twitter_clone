import express from 'express'
import { protectedRoute } from '../middleware/protectedRoute.js';
import { getUserProfile, followOrUnfolloe, getSuggestedUser, updateUser } from '../controllers/userController.js';

const router = express.Router()


router.get('/profile/:username', protectedRoute, getUserProfile);
router.get('/suggested', protectedRoute, getSuggestedUser)
router.post('/follow/:id', protectedRoute, followOrUnfolloe)
router.post('/update', protectedRoute, updateUser)





export default router