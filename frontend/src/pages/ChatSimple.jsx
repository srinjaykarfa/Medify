import React from 'react';

const ChatSimple = () => {
  console.log('ChatSimple component is rendering...');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🩺 Voice Health Assistant
          </h1>
          <p className="text-gray-600 mb-6">
            Your AI-powered health companion is ready to help! Ask me anything about your health.
          </p>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-green-600 font-medium">✅ Chat component loaded successfully!</p>
            <p className="text-sm text-gray-500 mt-2">
              This is a simplified version to test the routing.
            </p>
          </div>
          
          <div className="mt-6 flex gap-2">
            <input 
              type="text" 
              placeholder="Type your health question here..." 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSimple;
