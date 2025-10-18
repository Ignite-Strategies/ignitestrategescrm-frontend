import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RecruitFacebook() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    campaignName: "",
    objective: "awareness",
    caption: "",
    ctaButton: "Learn More",
    targetAudience: "",
    budget: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const templates = [
    {
      name: "Event Promo",
      caption: "🔥 Next event is [DATE]. Limited spots.\n\nThis isn't just another workout. It's where you find your crew.\n\nComment 'IN' to RSVP. See you there.",
      cta: "Sign Up",
      audience: "Local, ages 25-45, fitness interests"
    },
    {
      name: "Transformation Story",
      caption: "This is [NAME]. 90 days ago, they walked in skeptical.\n\nToday? They're unstoppable.\n\nYour story starts when you show up. Will we see you at the next event?\n\nLink in bio.",
      cta: "Learn More",
      audience: "Local, ages 25-50, inspiration seekers"
    },
    {
      name: "Community Spotlight",
      caption: "What makes us different?\n\nIt's not the workouts. It's the people.\n\nWe show up for each other. We celebrate wins. We lift each other up.\n\nReady to find your crew? Join us.",
      cta: "Join Us",
      audience: "Local, ages 22-45, community interests"
    },
    {
      name: "Challenge Launch",
      caption: "30 DAYS. ONE GOAL. ZERO EXCUSES.\n\nOur next challenge starts Monday. Who's ready to prove what they're made of?\n\nTag someone who needs this. 👇",
      cta: "Sign Up",
      audience: "Local, ages 25-50, fitness + motivation"
    }
  ];

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      campaignName: template.name,
      caption: template.caption,
      ctaButton: template.cta,
      targetAudience: template.audience
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image file");
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(formData.caption);
    alert("Caption copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/engage")}
          className="mb-6 text-purple-600 hover:text-purple-800 flex items-center gap-2 font-medium"
        >
          ← Back to Engagement Hub
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">📱</div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Facebook / Instagram Campaign</h1>
              <p className="text-slate-600 mt-2">
                Create engaging social campaigns to grow your community
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Templates Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">📋 Post Templates</h2>
              <p className="text-sm text-slate-600 mb-6">
                Click a template to auto-fill your post →
              </p>
              
              <div className="space-y-4">
                {templates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200 hover:border-blue-400 transition-all"
                  >
                    <h3 className="font-semibold text-slate-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{template.caption}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {template.cta}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Social Media Tips */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>💡</span>
                <span>Social Media Best Practices</span>
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">✓</span>
                  <span><strong>Visuals matter:</strong> Use high-quality, authentic photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">✓</span>
                  <span><strong>Hook fast:</strong> First line is everything</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">✓</span>
                  <span><strong>CTA clarity:</strong> Tell people exactly what to do</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">✓</span>
                  <span><strong>Engage back:</strong> Reply to every comment in first hour</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">✏️ Create Post</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  placeholder="e.g., Event Promo"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Campaign Objective
                </label>
                <select
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="awareness">Awareness</option>
                  <option value="engagement">Engagement</option>
                  <option value="traffic">Traffic</option>
                  <option value="conversions">Conversions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Post Caption
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Write your post caption..."
                  rows={8}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.caption.length} characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    ) : (
                      <div>
                        <div className="text-4xl mb-2">📸</div>
                        <p className="font-semibold text-slate-900">Click to upload image</p>
                        <p className="text-sm text-slate-600 mt-1">JPG, PNG, or GIF</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    CTA Button
                  </label>
                  <select
                    value={formData.ctaButton}
                    onChange={(e) => setFormData({ ...formData, ctaButton: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Learn More">Learn More</option>
                    <option value="Sign Up">Sign Up</option>
                    <option value="Join Us">Join Us</option>
                    <option value="Get Started">Get Started</option>
                    <option value="Contact Us">Contact Us</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Daily Budget
                  </label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g., $20/day"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g., Local, ages 25-45, fitness interests"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCopyCaption}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  📋 Copy Caption
                </button>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Next Steps:</strong> Copy your caption and upload your image to Facebook/Instagram Ads Manager. Full automation coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Placeholder */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-dashed border-purple-300">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🪄</div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                AI Social Media Assistant (Coming Soon)
              </h3>
              <p className="text-sm text-slate-700">
                Auto-generate captions, suggest hashtags, optimize posting times, and create campaigns automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

