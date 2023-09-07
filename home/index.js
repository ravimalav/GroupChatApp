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
console.log("login user name is "+loginUserName)

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
            console.log(data.response)

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
        getuserArray.forEach((element)=>
        {
            chatUserName(element)
        })
        
        //Show Group Admin name on top left

        const divShowAdmin=document.querySelector('.showadminname')

        divShowAdmin.innerHTML=`<h6>Group Admin: ${data.admin_name}
                                </br>
                                You: ${loginUserName}</h6>`

        // creating form to send message 
        createFooterFunction(data.id)
        getOlderMessage(data.id)
        addUserInGroupFunction(data.id)
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


const containerFooter=document.querySelector('.containerFooter')

function createFooterFunction(groupId)
{
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

function getOlderMessage(groupId)
{
    const olderMessageDiv=document.querySelector('.olderMessagediv')

    olderMessageDiv.innerHTML=`<button class="olderMessage">get older message</button>`

    const olderMessage=document.querySelector('.olderMessage')
  
    array=JSON.parse(localStorage.getItem('array'))
    console.log("array in ls is ", localStorage.getItem('array'))
    // get older messages 
    olderMessage.addEventListener('click',async(e)=>
    {
    try{
        console.log("triggered")
            e.preventDefault();
            const oldMessages=  await fetch(`http://localhost:3000/message/oldmessages?id=${array[0].id}`,
            {method:'get',
            credential:'include',
            headers:{
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization':token,
            'GroupId':`${groupId}`
        }})

        const response=await oldMessages.json()

        //create a array for storing message and then append local storage array with it
        let appendMessageArray=[]
            response.response.forEach((message)=>
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

            tBody.innerHTML=""      //clearing new messages before getting new message

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
    catch(err)
    {
        console.log(err)
    }
    })
}


// function to add user in group

function addUserInGroupFunction(groupId){
    try{
        const divInviteUser=document.querySelector('.adduseringroup')

        divInviteUser.innerHTML+=`<button id="inviteuser">add user</button>`

        const inviteUserInGroup=document.getElementById('inviteuser')


        inviteUserInGroup.addEventListener('click',async(e)=>
        {
            e.preventDefault();
            const inviteduserid=prompt("Enter Userid")
            const invitedUserData=await fetch(`http://localhost:3000/group/adduseringroup`,     
            {
                method:'post',
                credential:'include',
                headers:{
                    'Content-Type': 'application/json;charset=utf-8',
                    'Authorization':token,
                    'GroupId':`${groupId}`
                },
                body:JSON.stringify({inviteduserid})
            })
            const result=await invitedUserData.json()
             console.log("inviteduserdata  ", result.response)
            tBody.innerHTML+=`<p>${result.response}</p>`
        })
    }
    catch(err)
    {
       console.log(err)
    }
}



