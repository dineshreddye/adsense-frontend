import React, { useState } from "react";
import AdResultCard from "./AdResultCard";
import RewrittenAdCard from "./RewrittenAdCard";

export default function AdChecker() {
  const getImageComplianceStatus = (score) => {
    if (score < 40) return "❌ Image Not Compliant";
    if (score < 50) return "⚠️ Image Relevance Warning";
    return null;
  };

  const [url, setUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [keywords, setKeywords] = useState("");
  const [images, setImages] = useState([]);
  const [result, setResult] = useState(null);
  const [rewrite, setRewrite] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, engine = "fast") => {
    e.preventDefault();
    setLoading(true);
    setRewrite(null);

    const formData = new FormData();
    formData.append("url", url);
    formData.append("headline", headline);
    formData.append("description", description);
    formData.append("primary_text", primaryText);
    formData.append("keywords", keywords);
    images.forEach((image) => formData.append("images", image));

    try {
      let endpoint;
      if (engine === "gemini") {
        endpoint = "http://localhost:8000/analyze_with_gemini";
      } else if (engine === true) {
        endpoint = "http://localhost:8000/analyze_with_gpt";
      } else {
        endpoint = "http://localhost:8000/analyze_ad";
      }

      const response = await fetch(endpoint, {
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

  const handleRewrite = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("url", url);
    formData.append("headline", headline);
    formData.append("description", description);
    formData.append("primary_text", primaryText);

    try {
      const response = await fetch("http://localhost:8000/rewrite_ad_with_gpt", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setRewrite(data);
    } catch (err) {
      console.error("Rewrite error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-10 space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          🎯 AdSense Ad Compliance Checker
        </h1>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Article URL *</label>
            <input
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Headline *</label>
            <input
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Amazing Cleaning Services Near You"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description *</label>
            <input
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Book top-rated professionals instantly"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Primary Text *</label>
            <textarea
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              rows={5}
              value={primaryText}
              onChange={(e) => setPrimaryText(e.target.value)}
              placeholder="Find affordable home cleaning services today — fast, professional, and eco-friendly!"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Optional: Describe your image</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              rows={2}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. woman vacuuming, kitchen cleanup, happy cleaner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Upload Image(s)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages([...e.target.files])}
              className="block w-full text-sm text-gray-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow disabled:opacity-50"
            >
              {loading ? "Checking..." : "✅ Check with Fast AI"}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow disabled:opacity-50"
            >
              {loading ? "Checking GPT..." : "🤖 Check with GPT"}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, "gemini")}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl shadow disabled:opacity-50"
            >
              {loading ? "Checking Gemini..." : "🌟 Check with Gemini"}
            </button>
          </div>
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
        <RewrittenAdCard rewritten={rewrite} />
      </div>
    </div>
  );
}
