import express from 'express';
import { createPost, GetAllLike, GetUser, GetAllfollowingPost, deletePost, commentOnPost, likeUnlikePost, GetAllPost } from '../controllers/post.Controller.js'
import { protectedRoute } from '../middleware/protectedRoute.js';
const router = express.Router();

router.get('/all', protectedRoute, GetAllPost)
router.get('/like/:id', protectedRoute, GetAllLike)
// router.get('/like/', protectedRoute, GetAllLike)
router.get('/following', protectedRoute, GetAllfollowingPost)
router.get('/user/:username', protectedRoute, GetUser)

router.post('/create', protectedRoute, createPost)
router.post('/like/:id', protectedRoute, likeUnlikePost)
router.post('/comment/:id', protectedRoute, commentOnPost)

router.delete('/:id', protectedRoute, deletePost)



export default router