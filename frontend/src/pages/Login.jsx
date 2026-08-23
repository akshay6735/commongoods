import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const {login}=useAuth(); const navigate=useNavigate(); const location=useLocation();
  async function submit(e){e.preventDefault();setError("");setLoading(true);try{await login(email,password);navigate(location.state?.from?.pathname||"/");}catch(err){setError(err.response?.data?.error||"Could not sign in.");}finally{setLoading(false)}}
  return <main className="auth-shell"><form className="auth-card" onSubmit={submit}>
    <div className="auth-logo">Common<span style={{color:"var(--accent)"}}>Goods</span></div>
    <span className="eyebrow">Welcome back</span><h1 className="auth-title">Sign in.</h1><p className="auth-sub">Pick up where you left off and keep your everyday collection close.</p>
    {error&&<div className="error-banner">{error}</div>}
    <div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
    <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
    <button className="btn btn-primary btn-block" disabled={loading}>{loading?"Signing in…":"Sign in →"}</button>
    <p style={{fontSize:12,color:"var(--muted)",marginBottom:0,marginTop:18}}>New here? <Link to="/register" style={{fontWeight:800}}>Create an account</Link></p>
    <div className="auth-demo"><strong>Demo admin</strong><br/>admin@storefront.dev · admin123</div>
  </form></main>;
}