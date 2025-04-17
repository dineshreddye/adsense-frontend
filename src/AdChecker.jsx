import React, { useState, useEffect } from "react";
import AdResultCard from "./AdResultCard";
import RewrittenAdCard from "./RewrittenAdCard";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};


initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const allowedEmails = ["dineshreddyedr@gmail.com", "a.guggilla@clicksco.com"];

export default function AdChecker() {
  const [user, setUser] = useState(null);
  const [url, setUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const signIn = () => {
    signInWithPopup(auth, provider).catch(console.error);
  };

  const signOutUser = () => {
    signOut(auth);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("url", url);
    formData.append("headline", headline);
    formData.append("description", description);
    formData.append("primary_text", primaryText);
    formData.append("keywords", keywords);
    images.forEach((image) => formData.append("images", image));

    try {
      const response = await fetch("https://adsense-backend.onrender.com/analyze_with_gemini", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error:", err);
    }

    setLoading(false);
  };

  const getImageComplianceStatus = (score) => {
    if (score < 40) return "❌ Image Not Compliant";
    if (score < 50) return "⚠️ Image Relevance Warning";
    return null;
  };

  const isAuthorized = user && allowedEmails.includes(user.email);

  if (!user || !isAuthorized) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-center mb-6">🎯 AdSense Ad Compliance Checker</h1>
        {!user && (
          <button onClick={signIn} className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow">
            🔐 Login with Google
          </button>
        )}
        {user && !isAuthorized && (
          <div className="text-center text-red-600 mt-4">
            🚫 You are not authorized to access this tool.
            <button onClick={signOutUser} className="block text-sm text-gray-600 underline mt-2">Logout</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-10 space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          🎯 AdSense Ad Compliance Checker
        </h1>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Logged in as: {user.email}</p>
          <button onClick={signOutUser} className="text-sm text-red-500 underline">
            Logout
          </button>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <input required className="w-full px-4 py-3 border rounded-xl" placeholder="Article URL" value={url} onChange={(e) => setUrl(e.target.value)} />
          <input required className="w-full px-4 py-3 border rounded-xl" placeholder="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          <input required className="w-full px-4 py-3 border rounded-xl" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <textarea required className="w-full px-4 py-3 border rounded-xl" rows={5} placeholder="Primary Text" value={primaryText} onChange={(e) => setPrimaryText(e.target.value)} />
          <textarea className="w-full px-4 py-3 border rounded-xl" rows={2} placeholder="Image Description (optional)" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          <input type="file" multiple accept="image/*" onChange={(e) => setImages([...e.target.files])} className="block w-full text-sm text-gray-600" />

          <button type="submit" disabled={loading} className="w-full px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl shadow disabled:opacity-50">
            {loading ? "Checking Compliance..." : "🌟 Check Adsense Compliance"}
          </button>
        </form>

        {loading && <p className="mt-6 text-sm text-gray-500 text-center">🔄 Analyzing, please wait...</p>}
      </div>

      <div className="mt-10">
        {result?.image_score !== undefined && getImageComplianceStatus(result.image_score) && (
          <div className="mb-6 text-center text-sm font-medium text-yellow-800 bg-yellow-100 px-4 py-2 rounded-xl shadow-sm">
            {getImageComplianceStatus(result.image_score)}
          </div>
        )}
        <AdResultCard result={result} />
      </div>
    </div>
  );
}