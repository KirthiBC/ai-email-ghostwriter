import {useState,useEffect} from 'react';
import './App.css';

function Signup() {
    const [email,setEmail]=useState("");
    const [password, setPassword]=useState("");
    const [errorMsg,setErrorMsg]=useState("");
    const[successMsg,setSuccessMsg]=useState("");

    useEffect(()=> {
        if(localStorage.getItem("token")) {
            window.location.href="/";
        }
    },[]);

    const handleSignup=async() => {
        setErrorMsg("");
        setSuccessMsg("");

        if(!email || !password) {
            setErrorMsg("Please enter a valid email and password");
            return;
        }

        if(password.length<6) {
            setErrorMsg("Password must be at least 6 characters");
            return;
        }

        try{
            const res=await fetch("/signup1", {
                method:"POST",
                headers:{ "Content-Type":"application/json"},
                body:JSON.stringify({password,email}),

            });

            const data=await res.json();

            if(data.message) {
                setSuccessMsg("Account Created!! Redirecting to login..");
                setTimeout(()=>{ window.location.href="/login"},1500);
            } else {
                setErrorMsg(data.error|| "Signup Failed, Please try again.");
            }

        }catch (err) {
            setErrorMsg("Network error . Please check your connection.");
        }
        };

        const handleKeyDown= (e)=> {
            if(e.key==="Enter") handleSignup();
        };

        return(
            <div className='card'>
                <h2>Create account</h2>
                <p  className='subtitle'>Join Email Ghostwriter for free</p>

                {errorMsg && <div className='error-msg'>{errorMsg}</div>}
                {successMsg && <div className='success-msg'>{successMsg}</div>}
                
                 <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />  
      
      <button onClick={handleSignup}>Create account</button>  
      
      <p>Already have an account? <a href="/login">Login here</a></p>      
      
       </div> 
        );             
}

export default Signup;