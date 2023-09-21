const express = require("express");

const router = express.Router();

const authentication = require("../authenticate/auth");

const messageController = require("../controller/message");
router.get(
  "/getmessages",
  authentication.authenticate,
  messageController.getMessages
);
router.post(
  "/postmessage",
  authentication.authenticate,
  messageController.postmessage
);
router.get(
  "/oldmessages",
  authentication.authenticate,
  messageController.oldmessages
);
router.post(
  "/mediamessage",
  authentication.authenticate,
  messageController.mediamessage
);

module.exports = router;
