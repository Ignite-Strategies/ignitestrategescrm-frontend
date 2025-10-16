import { useSearchParams } from "react-router-dom";

export default function PreviewPageTest() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Congrats you made it to my page!
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Campaign ID: {campaignId || "No ID"}
        </p>
        <p className="text-gray-500">
          If you see this, navigation works! 🚀
        </p>
      </div>
    </div>
  );
}

