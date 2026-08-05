import React from 'react';
// import video1 from '../public/screen-capture-2.webm';

export default function VideoSection() {
  const inputMethods = [
    {
      id: 'method-1',
      title: 'Method 1: Raw Text Copy & Paste',
      badge: 'AI isprocessing each record one by one so it may take a few seconds to process.',
      videoSrc: '/screen-capture-1.mp4',
      steps: [
        'Copy unstructured text containing guard records conatining filelds: name, hkid, cwr_card_no, cwr_expiry_date, green_card_expiry_date, spp_expiry_date.',
        'Click Process to automatically parse into CSV.',
      ],
    },
    {
      id: 'method-2',
      title: 'Method 2: File Upload',
      badge: 'Quickest',
      videoSrc: '/screen-capture-2.mp4',
      steps: [
        'Click the + attachment icon.',
        'Click Upload to extract data.',
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-500">
          How to Input Employee Data for AI Parsing
        </h2>
        <p className="text-gray-500 mt-2">
          Watch the short video demos below to see both input options in action.
        </p>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {inputMethods.map((method) => (
          <div
            key={method.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col"
          >
            {/* Video Container */}
            <div className="relative bg-black aspect-video">
              <video
                src={method.videoSrc}
                controls
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Content Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {method.title}
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {method.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{method.description}</p>

                {/* Step-by-step checklist */}
                <ol className="list-decimal list-inside text-xs text-gray-500 space-y-1">
                  {method.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}