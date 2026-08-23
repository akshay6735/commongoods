import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [name,setName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [error,setError]=useState("");const [loading,setLoading]=useState(false);
  const {register}=useAuth();const navigate=useNavigate();
  async function submit(e){e.preventDefault();setError("");setLoading(true);try{await register(name,email,password);navigate("/");}catch(err){setError(err.response?.data?.error||"Could not create account.");}finally{setLoading(false)}}
  return <main className="auth-shell"><form className="auth-card" onSubmit={submit}>
    <div className="auth-logo">Common<span style={{color:"var(--accent)"}}>Goods</span></div>
    <span className="eyebrow">Start your account</span><h1 className="auth-title">Join us.</h1><p className="auth-sub">Create an account to check out faster and keep track of every order.</p>
    {error&&<div className="error-banner">{error}</div>}
    <div className="field"><label htmlFor="name">Full name</label><input id="name" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} required /></div>
    <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
    <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" minLength={6} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
    <button className="btn btn-primary btn-block" disabled={loading}>{loading?"Creating account…":"Create account →"}</button>
    <p style={{fontSize:12,color:"var(--muted)",marginBottom:0,marginTop:18}}>Already a member? <Link to="/login" style={{fontWeight:800}}>Sign in</Link></p>
  </form></main>;
}