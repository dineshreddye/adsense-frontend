import React from "react";

const ScorePill = ({ label, value }) => {
  const color =
    value > 75 ? "bg-green-200 text-green-800"
    : value > 40 ? "bg-yellow-200 text-yellow-800"
    : "bg-red-200 text-red-800";

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${color} mr-2`}>
      {label}: {value}%
    </div>
  );
};

const AdResultCard = ({ result }) => {
  if (!result) return null;

  return (
    <div className="mt-6 p-6 rounded-xl border shadow-sm bg-white space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ScorePill label="Relevancy" value={result.relevancy_score || 0} />
        <ScorePill label="Image" value={result.image_score || 0} />
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${result.compliant ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {result.compliant ? "✅ Compliant" : "❌ Not Compliant"}
        </div>
      </div>

      {result.cost_usd && (
        <div className="text-sm text-gray-600">
          💸 GPT cost: <strong>${result.cost_usd}</strong> &nbsp;|&nbsp; Tokens used:
          <span className="ml-1 text-gray-700">
            Prompt: {result.tokens?.prompt}, Completion: {result.tokens?.completion}, Total: {result.tokens?.total}
          </span>
        </div>
      )}

      {result.issues?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-red-700 mb-1">⚠️ Issues:</p>
          <ul className="list-disc ml-6 text-sm text-red-800">
            {result.issues.map((issue, i) => <li key={i}>{issue}</li>)}
          </ul>
        </div>
      )}

      {result.suggestions?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-1">💡 Suggestions:</p>
          <ul className="list-disc ml-6 text-sm text-blue-800">
            {result.suggestions.map((sug, i) => <li key={i}>{sug}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdResultCard;
