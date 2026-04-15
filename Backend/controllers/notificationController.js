const notification = require("../models/notification")



exports.getNotification = async (req, res) =>{

const userId = req.user.id
    try{
        const data = await notification.find({reciverId:userId}).sort({ date: -1 })
            res.status(200).send(data)
    }catch(err){    
        res.status(400).send(err)
    }

}