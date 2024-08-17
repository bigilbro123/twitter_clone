import User from "../modules/user.model.js";
import Post from "../modules/post.model.js"
import Notification from '../modules/notification.model.js'
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {

    try {

        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })

        }
        if (!text && !img) {

            res.status(400).json({ error: "post must have an text or img" })



        }
        if (img) {
            const uplaodRes = await cloudinary.uploader.upload(img)
            img = uplaodRes.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img

        })
        await newPost.save()
        res.status(201).json(newPost)
    } catch (error) {
        console.log("error in creating a post");

    }

}


export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            console.log("User ID from request:", req.user._id);
            console.log("Post user ID:", post.user);

            return res.status(401).json({
                error: "This is not your post"
            });
        }

        if (post.img) {
            const imgUrlParts = post.img.split('/');
            const imgFileName = imgUrlParts.pop();
            const imgId = imgFileName.split('.')[0]; // Extract public_id without the extension
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};


export const commentOnPost = async (req, res) => {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    try {
        if (!text) {
            return res.status(400).json({ error: "Comment text is required." });
        }

        if (!postId) {
            return res.status(400).json({ error: "Post ID is required." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        const comment = { user: userId, text };
        post.comments.push(comment);
        await post.save();

        // Fetch the post again to populate the user field in the comments
        const updatedPost = await Post.findById(postId).populate({
            path: 'comments.user',
            select: '-password'
        });

        res.status(200).json({
            message: "Comment added successfully.",
            post: updatedPost
        });

    } catch (error) {
        console.error("Error in commentOnPost controller:", error);
        res.status(500).json({
            error: "Server error. Please try again later."
        });
    }
};


export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { id: POST_ID } = req.params;

        const post = await Post.findById(POST_ID);
        if (!post) {
            return res.status(404).json({
                error: "Post not found."
            });
        }

        const userHasLikedPost = post.likes.includes(userId);

        if (userHasLikedPost) {
            // Unlike the post
            await Post.updateOne({ _id: POST_ID }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: POST_ID } })

            const updateLikes = post.likes.filter((id) => {
                id.toString() !== userId.toString()
            })
            res.status(200).json(updateLikes);
        } else {
            // Like the post
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: POST_ID } })
            await post.save();

            // Create a notification for the post owner
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
                postId: POST_ID
            });
            await notification.save();

            const updataLikes = post.likes
            res.status(200).json(updataLikes);
        }
    } catch (error) {
        console.log("Error in likeUnlikePost controller:", error);
        res.status(500).json({
            error: "Server error. Please try again later."
        });
    }
};



export const GetAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({ path: 'user', select: '-password  ' }).populate({ path: 'comments.user', select: '-password  ' })

        // If there are no posts, return an empty array
        if (posts.length === 0) {
            return res.status(200).json([]);
        }

        // Return the list of posts
        res.status(200).json(posts);

    } catch (error) {
        console.log("Error in GetAllPost controller:", error);
        res.status(500).json({
            error: "Server error. Please try again later."
        });
    }
};

export const GetAllLike = async (req, res) => {


    const userId = req.params.id;

    try {
        const user = await User.findById(userId).select("-password")
        if (!user) {
            return res.status(404).json({ error: "User Not Found" })
        }
        const LikedPost = await Post.find({ _id: { $in: user.likedPosts } }).populate({ path: "user", select: "-password" }).populate({ path: "comments.user", select: "-password" })
        res.status(200).json(
            LikedPost
        )
    } catch (error) {
        res.status(404).json({ error: "Error" })

    }

}


// export const GetAllLike = async (req, res) => {


//     const userId = req.user._id;

//     try {
//         const user = await User.findById(userId).select("-password")
//         if (!user) {
//             return res.status(404).json({ error: "User Not Found" })
//         }
//         const LikedPost = await Post.find({ _id: { $in: user.likedPosts } }).populate({ path: "user", select: "-password" }).populate({ path: "comments.user", select: "-password" })
//         res.status(200).json({
//             likedPosts: LikedPost,
//             user: user
//         })
//     } catch (error) {
//         res.status(404).json({ error: "Error" })

//     }

// }

export const GetAllfollowingPost = async (req, res) => {

    const userId = req.user._id;

    try {

        const user = await User.findById(userId).select("-password")

        if (!user) {
            return res.status(404).json({
                error: "no user found"
            })
        }

        const following = user.following;
        const feedPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })
        res.status(200).json(feedPosts)

    } catch (error) {
        res.status(404).json({ error: "Error" })

    }



}

export const GetUser = async (req, res) => {
    try {
        const { username } = req.params;
        console.log(username);

        let user = await User.findOne({ username });


        if (!user) {
            return res.status(404).json({
                error: "No user found, try another username or email"
            });
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            })

        res.status(200).json(

            posts

        );
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while fetching the user data."
        });
    }
};
