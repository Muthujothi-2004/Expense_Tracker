import React, { useState } from "react";
import { auth, googleProvider, db } from "../firebase/firebase.config";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setName("");
    setErrorMsg("");
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          uid: user.uid,
        });
      }
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(
        err.message === "auth/popup-closed-by-user"
          ? "Google sign-in was canceled."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    setLoading(true);
    console.log({ name, email, password });
    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          name,
          email,
          uid: res.user.uid,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  function handleChange(e, setState) {
    setState(e.target.value);
  }

  return (
    <div className="d-flex justify-content-center align-items-center max-vh-100 bg-light"
    style={{
        backgroundImage: "url(https://media.istockphoto.com/id/1368169112/vector/money-green-seamless-pattern-vector-background-included-line-icons-as-piggy-bank-wallet.jpg?s=612x612&w=0&k=20&c=qjIUpnUPtiKGBgLnXGLQ_4qQUq36OvP82DIFTAdch70=)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        width: "100vw",
    
      }} >
      <div className="card shadow p-4 w-100" style={{ maxWidth: "400px" }}>
        <h2 className="text-center text-success mb-4">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        {isSignUp && (
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={name}
              onChange={(e) => handleChange(e, setName)}
            />
          </div>
        )}

        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => handleChange(e, setEmail)}
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => handleChange(e, setPassword)}
          />
        </div>

        <button
          className="btn btn-success w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
          onClick={handleAuth}
          disabled={loading}
        >
          {loading && (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          )}
          {isSignUp ? "Sign Up" : "Login"}
        </button>

        <div className="d-flex align-items-center my-2">
          <hr className="flex-grow-1" />
          <span className="px-2 text-muted">or</span>
          <hr className="flex-grow-1" />
        </div>

        <button
          className="btn btn-outline-dark w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <img
            src="https://img.icons8.com/color/24/000000/google-logo.png"
            alt="google"
            style={{ width: "20px", height: "20px" }}
          />
          Continue with Google
        </button>

        <p className="text-center mt-3">
          {isSignUp ? "Already have an account?" : "New to the app?"}{" "}
          <button
            onClick={toggleForm}
            className="btn btn-link p-0 text-decoration-underline text-primary"
          >
            {isSignUp ? "Login here" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
