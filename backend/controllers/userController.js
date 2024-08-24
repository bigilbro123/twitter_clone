import User from '../modules/user.model.js';
import Notification from '../modules/notification.model.js'
import bcrypt from 'bcryptjs'
import { v2 as cloudinary } from 'cloudinary';



export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({
                error: "user not found"
            })
        }
        console.log(user);

        res.status(200).json(user)

    } catch (error) {
        res.status(500).json({
            error: "user not found"
        })
        console.log("error", error);


    }
}


export const followOrUnfolloe = async (req, res) => {
    try {

        const { id } = req.params;
        const userTomodify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: 'you can"t follow/unfollow yourself' })
        }
        if (!userTomodify || !currentUser) {
            return res.status(400).json({
                error: "user not found"
            })
        }
        const isFollowing = currentUser.following.includes(id)
        if (isFollowing) {
            //unfollow

            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            res.status(200).json({ message: "user unfollowed successfully" })


        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })

            const notification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userTomodify._id,
            })

            await notification.save();

            res.status(200).json({ message: "user followed successfully" })

        }
    } catch (error) {
        res.status(500).json({
            error: "error in follow or unfollowing user"
        })
        console.log("error", error);

    }
}

export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const userFollowedMe = await User.findById(userId).select('-password');

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            {
                $sample: { size: 10 }
            }
        ]);

        const filteredUsers = users.filter(user => !userFollowedMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);
        suggestedUsers.forEach(user => user.password = null);

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

export const updateUser = async (req, res) => {
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Password handling
        if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please provide both current and new password" });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current password does not match" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "New password should be at least 6 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Profile image handling
        if (profileImg) {
            if (user.profileimg) {
                const publicId = user.profileimg.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadedProfileImg = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedProfileImg.secure_url;
        }

        // Cover image handling
        if (coverImg) {
            if (user.coverImg) {
                const publicId = user.coverImg.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadedCoverImg = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedCoverImg.secure_url;
        }

        // Update user details
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileimg = profileImg || user.profileimg;
        user.coverImg = coverImg || user.coverImg;

        await user.save();
        user.password = undefined; // Remove password before sending the response

        return res.status(200).json({ user });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Error updating user" });
    }
};
