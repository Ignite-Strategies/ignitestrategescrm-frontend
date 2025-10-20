import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function YouTubeHub() {
  const navigate = useNavigate();
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannelInfo();
  }, []);

  const loadChannelInfo = async () => {
    try {
      setLoading(true);
      
      // Get hydrated channel info from localStorage
      const youtubeChannelInfo = localStorage.getItem("youtubeChannelInfo");
      const youtubeChannelId = localStorage.getItem("youtubeChannelId");
      
      if (youtubeChannelInfo && youtubeChannelId) {
        const channel = JSON.parse(youtubeChannelInfo);
        setChannelInfo({
          id: channel.id,
          title: channel.title,
          description: channel.description || "No description available",
          thumbnail: channel.thumbnail,
          subscriberCount: channel.subscriberCount || 0,
          viewCount: channel.viewCount || 0,
          videoCount: channel.videoCount || 0
        });
        console.log("✅ Channel info hydrated:", channel);
      } else {
        throw new Error("No YouTube channel info found");
      }
    } catch (error) {
      console.error("Failed to load channel info:", error);
      // Fallback to basic info
      setChannelInfo({
        id: "Unknown",
        title: "YouTube Channel",
        description: "Channel information not available",
        thumbnail: "https://via.placeholder.com/64x64",
        subscriberCount: 0,
        viewCount: 0,
        videoCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const actionCards = [
    {
      id: "playlist",
      title: "Build a Playlist",
      description: "Organize your video stories into collections",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: "blue",
      action: () => navigate("/youtube/playlist/create")
    },
    {
      id: "upload",
      title: "Upload Video",
      description: "Share your story with a new video upload",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: "red",
      action: () => navigate("/youtube/upload")
    },
    {
      id: "ideas",
      title: "Story Ideas",
      description: "Get inspired with content ideas and prompts",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "purple",
      action: () => navigate("/youtube/ideas")
    },
    {
      id: "distribute",
      title: "Distribute Content",
      description: "Share your videos across social platforms",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      color: "green",
      action: () => navigate("/social-media")
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      red: {
        bg: "bg-red-600",
        hover: "hover:bg-red-700",
        border: "border-red-200",
        hoverBorder: "hover:border-red-300"
      },
      blue: {
        bg: "bg-blue-600",
        hover: "hover:bg-blue-700",
        border: "border-blue-200",
        hoverBorder: "hover:border-blue-300"
      },
      purple: {
        bg: "bg-purple-600",
        hover: "hover:bg-purple-700",
        border: "border-purple-200",
        hoverBorder: "hover:border-purple-300"
      },
      green: {
        bg: "bg-green-600",
        hover: "hover:bg-green-700",
        border: "border-green-200",
        hoverBorder: "hover:border-green-300"
      }
    };
    return colors[color] || colors.red;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white text-lg">Loading your YouTube hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          
          <h1 className="text-5xl font-bold text-white">
            What do you want to do today?
          </h1>
          
          <p className="text-xl text-red-100">
            Action with video storytelling
          </p>
        </div>

        {/* Channel Connected */}
        {channelInfo && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={channelInfo.thumbnail} 
                  alt="Channel thumbnail" 
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white">{channelInfo.title}</h3>
                  <div className="flex items-center gap-4 text-red-100 text-sm">
                    <span>{channelInfo.subscriberCount?.toLocaleString()} subscribers</span>
                    <span>{channelInfo.videoCount} videos</span>
                    <span>{channelInfo.viewCount?.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.open(`https://youtube.com/channel/${channelInfo.id}`, '_blank')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Channel Home
              </button>
            </div>
          </div>
        )}

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {actionCards.map((card) => {
            const colors = getColorClasses(card.color);
            return (
              <button
                key={card.id}
                onClick={card.action}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition transform hover:scale-105"
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 ${colors.bg} ${colors.hover} rounded-xl flex items-center justify-center text-white transition`}>
                    {card.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {card.title}
                    </h2>
                    <p className="text-gray-600">
                      {card.description}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
