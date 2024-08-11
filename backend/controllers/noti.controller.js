import Notification from '../modules/notification.model.js'


export const getAllNotification = async (req, res) => {
    try {
        const userId = req.user._id;  // Consistent camelCase naming

        // Find notifications where the user is the recipient
        const notifications = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg"
        });

        // Mark all notifications as read for this user
        await Notification.updateMany({ to: userId }, { read: true });

        // Respond with the notifications
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);  // Log the error for debugging
        res.status(500).json({
            error: "Internal server error"
        });
    }
};


export const getDeleteNotification = async (req, res) => {
    try {
        const userID = req.user._id;


        await Notification.deleteMany({ to: userID })

        res.status(200).json({ notification: "deleted" })
    } catch (error) {
        res.status(500).json({
            error: "intenal server error"



        }
        )
    }
}

export const getDeleteNotifications = async (req, res) => {


    const notiID = req.params;
    try {

        const user = req.user._id;

        const notification = await Notification.findById(notiID);

        if (!notification) {
            return res.status(500).json({
                error: "NO Notification found"
            })
        }

        if (notification.to.toString() !== user.toString()) {
            return res.status(403).json({
                error: "you are not the owner"
            })
        }

        await Notification.findByIdAndDelete(notiID)
        res.status(201).json({
            messaage: "deleted ok"
        })

    } catch (error) {
        res.status(400).json({
            error: "server error"
        })
    }
}