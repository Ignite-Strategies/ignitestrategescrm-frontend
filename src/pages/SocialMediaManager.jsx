import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SocialMediaManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    caption: "",
    hashtags: "",
    platforms: [],
    scheduleDate: "",
    scheduleTime: ""
  });

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'from-pink-500 to-purple-600' },
    { id: 'facebook', name: 'Facebook', icon: '👥', color: 'from-blue-500 to-blue-700' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'from-blue-400 to-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'from-blue-600 to-blue-800' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handlePlatformToggle = (platformId) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handlePost = async () => {
    if (!selectedFile) {
      alert("Please select an image or video to post.");
      return;
    }
    
    if (formData.platforms.length === 0) {
      alert("Please select at least one platform to post to.");
      return;
    }
    
    if (!formData.caption.trim()) {
      alert("Please enter a caption for your post.");
      return;
    }

    try {
      setPosting(true);
      
      // Create FormData for post
      const postData = new FormData();
      postData.append('media', selectedFile);
      postData.append('caption', formData.caption);
      postData.append('hashtags', formData.hashtags);
      postData.append('platforms', JSON.stringify(formData.platforms));
      
      if (formData.scheduleDate && formData.scheduleTime) {
        postData.append('scheduleDate', formData.scheduleDate);
        postData.append('scheduleTime', formData.scheduleTime);
      }
      
      // Post to social media
      const response = await fetch('/api/social/post', {
        method: 'POST',
        body: postData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Posted successfully to ${data.postedPlatforms.join(', ')}!`);
        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData({
          caption: "",
          hashtags: "",
          platforms: [],
          scheduleDate: "",
          scheduleTime: ""
        });
      } else {
        throw new Error(data.error || "Posting failed");
      }
      
    } catch (error) {
      console.error("Posting failed:", error);
      alert(`Posting failed: ${error.message}`);
    } finally {
      setPosting(false);
    }
  };

  const handleBack = () => {
    navigate("/engage");
  };

  const handleConnectMeta = () => {
    navigate("/meta/welcome");
  };

  useEffect(() => {
    // Check if Meta is connected
    const metaTokens = localStorage.getItem("metaTokens");
    if (!metaTokens) {
      // Show connect Meta button or redirect
      console.log("Meta not connected");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div>
            <h1 className="text-4xl font-bold text-white">
              Social Media Manager
            </h1>
            <p className="text-xl text-white/90">
              Post to Instagram, Facebook, and other social platforms
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Media Upload */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Media Upload</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-4">
                  Select Image or Video
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="media-upload"
                    disabled={posting}
                  />
                  <label
                    htmlFor="media-upload"
                    className="cursor-pointer block"
                  >
                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="text-4xl">📸</div>
                        <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-4xl">📁</div>
                        <p className="text-lg font-medium text-gray-900">
                          Click to select media
                        </p>
                        <p className="text-sm text-gray-600">
                          Supports images and videos
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Preview</label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {selectedFile?.type.startsWith('image/') ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <video 
                        src={previewUrl} 
                        controls 
                        className="max-w-full h-48 rounded-lg"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Post Details */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Post Details</h2>
            
            <div className="space-y-6">
              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption *
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({...formData, caption: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="What's happening? Share your story..."
                  disabled={posting}
                />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={formData.hashtags}
                  onChange={(e) => setFormData({...formData, hashtags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="#hashtag1 #hashtag2 #hashtag3"
                  disabled={posting}
                />
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Platforms *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      disabled={posting}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.platforms.includes(platform.id)
                          ? `bg-gradient-to-r ${platform.color} text-white border-transparent`
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{platform.icon}</span>
                        <span className="font-medium">{platform.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule (Optional) */}
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Schedule Post (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      value={formData.scheduleDate}
                      onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={posting}
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={formData.scheduleTime}
                      onChange={(e) => setFormData({...formData, scheduleTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={posting}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave empty to post immediately
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Post Button */}
        <div className="flex justify-center">
          <button
            onClick={handlePost}
            disabled={!selectedFile || formData.platforms.length === 0 || !formData.caption.trim() || posting}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {posting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Posting...
              </>
            ) : (
              <>
                <span className="text-lg">📱</span>
                Post to Social Media
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
