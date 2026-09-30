"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../lib/fireBase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Loading from "../loading/loading";
import "./login.scss";

export default function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);
  const [showContent, setShowContent] = useState(true); // true = heading, false = image

  const headings = [
    "Aj he apni ecommerce website banain",
    "Launch Your Online Store in a Single Click.",
    "Create your ecommerce website",
  ];

  const images = ["/one.webp", "/two.webp", "/three.webp"];

  const handleUser = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        shopInfo: null,
        createdAt: new Date(),
      });
      router.replace("/shopsetup");
    } else {
      router.replace(snap.data().shopInfo ? "/dashboard" : "/shopsetup");
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) handleUser(user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setError("");
    setResetSuccess("");
    setIsSubmitting(false);
  }, [isSignup, showAuthModal, showForgotPassword]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowContent((prev) => {
        if (prev) {
          // Currently showing heading, switch to image
          setCurrentImage((img) => (img + 1) % images.length);
        } else {
          // Currently showing image, switch to heading
          setCurrentHeading((head) => (head + 1) % headings.length);
        }
        return !prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handlePasswordReset = async () => {
    setError("");
    setResetSuccess("");

    if (!resetEmail) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(resetEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(
        "Password reset email sent! Check your inbox or spam folder.",
      );
      setResetEmail("");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.message || "Failed to send reset email.",
      );
    }
  };

  const handleAuth = async () => {
    setError("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (isSignup) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      if (!confirmPassword) {
        setError("Please confirm your password.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      if (isSignup) {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await handleUser(result.user);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await handleUser(result.user);
      }

      setShowAuthModal(false);
    } catch (err) {
      setError(
        err.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : err.message || "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <div className="alert-backdrop">
          <div className="alert-box auth-modal">
            <h3>Reset Password</h3>
            <p
              style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <input
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                setError("");
                setResetSuccess("");
              }}
            />

            {/* ERROR MESSAGE */}
            {error && (
              <p style={{ color: "red", fontSize: "14px", marginTop: "8px" }}>
                {error}
              </p>
            )}

            {/* SUCCESS MESSAGE */}
            {resetSuccess && (
              <p style={{ color: "green", fontSize: "14px", marginTop: "8px" }}>
                {resetSuccess}
              </p>
            )}

            <button className="btn-primary" onClick={handlePasswordReset}>
              Send Reset Link
            </button>

            <p className="auth-switch">
              Remember your password?{" "}
              <span
                style={{ color: "green", fontWeight: "700" }}
                onClick={() => {
                  setShowForgotPassword(false);
                  setShowAuthModal(true);
                  setResetEmail("");
                  setError("");
                  setResetSuccess("");
                }}
              >
                Back to Login
              </span>
            </p>

            <button
              className="btn-outline"
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmail("");
                setError("");
                setResetSuccess("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="alert-backdrop">
          <div className="alert-box auth-modal">
            <h3>{isSignup ? "Create Account" : "Login"}</h3>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#0a7a3b",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            {isSignup && (
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#0a7a3b",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
            )}

            {/* INLINE ERROR */}
            {error && (
              <p style={{ color: "red", fontSize: "14px", marginTop: "8px" }}>
                {error}
              </p>
            )}

            {!isSignup && (
              <p
                style={{
                  textAlign: "right",
                  fontSize: "13px",
                  marginTop: "8px",
                  cursor: "pointer",
                  color: "#0a7a3b",
                  fontWeight: "600",
                }}
                onClick={() => {
                  setShowAuthModal(false);
                  setShowForgotPassword(true);
                }}
              >
                Forgot Password?
              </p>
            )}

            <button
              className="btn-primary"
              onClick={handleAuth}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner" />
                  {isSignup ? "Signing up..." : "Logging in..."}
                </>
              ) : (
                <>{isSignup ? "Sign Up" : "Login"}</>
              )}
            </button>

            <p className="auth-switch">
              {isSignup ? "Already have an account?" : "New here?"}{" "}
              <span
                style={{ color: "green", fontWeight: "700" }}
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Login" : "Create account"}
              </span>
            </p>

            <button
              className="btn-outline"
              onClick={() => setShowAuthModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header id="nav-bar">
        <Image src="/logo.webp" alt="GharSaDukan Logo" width={40} height={40} />
        <div id="heading">
          <h1>
            <span>G</span>har<span>S</span>a<span>D</span>ukan
          </h1>
        </div>
        <button className="btn-outline" onClick={() => setShowAuthModal(true)}>
          Login
        </button>
      </header>

      {/* HERO */}
      <div id="hero-outer">
        <section id="hero">
          {showContent ? (
            <div
              id="hero-glass-container"
              key={`heading-${currentHeading}`}
              className="fade-in"
            >
              <div id="hero-text">
                <h1
                  style={{ color: "rgb(238, 238, 238)" }}
                  className="animated-heading"
                >
                  {headings[currentHeading]}
                </h1>
                <p style={{ color: "black" }}>
                  GharSaDukan empowers shopkeepers to create a professional
                  e-commerce website, manage products, orders, and payments.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setShowAuthModal(true)}
                  style={{ border: "2px solid white" }}
                >
                  Create Your Store
                </button>
              </div>
            </div>
          ) : (
            <div
              id="hero-image-container"
              key={`image-${currentImage}`}
              className="fade-in"
            >
              <Image
                src={images[currentImage]}
                alt="Hero Image"
                width={800}
                height={500}
                style={{
                  borderRadius: "24px",
                  objectFit: "contain",
                  maxWidth: "100%",
                  height: "auto",
                }}
                unoptimized
              />
            </div>
          )}
        </section>
      </div>
      {/* FEATURES */}
      <section id="features-intro">
        <h2>Effortless E-commerce Solutions for Every Storekeeper</h2>
        <p>Powerful features designed to help your business thrive.</p>
      </section>

      <section id="features">
        {[
          "Instant Store Creation",
          "Stunning Designs",
          "Product Management",
          "Order Tracking",
          "Sales Analytics",
        ].map((title, i) => (
          <div className="feature-card" key={i}>
            <h3>{title}</h3>
            <p>Built to simplify your business.</p>
          </div>
        ))}
      </section>

      {/* DROPSHIPPING SECTION */}
      <section
        id="dropshipping"
        style={{
          padding: "60px 20px",
          background: "linear-gradient(135deg, #0a7a3b 0%, #0d9448 100%)",
          color: "white",
          textAlign: "center",
          marginBottom: "80px",
        }}
      >
        <h2
          style={{
            fontSize: "2.5rem",
            marginBottom: "20px",
            fontWeight: "700",
          }}
        >
          Start Dropshipping with GharSaDukan
        </h2>
        <p
          style={{
            fontSize: "1.2rem",
            maxWidth: "800px",
            margin: "0 auto 30px",
            lineHeight: "1.6",
          }}
        >
          No inventory? No problem! Visit any shop, upload their products to
          your app, and start selling through your website. Earn profits without
          holding stock.
        </p>
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "30px",
              borderRadius: "12px",
              maxWidth: "300px",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", marginBottom: "10px" }}>
              📸 Step 1
            </h3>
            <p>Visit a local shop and take photos of products</p>
          </div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "30px",
              borderRadius: "12px",
              maxWidth: "300px",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", marginBottom: "10px" }}>
              📱 Step 2
            </h3>
            <p>Upload products to your GharSaDukan store</p>
          </div>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "30px",
              borderRadius: "12px",
              maxWidth: "300px",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3 style={{ fontSize: "1.3rem", marginBottom: "10px" }}>
              💰 Step 3
            </h3>
            <p>Start selling and earning profits online</p>
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowAuthModal(true)}
          style={{
            marginTop: "40px",
            background: "white",
            color: "#0a7a3b",
            fontSize: "1.2rem",
            padding: "15px 40px",
            fontWeight: "700",
            border: "none",
          }}
        >
          Start Selling
        </button>
      </section>

      {/* CTA */}
      <section id="cta">
        <h2>Ready to Start Your Online Journey?</h2>
        <p>Join thousands of shopkeepers growing their business.</p>
        <div className="cta-buttons">
          <button
            className="btn-outline"
            onClick={() => setShowAuthModal(true)}
          >
            Login
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowAuthModal(true)}
          >
            Create Your Store
          </button>
        </div>
      </section>

    </>
  );
}
