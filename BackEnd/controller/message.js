const { Op } = require("sequelize");
const Message = require("../models/message");
const AWS = require("aws-sdk");
const process = require("process");
const fs = require("fs");

exports.getMessages = async (req, res) => {
  try {
    const groupId = req.header("GroupId");
    const getMessage = await Message.findAll({
      where: {
        groupTableId: groupId,
        userUserId: req.user.id,
      },
    });
    res.status(201).send({ response: getMessage, success: true });
  } catch {
    res.status(500).send({ err: "can't get messages at this time" });
  }
};

exports.postmessage = async (req, res) => {
  try {
    const { inputMessage } = req.body;
    const username = req.user.name;
    const groupId = req.header("GroupId");
    const createMessage = await Message.create({
      message_body: inputMessage,
      user_name: req.user.name,
      userUserId: req.user.user_id,
      groupTableId: groupId,
    });
    res.status(201).send({ response: createMessage });
  } catch (err) {
    res.status(500).send({ error: "something wrong in chat system" });
  }
};

exports.oldmessages = async (req, res) => {
  try {
    if (+req.query.id === 1) {
      return res.status(500).send({ response: "There is no message in group" });
    }
    const lastId = +req.query.id;
    const groupId = req.header("GroupId");

    const findOldMessages = await Message.findAll({
      where: {
        groupTableId: groupId,
        message_id: { [Op.lt]: [lastId] },
      },
      order: [["message_id", "ASC"]],
    });
    const records = await findOldMessages.map((message) => message.dataValues);

    if (records.length >= 10) {
      let newRecord = [];
      for (let i = records.length - 10; i < records.length; i++) {
        newRecord.push(records[i]);
      }
      res.status(201).send({ response: newRecord, success: true });
    } else if (records.length === 0) {
      res
        .status(201)
        .send({ response: "There is no more old messages", success: false });
    } else {
      res.status(201).send({ response: records, success: true });
    }
  } catch {
    res.status(500).send({
      error: "Something went wrong at server side to get old messages",
    });
  }
};

async function uploadToS3(data, filename) {
  try {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    let s3Bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
    });

    let params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: Buffer.from(data, "binary"),
      // Body: data,
      ContentEncoding: "base64",
      ContentType: "image/jpeg/png",
      ACL: "public-read",
    };
    console.log("data in body=====>>>>>> ", params.Body);
    return new Promise((res, rej) => {
      s3Bucket.upload(params, (err, s3response) => {
        if (err) {
          rej(console.log("error from s3 bucket", err));
        } else {
          console.log("success from s3 bucket", s3response);
          res(s3response.Location);
        }
      });
    });
  } catch (err) {
    console.log(err);
  }
}

exports.mediamessage = async (req, res) => {
  try {
    const mediafile = req.body.fileInput;
    const fileName = `${req.user.name} on:${new Date()} media.png`;
    const fileUrl = await uploadToS3(mediafile, fileName);
    res.status(201).send({ fileurl: fileUrl, success: true });
  } catch (err) {
    res.status(500).send(err);
  }
};
