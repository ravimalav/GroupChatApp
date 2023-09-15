const User = require("../models/user");
const userGroup = require("../models/usergroup");
const Message = require("../models/message");

exports.getusers = async (req, res) => {
  try {
    await req.user.update({ login_status: true });
    const groupId = req.header("GroupId");

    const userId = await userGroup.findAll({
      where: {
        groupTableId: groupId,
      },
    });
    const records = await userId.map((result) => result.userUserId);

    const userName = await User.findAll({
      where: {
        user_id: records,
      },
    });

    // check that login user is admin or not

    const isAdmin = await userGroup.findOne({
      where: {
        groupTableId: groupId,
        userUserId: req.user.user_id,
      },
    });

    const lastEntry = await Message.findOne({
      order: [["createdAt", "DESC"]],
    });
    //   const messages=await Message.findAll()    //find all messages form table
    res
      .status(201)
      .send({
        response: userName,
        isadmin: isAdmin,
        lastentry: lastEntry,
        success: true,
      });
  } catch (err) {
    res.status(500).send({ error: "internal server error" });
  }
};

exports.removeUser = async (req, res) => {
  const groupId = req.header("GroupId");
  const { userId } = req.params;
  try {
    //check that user that send deleted request is admin or not
    const isAdmin = await userGroup.findOne({
      where: {
        groupTableId: groupId,
        userUserId: req.user.user_id,
        role: "Admin",
      },
    });
    if (isAdmin) {
      await userGroup.destroy({
        where: {
          userUserId: userId,
          groupTableId: groupId,
        },
      });
      const findUser = await User.findByPk(userId);
      res.status(201).send({ response: `${findUser.name} removed by Admin` });
    } else {
      throw new Error(err);
    }
  } catch (err) {
    res.status(500).send({ err });
  }
};

exports.makeAdmin = async (req, res) => {
  try {
    const groupId = req.header("GroupId");
    const { userId } = req.params;

    //check user that make the request is admin or not
    const isAdmin = await userGroup.findOne({
      where: {
        groupTableId: groupId,
        userUserId: req.user.user_id,
        role: "Admin",
      },
    });

    if (isAdmin) {
      const userThatWillUpdate = await userGroup.findOne({
        where: {
          groupTableId: groupId,
          userUserId: userId,
          role: "User",
        },
      });
      await userThatWillUpdate.update({
        role: "Admin",
      });
      res.status(201).send({ success: true });
    } else {
      throw new Error(err);
    }
  } catch (err) {
    res.status(500).send(err);
  }
};
