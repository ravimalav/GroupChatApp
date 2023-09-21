const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("signin-btn");
const mainContainer = document.querySelector(".container");

signupBtn.addEventListener("click", () => {
  mainContainer.classList.toggle("change");
});
loginBtn.addEventListener("click", () => {
  mainContainer.classList.toggle("change");
});

// to handle signup
const signupButton = document.querySelector("#signupbtn");

signupButton.addEventListener("click", async (e) => {
  try {
    e.preventDefault();
    const userName = document.getElementById("username").value;
    const userEmail = document.getElementById("useremail").value;
    const userPhoneNumber = document.getElementById("userphone").value;
    const userPassword = document.getElementById("userpassword").value;

    const obj = {
      userName,
      userEmail,
      userPhoneNumber,
      userPassword,
    };

    //  const signupData=await axios.post('http://13.126.61.40:3000/user/signup',obj)
    const signupData = await fetch("http://13.126.61.40:3000/user/signup", {
      method: "POST",
      credential: "include",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(obj),
    });
    const response = await signupData.json();
    if (response.success === true) {
      alert("user created successfully");
    } else if (response.success === false) {
      alert("user already exist, please login");
      mainContainer.classList.toggle("change");
    } else {
      throw new Error(response.error);
    }
  } catch (err) {
    console.log(err);
  }
});

// to handle log in

const loginButton = document.getElementById("loginbtn");

loginButton.addEventListener("click", async (e) => {
  try {
    e.preventDefault();
    const loginEmail = document.querySelector("#loginemail").value;
    const loginPassword = document.querySelector("#loginpassword").value;

    const obj = {
      loginEmail,
      loginPassword,
    };

    const loginData = await fetch("http://13.126.61.40:3000/user/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(obj),
    });

    const response = await loginData.json();
    if (response.success == true) {
      alert("bravo!,welcome to group chat app");
      localStorage.setItem("token", response.token);
      window.location.href = "/frontendCode/home/index.html";
    } else if (response.success === false) {
      alert("new user,please signup!");
      mainContainer.classList.toggle("change");
    } else if (response.error === "error") {
      alert("incorrect password");
    } else {
      throw new Error(response.error);
    }
  } catch (err) {
    console.log(err);
  }
});
