import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { youtubePlaylistService } from "../services/youtubePlaylistService";

export default function YouTubePlaylistCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    privacy: "public"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Create playlist via API
      const response = await youtubePlaylistService.createPlaylist(formData);
      
      if (response.success) {
        alert("Playlist created successfully!");
        navigate("/youtube/hub");
      } else {
        throw new Error(response.error || "Failed to create playlist");
      }
    } catch (error) {
      console.error("Failed to create playlist:", error);
      alert("Failed to create playlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-white">
            Create New Playlist
          </h1>
          
          <p className="text-xl text-red-100">
            Organize your video stories into collections
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Playlist Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g., Member Stories, Leadership Messages, Community Impact"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Describe what this playlist is about..."
              />
            </div>

            {/* Privacy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Setting
              </label>
              <select
                name="privacy"
                value={formData.privacy}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="public">Public - Anyone can view</option>
                <option value="unlisted">Unlisted - Only people with link can view</option>
                <option value="private">Private - Only you can view</option>
              </select>
            </div>

            {/* Playlist Ideas */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Playlist Ideas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
                <div>• Member Stories</div>
                <div>• Leadership Messages</div>
                <div>• Community Impact</div>
                <div>• Training Videos</div>
                <div>• Event Highlights</div>
                <div>• Testimonials</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/youtube/hub")}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </span>
                ) : (
                  "Create Playlist"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
