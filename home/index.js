'use strict';
const tBody=document.getElementById('tbody')
const token=localStorage.getItem('token')

//to decode jwt token at front End side
function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

const loginUserName=parseJwt(token).loginUserName


window.addEventListener('DOMContentLoaded',async(e)=>
{
     try{
        e.preventDefault();
         await fetch('http://localhost:3000/group/getgroupsname',
         {method:'get',
         credential:'include',
         headers:{
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization':token
        }})
          .then(response=>response.json())
          .then((data)=>
          {
            data.response.forEach((element)=>
            {
                createGroupIcon(element,element.group_name)
            })
          })   
     }
     catch(err)
     {
        console.log(err)
     }
})

//create new group

const createGroupButton=document.getElementById('creategroupbtn')
const groupIconName=document.querySelector('#tbodyoficon')
createGroupButton.addEventListener('click',async(e)=>
{
    try{
        const groupName=prompt("enter group name")
        const groupData= await fetch(`http://localhost:3000/group/creategroup`,     
        {
            method:'post',
            credential:'include',
            headers:{
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization':token
            },
            body:JSON.stringify({groupName})
        })
        const res=await groupData.json()

        createGroupIcon(res.response,groupName)
        
    }
    catch(err)
    {
      console.log(err)
    }
})


// function for display user that in the group 

const chatUserName=(element)=>
{
    tBody.innerHTML+=`<tr>
    <td><span>${element.name}:</span> joined</td>
  </tr>`
}


//  Create variables to store data in localstore

let id=parseInt(localStorage.getItem('lastId'))||1;
let indx=1;
let array=[];
localStorage.setItem('array',JSON.stringify(array))


const showMessage=async(element)=>
{
        tBody.innerHTML+=`<tr>
        <td><span>${element.user_name}:</span> ${element.message_body}</td>
      </tr>`
}

//to create dynamic anchor tag and to get target group messages

function createGroupIcon(data,groupName)    
{ 
    const div=document.getElementById('groupIconContainer')
    const anchor=document.createElement('a')

    anchor.addEventListener('click',async(e)=>
    {
        e.preventDefault();
         tBody.innerHTML=""
         let arr=JSON.parse(localStorage.getItem('array'));
         arr=[]
         localStorage.setItem('array',JSON.stringify(arr))

         localStorage.setItem('groupId',data.id)
        
        //To know which user joined the group
        const getUserData=await fetch('http://localhost:3000/home/getusers',     
        {
            method:'get',
            credential:'include',
            headers:{
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization':token,
                'GroupId':`${data.id}`
            },
        })
    
        const getuserData=await getUserData.json()
        const getuserArray=getuserData.response
        getuserArray.forEach((element)=>               //show joined user on screen 
        {
            chatUserName(element)
        })


        // const divShowAdmin=document.querySelector('.showadminname')

        // divShowAdmin.innerHTML=`<h6>Group Admin: ${data.admin_name}
        //                         </br>
        //                         You: ${loginUserName}</h6>`

    
        //create dropdown box 
        dropDown()                         //Show Group Admin name on top left

        createFooterFunction()              // creating form to send message 
        getOlderMessage()
    })
      

    //creating group name and icon name
    anchor.innerHTML+=`
    <div class="groupname">
      <div class="icon">
          Group-${data.id}
      </div>
      <h5>${groupName}</h5>
    </div>`
    div.appendChild(anchor) 
}


// create footer and send message button

const containerFooter=document.querySelector('.containerFooter')

function createFooterFunction()
{
    const groupId=parseInt(localStorage.getItem('groupId'))
    //to create form inside footerdiv
    containerFooter.innerHTML=`<footer class="footer">
    <div class="footerDiv">
       <form action="" id="form">
        <input type="text" name="message" id="message" placeholder="Type a message" autofocus/>
        <button id="sendbutton">send</button>
       </form>
    </div>
  </footer> `
   
   const sendButton=document.getElementById('sendbutton')

sendButton.addEventListener('click',async(e)=>
{
    try{
        e.preventDefault();
        const inputMessage=document.getElementById('message').value
        //to store first 10 value in local storage in form of array
   
        const arrayItem={id,inputMessage,user_name:loginUserName}
        array=JSON.parse(localStorage.getItem('array'))
        array.push(arrayItem) 
        localStorage.setItem('array',JSON.stringify(array))
        id++;
        localStorage.setItem('lastId',id);     
        indx++;
        if(indx>10) 
        {
            console.log("index is greter than 10")
            indx=1;
            array=[];
        }

        // Showing single message on screen

           const parsedArray=JSON.parse(localStorage.getItem('array'))
            if(parsedArray==null)
            {
                alert("There is no chat yet!")
            }
            else
            {
                
                tBody.innerHTML+=`<tr>
                <td><span>${loginUserName}:</span> ${inputMessage}</td>
                </tr>`
                
            }

         await fetch(`http://localhost:3000/message/postmessage`,     
        {
            method:'post',
            credential:'include',
            headers:{
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization':token,
                'GroupId':`${groupId}`
            },
            body:JSON.stringify({inputMessage})
        })
        
         const form=document.getElementById('form')
         form.reset();
    }
    catch(err)
    {
        console.log(err)
    }
   })
}

function getOlderMessage()
{
    const groupId=parseInt(localStorage.getItem('groupId'))
    
    const olderMessageDiv=document.querySelector('.olderMessagediv')

    olderMessageDiv.innerHTML=`<button class="olderMessage">get older message</button>`

    const olderMessage=document.querySelector('.olderMessage')
  

    const lastId=parseInt(localStorage.getItem('lastId'))
    // get older messages 
    olderMessage.addEventListener('click',async(e)=>
    {
    try{
        array=JSON.parse(localStorage.getItem('array'))
        const firstId=array.length>0?array[0].id:lastId
            e.preventDefault();
            const oldMessages=  await fetch(`http://localhost:3000/message/oldmessages?id=${firstId}`,
            {method:'get',
            credential:'include',
            headers:{
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization':token,
            'GroupId':`${groupId}`
        }})

        const result=await oldMessages.json()

        if(result.success===true)
        {
            //create a array for storing message and then append local storage array with it
        let appendMessageArray=[]
        result.response.forEach((message)=>
        {
            const id=message.message_id
            const inputMessage=message.message_body
            const user_name=message.user_name
            const arrObj={
                id,
                inputMessage,
                user_name
            }
            appendMessageArray.push(arrObj)
        }) 
        let appendedArray=appendMessageArray.concat(JSON.parse(localStorage.getItem('array')))
        localStorage.setItem('array',JSON.stringify(appendedArray))

        tBody.innerHTML=""      //clearing old messages before getting new message

        //get all messages old+new
           const parsedArray=JSON.parse(localStorage.getItem('array'))
        if(parsedArray==null)
        {
            alert("There is no chat yet!")
        }
        else
        {
            for(let i=0;i<parsedArray.length;i++)
            {       
            tBody.innerHTML+=`<tr>
            <td><span>${parsedArray[i].user_name}:</span> ${parsedArray[i].inputMessage}</td>
            </tr>`
            }
        }
        }
        else
        {
             alert(`${result.response}`)
        }
    }
    catch(err)
    {
        console.log(err)
    }
    })
}


// add dropdown(Group info button) at top right of header

function dropDown()
{
    document.querySelector('.dropdown').innerHTML=
    `<span>G-Info </span>
    <label>
      <input type="checkbox">
      <ul>
        <li val="Admin"> <button class="dropdownbutton" id="admin">Admin</button> </li>
        <li val="User-Info"> <button class="dropdownbutton" id="userinfo">User Info</button> </li>
        <li val="Invite-User"> <button class="dropdownbutton" id="inviteuser">Add Member</button> </li>
        <li val="Home=Page"> <button class="dropdownbutton" id="homepage">Home Page</button> </li>
        <li val="Logout"> <button class="dropdownbutton" id="logout">Logout</button> </li>
      </ul>
    </label>`
     getAdminList();
     inviteUserInGroupFunction();
     userInformationFunction();
     homePageFuntion();
     logoutFunction();
}

//show admin popup in front of screen
const modal = document.getElementById("myModal");
const modalContent=document.querySelector('.modal-content')
const groupId=parseInt(localStorage.getItem('groupId'))


function getAdminList()
{
const groupId=parseInt(localStorage.getItem('groupId'))
// Get the button that opens the modal
const admin=document.getElementById('admin')


admin.addEventListener('click',async(e)=>
{
    try{
            e.preventDefault();
            
           const getAdminName=await fetch('http://localhost:3000/group/getadmin',
           {
            method:'get',
            credential:'include',
            headers:{
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization':token,
            'GroupId':`${groupId}`
            }
           })

           const result=await getAdminName.json();
  
           addDataInParagraph(result.response)
    }
    catch(err)
    {
         console.log(err);
    }
})

// add admin name in paragraph dynamically

async function addDataInParagraph(data)
{   
    modalContent.innerHTML=`<span class="close">&times;</span>`

   data.forEach((element)=>
    {
        modalContent.innerHTML+=`
        <p>${element.name} is admin</p>`
    })
// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
 {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
  modalContent.innerHTML="";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    modalContent.innerHTML="";
  }
}
}}

// function to add user in group

function inviteUserInGroupFunction(){
    try{
        
        const groupId=parseInt(localStorage.getItem('groupId'))
        const inviteUserInGroup=document.getElementById('inviteuser')

        inviteUserInGroup.addEventListener('click',async(e)=>
        {
            e.preventDefault();
            const inviteduserNumber=prompt("Enter User Phone Number")
            const invitedUserData=await fetch(`http://localhost:3000/group/adduseringroup`,     
            {
                method:'post',
                credential:'include',
                headers:{
                    'Content-Type': 'application/json;charset=utf-8',
                    'Authorization':token,
                    'GroupId':`${groupId}`
                },
                body:JSON.stringify({inviteduserNumber})
            })
            const result=await invitedUserData.json()
            
            tBody.innerHTML+=`<p>${result.response}</p>`
        })
    }
    catch(err)
    {
       console.log(err)
    }
}


async function userInformationFunction()
{   
// Get the button that opens the modal
const userInfo=document.getElementById('userinfo')

userInfo.addEventListener('click',async(e)=>
{
    try{
           e.preventDefault();
            
           const userInfoData=await fetch('http://localhost:3000/home/getusers',
           {
            method:'get',
            credential:'include',
            headers:{
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization':token,
            'GroupId':`${groupId}`
            }
           })

           const result=await userInfoData.json();
        
           showGroupUsers(result.response,result.isadmin.role)
    }
    catch(err)
    {
         console.log(err);
    }
})

// add admin name and button in paragraph dynamically

async function showGroupUsers(data,isloginUserAdmin)
{
modalContent.innerHTML=`<span class="close">&times;</span>`

  data.forEach((element)=>
   {
    const div=document.createElement('div')
    if(isloginUserAdmin==='Admin')
    {
    div.innerHTML=`
    <p>${element.name}</p>
    <button class="removeButton" id=${element.user_id}>Remove</button>
    <button class="makeAdminButton" id=${element.user_id}>Make Admin</button>`
      
    const removeButton=div.querySelector('.removeButton')
    removeButton.addEventListener('click',async(e)=>
    {
        e.preventDefault()
        const userId=e.target.getAttribute('id')
        removeUserFunction(userId)
    })
    const makeAdminButton=div.querySelector('.makeAdminButton')
    makeAdminButton.addEventListener('click',async(e)=>
    {
        e.preventDefault()
        const userId=e.target.getAttribute('id')
        makeAdminFunction(userId)
    })
}
else{
    div.innerHTML=`<p>${element.name}</p>`
}

    modalContent.appendChild(div)    
   })

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];
// When the user clicks the button, open the modal 
 {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
  modalContent.innerHTML="";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    modalContent.innerHTML="";
  }
}
}

async function removeUserFunction(userId)
{
    try{
        await fetch(`http://localhost:3000/home/removeuser/${userId}`,
        {
        method:'delete',
        credential:'include',
        headers:{
        'Content-Type': 'application/json;charset=utf-8',
        'Authorization':token,
        'GroupId':`${groupId}`
        }
        }) 
    }
    catch(err)
    {
        console.log(err)
    }
} 

async function makeAdminFunction(userId)
{
    try{
        await fetch(`http://localhost:3000/home/makeadmin/${userId}`,
        {
        method:'put',
        credential:'include',
        headers:{
        'Content-Type': 'application/json;charset=utf-8',
        'Authorization':token,
        'GroupId':`${groupId}`
        }
        }) 
    }
    catch(err)
    {
        console.log(err)
    }
}
}


function homePageFuntion()
{
    const homePage=document.getElementById('homepage')
    
    homePage.addEventListener('click',()=>
    {
         window.location.href='/home/index.html'
    })
}

function logoutFunction()
{
    const logoutButton=document.getElementById('logout')
    logoutButton.addEventListener('click',()=>
    {
        localStorage.removeItem('token')
        localStorage.removeItem('groupId')
        window.location.href='/signup/signup.html'
    })
}



