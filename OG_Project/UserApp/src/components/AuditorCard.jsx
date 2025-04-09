import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const AuditorCard = ({ auditor, onShare, isShared }) => {
  return (
    <div className={`auditor-card bg-gray-800 p-6 rounded-xl shadow-lg shadow-indigo-500/40 transform transition duration-500 hover:scale-105 ${isShared ? 'border border-green-500' : 'border border-gray-700'}`}>
      <div className="flex items-center mb-4">
        {/* Profile Image - rounded */}
        <img 
          src={auditor.profile_photo} 
          alt={auditor.name} 
          className="w-16 h-16 object-cover rounded-full mr-4" 
        />
        <div>
          <h3 className="text-white text-xl font-semibold">{auditor.name}</h3>
          <p className="text-gray-400 text-sm">{auditor.designation}</p>
        </div>
      </div>

      {/* Auditor Info */}
      <div className="text-gray-400 space-y-1 mb-4">
        <p><span className="text-gray-500">Email:</span> {auditor.email}</p>
        <p><span className="text-gray-500">Phone:</span> {auditor.phoneNo}</p>
        <p><span className="text-gray-500">Access Count:</span> {auditor.hasAccessToLength}</p>
      </div>

      {/* Action Button */}
      <button 
        onClick={onShare} 
        className={`w-full py-2 text-white font-semibold rounded-md transition-colors duration-300 ${isShared ? 'bg-green-500' : 'bg-blue-500'} hover:bg-opacity-80 flex items-center justify-center`}
      >
        {isShared ? (
          <>
            <FaCheckCircle className="mr-2" /> Shared
          </>
        ) : (
          'Share Transactions'
        )}
      </button>
    </div>
  );
};

export default AuditorCard;
