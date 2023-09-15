const express = require("express");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:5500"],
  },
});

const dotenv = require("dotenv");
dotenv.config();

const path = require("path");

const sequelize = require("./util/database");

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const cors = require("cors");
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const userRouter = require("./routes/user");
app.use("/user", userRouter);

const homeRouter = require("./routes/home");
app.use("/home", homeRouter);

const groupRouter = require("./routes/group");

app.use("/group", groupRouter);

const messageRouter = require("./routes/message");
app.use("/message", messageRouter);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, `frontendCode/${req.url}`));
});

//assosiations

const User = require("./models/user");
const Message = require("./models/message");

User.hasMany(Message); //many to many
Message.belongsTo(User); //one to many with foreign key in model B

const Group = require("./models/group");
const UserGroupTable = require("./models/usergroup");
const { Socket } = require("socket.io");
Group.belongsToMany(User, { through: UserGroupTable });
User.belongsToMany(Group, { through: UserGroupTable });

Group.hasMany(Message);
Message.belongsTo(Group);

sequelize.sync().then(() => {
  server.listen(3000);
});

// Chatroom

let numUsers = 0;

io.on("connection", (socket) => {
  let addedUser = false;
  //    console.log(socket)
  // when the client emits 'new message', this listens and executes
  socket.on("new message", (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit("new message", {
      username: socket.username,
      message: data,
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on("add user", (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit("login", {
      numUsers: numUsers,
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit("user joined", {
      username: socket.username,
      numUsers: numUsers,
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on("typing", () => {
    socket.broadcast.emit("typing", {
      username: socket.username,
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", {
      username: socket.username,
    });
  });

  // when the user disconnects.. perform this
  socket.on("disconnect", () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit("user left", {
        username: socket.username,
        numUsers: numUsers,
      });
    }
  });
});
