import React, { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import AdResultCard from "./AdResultCard";
import RewrittenAdCard from "./RewrittenAdCard";
import { AnimatePresence, motion } from "framer-motion";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const allowedEmails = [
  "mithun@clicksco.com",
  "madhuri@clicksco.com",
  "naresh@clicksco.com",
  "sohitha@clicksco.com",
  "clive@clicksco.com",
  "a.guggilla@clicksco.com",
  "viswanadh@clicksco.com",
  "charitha@clicksco.com",
  "arjun@clicksco.com",
  "dineshreddyedr@gmail.com",
];

initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const MAX_FIELDS = 10;

const AdChecker = () => {
  const [user, setUser] = useState(null);
  const [url, setUrl] = useState("");
  const [headline, setHeadline] = useState([""]);
  const [description, setDescription] = useState([""]);
  const [primaryText, setPrimaryText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u && allowedEmails.includes(u.email)) {
        setUser(u);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const addField = (type) => {
    if (type === "headline" && headline.length < MAX_FIELDS) {
      setHeadline([...headline, ""]);
    } else if (type === "description" && description.length < MAX_FIELDS) {
      setDescription([...description, ""]);
    }
  };

  const removeField = (index, type) => {
    if (type === "headline") {
      const updated = [...headline];
      updated.splice(index, 1);
      setHeadline(updated);
    } else {
      const updated = [...description];
      updated.splice(index, 1);
      setDescription(updated);
    }
  };

  const handleSubmit = async (e, source = "adsense") => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("url", url);
    formData.append("primary_text", primaryText);
    formData.append("source", source);
    formData.append("keywords", keywords);

    headline.forEach((h) => h?.trim() && formData.append("headline", h.trim()));
    description.forEach((d) => d?.trim() && formData.append("description", d.trim()));
    images.forEach((img) => formData.append("images", img));

    try {
      const res = await fetch("https://adsense-backend.onrender.com/analyze_with_gemini", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error:", err);
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">Please log in with an approved email</h2>
        <button onClick={handleLogin} className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700">
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🎯 AdSense Ad Compliance Checker</h1>
        <button onClick={handleLogout} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-xl">Logout</button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Article URL *</label>
            <input
              required
              type="url"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
            />
          </div>

          <AnimatePresence>
            {headline.map((h, i) => (
              <motion.div
                key={`headline-${i}`}
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="text-sm font-medium text-gray-700">
                  Headline {i + 1} {i === 0 && "*"}
                </label>
                <input
                  required={i === 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={h}
                  onChange={(e) => {
                    const updated = [...headline];
                    updated[i] = e.target.value;
                    setHeadline(updated);
                  }}
                  placeholder={`Headline ${i + 1}`}
                />
                {i > 0 && <p className="text-red-500 text-sm cursor-pointer" onClick={() => removeField(i, "headline")}>Remove</p>}
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="sm:col-span-2">
            <button type="button" onClick={() => addField("headline")} className="text-blue-600 hover:underline text-sm">
              + Add Headline
            </button>
          </div>

          <AnimatePresence>
            {description.map((d, i) => (
              <motion.div
                key={`description-${i}`}
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="text-sm font-medium text-gray-700">
                  Description {i + 1} {i === 0 && "*"}
                </label>
                <input
                  required={i === 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={d}
                  onChange={(e) => {
                    const updated = [...description];
                    updated[i] = e.target.value;
                    setDescription(updated);
                  }}
                  placeholder={`Description ${i + 1}`}
                />
                {i > 0 && <p className="text-red-500 text-sm cursor-pointer" onClick={() => removeField(i, "description")}>Remove</p>}
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="sm:col-span-2">
            <button type="button" onClick={() => addField("description")} className="text-blue-600 hover:underline text-sm">
              + Add Description
            </button>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Primary Text *</label>
            <textarea
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={primaryText}
              onChange={(e) => setPrimaryText(e.target.value)}
              placeholder="Ad main content / body..."
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Optional: Describe image</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. woman vacuuming, product display, happy family"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Upload Image(s)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages([...e.target.files])}
              className="block w-full text-sm text-gray-600"
            />
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow disabled:opacity-50"
          >
            {loading ? "Checking..." : "✅ Check AdSense Compliance"}
          </button>

          {result && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "facebook")}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow disabled:opacity-50"
              >
                📘 Check for Facebook Ads
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "google_ads")}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow disabled:opacity-50"
              >
                🔍 Check for Google Ads
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "native")}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow disabled:opacity-50"
              >
                📰 Check for Native (Taboola/Outbrain)
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "performance")}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow disabled:opacity-50"
              >
                📊 Check Ad Performance
              </button>
            </div>
          )}
        </div>
      </form>

      <div className="mt-10">
        <AdResultCard result={result} />
        <RewrittenAdCard rewritten={null} />
        {result?.cost_usd && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            💰 <strong>Cost:</strong> ${result.cost_usd} | 🔢 <strong>Tokens:</strong> {result.tokens?.total}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdChecker;