import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from './assets/email.jpg';
import "./generator.css";

function Generator() {
    const [notes,setNotes]=useState("");
    const [tone, setTone]=useState("Professional");
 
  const [loading, setLoading]=useState(false);
  const [toastMsg, setToastMsg]=useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const navigate=useNavigate();

//   useEffect(()=> {
//     document.body.classList.add("generator.bg");
//     return()=> {
//         document.body.classList.remove("generator.bg");
//     };
//   },[]);

useEffect(() => {
    document.body.style.setProperty("--bg-image",`url(${bgImage})`);
    document.body.classList.add("generator-bg");

    return() => {
        document.body.classList.remove("generator-bg");
        document.body.style.removeProperty('--bg-image');
    };
},[]);

  const showToast=(message)=> {
    setToastMsg(message);
    setTimeout(()=>setToastMsg(""),3000);

  };

  const handleGenerate=async()=> {
    if(notes.trim()==="") {
        showToast("Please enter some notes!");
        return;
    }
    setLoading(true);

    try{
        const response=await fetch("http://localhost:5000/generate-email", {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                "Authorization":localStorage.getItem("token") || "",
            },
            body:JSON.stringify({notes,tone}),
        });

        const data=await response.json();
        // console.log("Full API response: ",data);

        if(response.ok) {
            // console.log("Setting email state to: ",data.email);
            setGeneratedEmail(data.email);
            showToast("Email Generated & Saved! ✨");
        } else {
            showToast("AI is busy right now.PLEASE try again in a minute.");
        }
    } catch(err) {
        showToast("Server Error");
    } finally{
        setLoading(false);
    }
  };

  const handleLogout=() => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return(
    
    <div className="generator-wrapper">
    {/* <div className='img'></div> */}
    <div className="container">
        <h1>📧 Email Ghostwriter</h1>
        <p className="welcome">Generate Professional emails instantly.</p>

        <textarea
        placeholder='e.g. Asking boss for sick leave..'
        value={notes}
        onChange={(e)=>setNotes(e.target.value)}/>

        <select 
        value={tone}
        onChange={(e)=> setTone(e.target.value)}>
            <option value="Professional">👔 Professional</option>
            <option value="Friendly">😊 Friendly</option>
            <option value="Urgent">🚨 Urgent</option>
            
        </select>

        <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Writing..": "Generate Email"}
        </button>

       {generatedEmail && (
        <div id="result">
          {generatedEmail}
        </div>
      )}

        <div className='nav-buttons'>
            <button className='nav-btn secondary' onClick={()=> navigate("/history")}>View History</button>
            <button className="nav-btn danger" onClick={handleLogout}>Logout</button>
      </div>

      {toastMsg && <div className="toast show">{toastMsg}</div>}
        </div>
   </div>
  );

}

export default Generator;