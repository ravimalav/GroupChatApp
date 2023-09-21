const socket = io("http://13.126.61.40:3000");

socket.on("welcome-message", (data) => {
  document.querySelector(".welcome-message").innerHTML = `<h3>${data}</h3>`;
});

let mainMessageArray = [];
const tBody = document.getElementById("tbody");
const token = localStorage.getItem("token");

//to decode jwt token at front End side
function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}

const loginUserName = parseJwt(token).loginUserName;

window.addEventListener("DOMContentLoaded", async (e) => {
  try {
    e.preventDefault();
    mainMessageArray = [];
    await fetch("http://13.126.61.40:3000/group/getgroupsname", {
      method: "get",
      credential: "include",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: token,
      },
    })
      .then((response) => response.json())

      .then((data) => {
        data.response.forEach((element) => {
          createGroupIcon(element, element.group_name);
        });
      });
  } catch (err) {
    console.log(err);
  }
});

//create new group

const createGroupButton = document.getElementById("creategroupbtn");
const groupIconName = document.querySelector("#tbodyoficon");
createGroupButton.addEventListener("click", async (e) => {
  try {
    const groupName = prompt("enter group name");
    const groupData = await fetch(
      `http://13.126.61.40:3000/group/creategroup`,
      {
        method: "post",
        credential: "include",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: token,
        },
        body: JSON.stringify({ groupName }),
      }
    );
    const res = await groupData.json();

    createGroupIcon(res.response, groupName);
  } catch (err) {
    console.log(err);
  }
});

// function for display user that in the group

const chatUserName = (element) => {
  tBody.innerHTML += `<tr>
    <td><span>${element.username.username}:</span> joined</td>
  </tr>`;
};

//to create dynamic anchor tag and to get target group messages

function createGroupIcon(data, groupName) {
  const div = document.getElementById("groupIconContainer");
  const anchor = document.createElement("a");

  anchor.addEventListener("click", async (e) => {
    e.preventDefault();
    tBody.innerHTML = "";
    socket.emit("add user", { username: loginUserName });

    tBody.innerHTML += `<tr>
        <td><span>You:</span> joined</td>
        </tr>`;
    socket.on("user joined", (data) => {
      chatUserName(data);
    });

    mainMessageArray = [];

    localStorage.setItem("groupId", data.id);

    //To know which user joined the group
    const getUserData = await fetch("http://13.126.61.40:3000/home/getusers", {
      method: "get",
      credential: "include",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: token,
        GroupId: `${data.id}`,
      },
    });

    const getuserData = await getUserData.json();
    const lastEntry = await getuserData.lastentry;
    localStorage.setItem("lastId", lastEntry.message_id);

    //create dropdown box
    dropDown(); //Show Group Admin name on top left

    createFooterFunction(); // creating form to send message
    getOlderMessage();
  });

  //creating group name and icon name
  anchor.innerHTML += `
    <div class="groupname">
      <div class="icon">
          Group-${data.id}
      </div>
      <h5>${groupName}</h5>
    </div>`;
  div.appendChild(anchor);
}

// create footer and send message button

const containerFooter = document.querySelector(".containerFooter");

function createFooterFunction() {
  const groupId = parseInt(localStorage.getItem("groupId"));
  //to create form inside footerdiv
  containerFooter.innerHTML = `<footer class="footer">
    <div class="footerDiv">
       <form action="" id="form">
        <input type="text" name="message" id="message" placeholder="Type a message" autofocus />
        <input type="file" id="myfile" name="myfile" accept="image/*">
        <button id="sendbutton" >send</button>
       </form>
    </div>
  </footer> `;

  //broadcast message that, this user is typing

  function triggerTyping() {
    socket.emit("typing");
    socket.on("typing", (data) => {
      document.querySelector(
        ".typingStatus"
      ).innerHTML = `${data.username.username} typing...`;
    });
  }

  const messageInput = document.getElementById("message");

  //applying oninput event

  messageInput.addEventListener("input", () => {
    triggerTyping();
  });
  // blue event detect when user stop tying or click outside input box
  messageInput.addEventListener("blur", function (e) {
    e.preventDefault();
    document.querySelector(".typingStatus").innerHTML = ``;
  });

  const sendButton = document.getElementById("sendbutton");

  sendButton.addEventListener("click", async (e) => {
    try {
      e.preventDefault();

      socket.emit("stop typing"); //detect event when user stop typing
      socket.on("stop typing", (data) => {
        document.querySelector(".typingStatus").innerHTML = ``;
      });

      const inputMessage = document.getElementById("message").value;
      const fileInput = document.getElementById("myfile").value;

      //to store first 10 value in local storage in form of array

      tBody.innerHTML += `<tr>
                <td><span>You:</span> ${inputMessage}</td>
                </tr>`;

      socket.emit("new message", inputMessage);
      socket.on("new message", (data) => {
        tBody.innerHTML += `<tr>
                <td><span>${data.username.username}:</span> ${data.message}</td>
                </tr>`;
      });

      const postMessage = await fetch(
        `http://13.126.61.40:3000/message/postmessage`,
        {
          method: "post",
          credential: "include",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: token,
            GroupId: `${groupId}`,
          },
          body: JSON.stringify({ inputMessage }),
        }
      );

      const postMessageData = await postMessage.json();
      mainMessageArray.push(postMessageData.response); //store singlel single message in mainMessageArray

      //send ultimedia message link
      if (fileInput) {
        const myFile = document.getElementById("myfile");
        const mediaMessage = await fetch(
          `http://13.126.61.40:3000/message/mediamessage`,
          {
            method: "post",
            credential: "include",
            headers: {
              "Content-Type": "application/json;charset=utf-8",
              Authorization: token,
              GroupId: `${groupId}`,
            },
            body: JSON.stringify({ fileInput }),
          }
        );

        const response = await mediaMessage.json();
        const fileUrl = response.fileurl;

        // storing image in files
        socket.emit("send file", fileUrl);
        tBody.innerHTML += `<div><img src="${fileUrl}" height=50px width=50px></div>`;
        socket.on("sentImg", (data) => {
          tBody.innerHTML += `<div><a id="hreflink"><img src="${data.image}" height=100px width=100px></a></div>`;

          const a = document.getElementById("hreflink");
          a.addEventListener("click", () => {
            a.href = fileUrl;

            a.download = "image.png";
            a.click();
          });
        });
      }
      const form = document.getElementById("form");
      form.reset();
    } catch (err) {
      console.log(err);
    }
  });
}

function getOlderMessage() {
  const groupId = parseInt(localStorage.getItem("groupId"));

  const olderMessageDiv = document.querySelector(".olderMessagediv");

  olderMessageDiv.innerHTML = `<button class="olderMessage">get older message</button>`;

  const olderMessage = document.querySelector(".olderMessage");

  // get older messages
  olderMessage.addEventListener("click", async (e) => {
    try {
      const lastid =
        mainMessageArray.length > 0
          ? mainMessageArray[0].message_id
          : parseInt(localStorage.getItem("lastId"));

      e.preventDefault();
      const oldMessages = await fetch(
        `http://13.126.61.40:3000/message/oldmessages?id=${lastid}`,
        {
          method: "get",
          credential: "include",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: token,
            GroupId: `${groupId}`,
          },
        }
      );

      const result = await oldMessages.json();

      if (result.success === true) {
        //create a array for storing message and then append local storage array with it
        let appendMessageArray = [];
        result.response.forEach((message) => {
          const message_id = message.message_id;
          const message_body = message.message_body;
          const user_name = message.user_name;
          const arrObj = {
            message_id,
            message_body,
            user_name,
          };
          appendMessageArray.push(arrObj);
        });

        mainMessageArray = appendMessageArray.concat(mainMessageArray);

        tBody.innerHTML = ""; //clearing old messages before getting new message

        if (mainMessageArray == null) {
          alert("There is no chat yet!");
        } else {
          for (let i = 0; i < mainMessageArray.length; i++) {
            tBody.innerHTML += `<tr>
            <td><span>${mainMessageArray[i].user_name}:</span> ${mainMessageArray[i].message_body}</td>
            </tr>`;
          }
        }
      } else {
        alert(`${result.response}`);
      }
    } catch (err) {
      console.log(err);
    }
  });
}

// add dropdown(Group info button) at top right of header

function dropDown() {
  document.querySelector(".dropdown").innerHTML = `<span>G-Info </span>
    <label>
      <input type="checkbox">
      <ul>
        <li val="Admin"> <button class="dropdownbutton" id="admin">Admin</button> </li>
        <li val="User-Info"> <button class="dropdownbutton" id="userinfo">User Info</button> </li>
        <li val="Invite-User"> <button class="dropdownbutton" id="inviteuser">Add Member</button> </li>
        <li val="Home=Page"> <button class="dropdownbutton" id="homepage">Home Page</button> </li>
        <li val="Logout"> <button class="dropdownbutton" id="logout">Logout</button> </li>
      </ul>
    </label>`;
  getAdminList();
  inviteUserInGroupFunction();
  userInformationFunction();
  homePageFuntion();
  logoutFunction();
}

//show admin popup in front of screen
const modal = document.getElementById("myModal");
const modalContent = document.querySelector(".modal-content");
const groupId = parseInt(localStorage.getItem("groupId"));

function getAdminList() {
  const groupId = parseInt(localStorage.getItem("groupId"));
  // Get the button that opens the modal
  const admin = document.getElementById("admin");

  admin.addEventListener("click", async (e) => {
    try {
      e.preventDefault();

      const getAdminName = await fetch(
        "http://13.126.61.40:3000/group/getadmin",
        {
          method: "get",
          credential: "include",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: token,
            GroupId: `${groupId}`,
          },
        }
      );

      const result = await getAdminName.json();

      addDataInParagraph(result.response);
    } catch (err) {
      console.log(err);
    }
  });

  // add admin name in paragraph dynamically

  async function addDataInParagraph(data) {
    modalContent.innerHTML = `<span class="close">&times;</span>`;

    data.forEach((element) => {
      modalContent.innerHTML += `
        <p>${element.name} is admin</p>`;
    });
    // Get the <span> element that closes the modal
    const span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal
    {
      modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = "none";
      modalContent.innerHTML = "";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
        modalContent.innerHTML = "";
      }
    };
  }
}

// function to add user in group

function inviteUserInGroupFunction() {
  try {
    const groupId = parseInt(localStorage.getItem("groupId"));
    const inviteUserInGroup = document.getElementById("inviteuser");

    inviteUserInGroup.addEventListener("click", async (e) => {
      e.preventDefault();
      const inviteduserNumber = prompt("Enter User Phone Number");
      const invitedUserData = await fetch(
        `http://13.126.61.40:3000/group/adduseringroup`,
        {
          method: "post",
          credential: "include",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: token,
            GroupId: `${groupId}`,
          },
          body: JSON.stringify({ inviteduserNumber }),
        }
      );
      const result = await invitedUserData.json();

      tBody.innerHTML += `<p>${result.response}</p>`;
    });
  } catch (err) {
    console.log(err);
  }
}

async function userInformationFunction() {
  // Get the button that opens the modal
  const userInfo = document.getElementById("userinfo");

  userInfo.addEventListener("click", async (e) => {
    try {
      e.preventDefault();

      const userInfoData = await fetch(
        "http://13.126.61.40:3000/home/getusers",
        {
          method: "get",
          credential: "include",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            Authorization: token,
            GroupId: `${groupId}`,
          },
        }
      );

      const result = await userInfoData.json();

      showGroupUsers(result.response, result.isadmin.role);
    } catch (err) {
      console.log(err);
    }
  });

  // add admin name and button in paragraph dynamically

  async function showGroupUsers(data, isloginUserAdmin) {
    modalContent.innerHTML = `<span class="close">&times;</span>`;

    data.forEach((element) => {
      const div = document.createElement("div");
      if (isloginUserAdmin === "Admin") {
        div.innerHTML = `
    <p>${element.name}</p>
    <button class="removeButton" id=${element.user_id}>Remove</button>
    <button class="makeAdminButton" id=${element.user_id}>Make Admin</button>`;

        const removeButton = div.querySelector(".removeButton");
        removeButton.addEventListener("click", async (e) => {
          e.preventDefault();
          const userId = e.target.getAttribute("id");
          removeUserFunction(userId);
        });
        const makeAdminButton = div.querySelector(".makeAdminButton");
        makeAdminButton.addEventListener("click", async (e) => {
          e.preventDefault();
          const userId = e.target.getAttribute("id");
          makeAdminFunction(userId);
        });
      } else {
        div.innerHTML = `<p>${element.name}</p>`;
      }

      modalContent.appendChild(div);
    });

    // Get the <span> element that closes the modal
    const span = document.getElementsByClassName("close")[0];
    // When the user clicks the button, open the modal
    {
      modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      modal.style.display = "none";
      modalContent.innerHTML = "";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
        modalContent.innerHTML = "";
      }
    };
  }

  async function removeUserFunction(userId) {
    try {
      await fetch(`http://13.126.61.40:3000/home/removeuser/${userId}`, {
        method: "delete",
        credential: "include",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: token,
          GroupId: `${groupId}`,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function makeAdminFunction(userId) {
    try {
      await fetch(`http://13.126.61.40:3000/home/makeadmin/${userId}`, {
        method: "put",
        credential: "include",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: token,
          GroupId: `${groupId}`,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}

function homePageFuntion() {
  const homePage = document.getElementById("homepage");

  homePage.addEventListener("click", () => {
    window.location.href = "/frontendCode/home/index.html";
  });
}

function logoutFunction() {
  const logoutButton = document.getElementById("logout");
  socket.on("user left", (data) => {
    console.log("disconnected", data.username);
    tBody.innerHTML += `${data.username.username} is disconnected`;
  });
  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("groupId");
    window.location.href = "/frontendCode/signup/signup.html";
  });
}
