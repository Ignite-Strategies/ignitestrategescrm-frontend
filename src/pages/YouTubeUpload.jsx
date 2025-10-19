import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function YouTubeUpload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    playlistId: "",
    privacy: "public"
  });

  useEffect(() => {
    checkAuth();
    loadPlaylists();
  }, []);

  const checkAuth = () => {
    const youtubeTokens = localStorage.getItem("youtubeTokens");
    if (!youtubeTokens) {
      navigate("/youtube/welcome");
    }
  };

  const loadPlaylists = async () => {
    try {
      const response = await fetch('/api/youtube/playlists');
      const data = await response.json();
      
      if (data.success) {
        setPlaylists(data.playlists);
      }
    } catch (error) {
      console.error("Failed to load playlists:", error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (YouTube limit is 128GB, but let's be reasonable)
      if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB limit
        alert("File size too large. Please select a video under 2GB.");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('video/')) {
        alert("Please select a video file.");
        return;
      }
      
      setSelectedFile(file);
      
      // Auto-fill title if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setFormData({...formData, title: fileName});
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a video file to upload.");
      return;
    }
    
    if (!formData.title.trim()) {
      alert("Please enter a video title.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('video', selectedFile);
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('tags', formData.tags);
      uploadData.append('playlistId', formData.playlistId);
      uploadData.append('privacy', formData.privacy);
      
      // Upload with progress tracking
      const response = await fetch('/api/youtube/upload', {
        method: 'POST',
        body: uploadData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Video uploaded successfully! View it at: ${data.videoUrl}`);
        // Reset form
        setSelectedFile(null);
        setFormData({
          title: "",
          description: "",
          tags: "",
          playlistId: "",
          privacy: "public"
        });
        setUploadProgress(0);
      } else {
        throw new Error(data.error || "Upload failed");
      }
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("youtubeTokens");
    navigate("/youtube/welcome");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            YouTube Publisher
          </h1>
          <p className="text-xl text-white/90">
            Upload and publish videos to your YouTube channel
          </p>
        </div>

        {/* Main Upload Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          
          {/* File Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Select Video File
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer block"
                >
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="text-4xl">📹</div>
                      <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl">📁</div>
                      <p className="text-lg font-medium text-gray-900">
                        Click to select video file
                      </p>
                      <p className="text-sm text-gray-600">
                        Supports MP4, MOV, AVI, and other video formats
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Video Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter video title"
                  disabled={uploading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy Setting
                </label>
                <select
                  value={formData.privacy}
                  onChange={(e) => setFormData({...formData, privacy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={uploading}
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter video description"
                disabled={uploading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="tag1, tag2, tag3"
                  disabled={uploading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add to Playlist (optional)
                </label>
                <select
                  value={formData.playlistId}
                  onChange={(e) => setFormData({...formData, playlistId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={uploading}
                >
                  <option value="">No playlist</option>
                  {playlists.map(playlist => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 bg-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Upload to YouTube
                </>
              )}
            </button>
            
            <button
              onClick={handleDisconnect}
              className="px-6 py-4 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
              disabled={uploading}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
