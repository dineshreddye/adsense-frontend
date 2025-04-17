import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import AdResultCard from "./AdResultCard";
import RewrittenAdCard from "./RewrittenAdCard";

const allowedEmails = ["dineshreddyedr@gmail.com", "anotheruser@example.com"];

const AdChecker = () => {
  const [user, setUser] = useState(null);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [url, setUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email && allowedEmails.includes(currentUser.email)) {
        setAccessAllowed(true);
      } else {
        setAccessAllowed(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e, source = "adsense") => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("url", url);
    formData.append("headline", headline);
    formData.append("description", description);
    formData.append("primary_text", primaryText);
    formData.append("source", source);
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

  if (!user) {
    return (
      <div className="text-center mt-20 text-lg text-gray-700">
        🔐 Please log in to access the Ad Checker
      </div>
    );
  }

  if (!accessAllowed) {
    return (
      <div className="text-center mt-20 text-lg text-red-600 font-semibold">
        ❌ Your account is not authorized to use this tool.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-10 space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          🎯 AdSense Ad Compliance Checker
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Headline *</label>
              <input
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Eye-catching headline..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description *</label>
              <input
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short ad description..."
              />
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

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow disabled:opacity-50"
            >
              {loading ? "Checking..." : "✅ Check AdSense Compliance"}
            </button>

            {result && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
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
      </div>

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
