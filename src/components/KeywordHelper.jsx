import { useState } from "react";

export default function KeywordHelper({ onKeywordsGenerated }) {
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  const generateKeywords = async () => {
    if (!topic.trim()) return;

    try {
      setGenerating(true);
      
      // TODO: Call AI API to generate keywords
      // For now, use mock data based on common patterns
      const mockKeywords = [
        topic.toLowerCase(),
        `${topic} tutorial`,
        `${topic} tips`,
        `${topic} for beginners`,
        `${topic} explained`,
        `how to ${topic}`,
        `${topic} guide`,
        `best ${topic}`,
        `${topic} 2024`,
        `${topic} community`
      ];

      setSuggestedKeywords(mockKeywords);
    } catch (error) {
      console.error("Failed to generate keywords:", error);
    } finally {
      setGenerating(false);
    }
  };

  const toggleKeyword = (keyword) => {
    if (selectedKeywords.includes(keyword)) {
      const updated = selectedKeywords.filter(k => k !== keyword);
      setSelectedKeywords(updated);
      onKeywordsGenerated(updated);
    } else {
      const updated = [...selectedKeywords, keyword];
      setSelectedKeywords(updated);
      onKeywordsGenerated(updated);
    }
  };

  const addCustomKeyword = (keyword) => {
    if (keyword.trim() && !selectedKeywords.includes(keyword.trim())) {
      const updated = [...selectedKeywords, keyword.trim()];
      setSelectedKeywords(updated);
      onKeywordsGenerated(updated);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          YouTube Keyword Helper
        </h3>
        
        <p className="text-sm text-blue-700 mb-4">
          Get discovered on YouTube with the right keywords. Enter your video topic to get suggestions.
        </p>

        {/* Topic Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && generateKeywords()}
            placeholder="e.g., F3 workout, leadership, community building"
            className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={generateKeywords}
            disabled={generating || !topic.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* Suggested Keywords */}
        {suggestedKeywords.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-blue-900">Select keywords to add:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedKeywords.map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => toggleKeyword(keyword)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    selectedKeywords.includes(keyword)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                  }`}
                >
                  {selectedKeywords.includes(keyword) && "✓ "}
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Keywords Display */}
      {selectedKeywords.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Selected Keywords ({selectedKeywords.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedKeywords.map((keyword, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-2"
              >
                {keyword}
                <button
                  onClick={() => toggleKeyword(keyword)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* YouTube SEO Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 YouTube SEO Tips</h4>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>• Use 3-5 highly relevant keywords</li>
          <li>• Include your main keyword in the title</li>
          <li>• Add keywords naturally in the description</li>
          <li>• Target long-tail keywords for better ranking</li>
          <li>• Research what your audience is searching for</li>
        </ul>
      </div>
    </div>
  );
}

