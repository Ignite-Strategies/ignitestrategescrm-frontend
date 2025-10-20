import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function YouTubePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [videoData, setVideoData] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    // Get video data from navigation state
    if (location.state?.videoData) {
      setVideoData(location.state.videoData);
    } else {
      // No video data, redirect back to upload
      navigate("/youtube/upload");
    }
  }, [location, navigate]);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      // TODO: Implement actual YouTube upload API call
      console.log("Publishing video:", videoData);
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page
      navigate("/youtube/publish-success", { state: { videoData } });
    } catch (error) {
      console.error("Failed to publish video:", error);
      alert("Failed to publish video. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleBack = () => {
    navigate("/youtube/upload", { state: { videoData } });
  };

  if (!videoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white text-lg">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-white">
            Preview Your Video
          </h1>
          <p className="text-xl text-red-100">
            Review before publishing to YouTube
          </p>
        </div>

        {/* Preview Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl space-y-8">
          
          {/* Video Preview */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Video Preview</h2>
            
            {/* Video Thumbnail/Player */}
            <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
              {videoData.thumbnail ? (
                <img 
                  src={videoData.thumbnail} 
                  alt="Video thumbnail"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center text-white space-y-4">
                  <svg className="w-24 h-24 mx-auto text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg">Video Preview</p>
                  <p className="text-sm text-white/70">{videoData.fileName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Video Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Title</h3>
              <p className="text-gray-700">{videoData.title}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{videoData.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Playlist</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="font-medium text-blue-900">{videoData.playlist?.title || "No playlist selected"}</p>
                  {videoData.playlist?.description && (
                    <p className="text-sm text-blue-700 mt-1">{videoData.playlist.description}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900 capitalize">{videoData.privacy}</p>
                </div>
              </div>
            </div>

            {videoData.tags && videoData.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {videoData.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {videoData.isShort && (
              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="font-semibold text-purple-900">YouTube Short</p>
                </div>
                <p className="text-sm text-purple-700 mt-2">This video will be published as a YouTube Short (under 60 seconds)</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              onClick={handleBack}
              disabled={publishing}
              className="flex-1 px-6 py-4 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition disabled:opacity-50"
            >
              ← Back to Edit
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {publishing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Publishing...
                </span>
              ) : (
                "Publish to YouTube 🚀"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

