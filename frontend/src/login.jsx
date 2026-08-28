import {useState, useEffect} from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email,setEmail]=useState( "");
  const [password,setPassword]=useState("");
  const [errorMsg,setErrorMsg]=useState("");
  const navigate=useNavigate();

  useEffect(()=> {
    if(localStorage.getItem("token")) {
      navigate("/generator");
    }
  },[navigate]);

  const handleLogin=async()=> {
    setErrorMsg("");

    if(!email || !password) {
      setErrorMsg("Please enter valid email and password.");
      return;
    }

    try{
      const res=await fetch("http://localhost:5000/login1", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password}),
      });

      const data=await res.json();

      if(data.token) {
        localStorage.setItem("token",data.token);
        navigate("/generator");    
       } else {
        setErrorMsg(data.error || "Login failed. Please try again later.")
       }
    } catch(err) {
      setErrorMsg("network error. Please check your connection and try again.");
    }
  };

  const handleKeyDown=(e)=> {
    if(e.key=="Enter") handleLogin();
  };

  return(
    <div className='card'>
      <h2>Welcome Back</h2>
      <p className='subtitle'>Sign in to your Email Ghostwriter account</p>

      {errorMsg && <div className='error-msg'>{errorMsg}</div>}
      
      <input 
      type="email"
      placeholder='Type your Email Id..'
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
      onKeyDown={handleKeyDown}/>
      
      <input
      type="password"
      placeholder='Password'
      value={password}
      onChange={(e)=> setPassword(e.target.value)}
      onKeyDown={handleKeyDown}/>
      
      <button onClick={handleLogin}>Login</button>
      
      <p>Don't have an accoutn? <a href="/signup">Sign up here to create a account.</a></p>    
      
   </div>
  );
}

export default Login;
