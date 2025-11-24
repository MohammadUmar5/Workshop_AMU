import React, { useState } from 'react';
import { Sparkles, Copy } from 'lucide-react';
import { WORKSHOP_CAPACITY } from '../constants/constants';
import { callGeminiAPI } from '../utils/geminiService';

// --- [NEW] Gemini Icebreaker Component ---
export const GeminiIcebreaker = ({ person }) => {
  const [icebreaker, setIcebreaker] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateIcebreaker = async () => {
    setIsLoading(true);
    setError('');
    setIcebreaker('');

    const prompt = `You are a friendly event host. A participant named ${person.name}, who is a ${person.year} in the ${person.department} department, has just checked in. Generate one fun, short icebreaker question for them. Keep it under 20 words.`;

    try {
      const result = await callGeminiAPI(prompt);
      setIcebreaker(result);
    } catch (err) {
      setError('Failed to generate. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-5 p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">AI Icebreaker</h3>
      {!icebreaker && !isLoading && !error && (
        <button
          onClick={generateIcebreaker}
          className="mt-2 inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          ✨ Generate Icebreaker
        </button>
      )}
      {isLoading && <p className="text-gray-600 font-medium animate-pulse">Generating...</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}
      {icebreaker && (
        <div>
          <p className="text-lg font-medium text-purple-800 mt-2">"{icebreaker}"</p>
          <button
            onClick={generateIcebreaker}
            className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Try another?
          </button>
        </div>
      )}
    </div>
  );
};

// --- [RE-ADDED] Gemini Workshop Summary Component ---
export const GeminiWorkshopSummary = ({ admitted, absentees, onSpotCount, earlyLeavers }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSummary = async () => {
    setIsLoading(true);
    setError('');
    setSummary('');

    // [MODIFIED] Added earlyLeavers to the prompt context
    const prompt = `You are an event coordinator writing a brief, positive, 2-3 sentence summary for an internal report. 
    Event Statistics:
    - Total Admitted Participants (who stayed): ${admitted.length}
    - Total On-Spot Registrations: ${onSpotCount}
    - Total Absentees: ${absentees.length}
    - Total Participants who left early: ${earlyLeavers.length}
    - Total Capacity: ${WORKSHOP_CAPACITY}
    
    Write the summary.`;

    try {
      const result = await callGeminiAPI(prompt);
      setSummary(result);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-10 p-4 bg-gray-100 border border-gray-200 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">✨ AI Workshop Summary</h2>
      {!summary && !isLoading && !error && (
        <button
          onClick={generateSummary}
          className="inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Generate Summary
        </button>
      )}
      {isLoading && <p className="text-gray-600 font-medium animate-pulse">Generating summary...</p>}
      {error && <p className="text-red-600 font-medium">{error}</p>}
      {summary && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-800 whitespace-pre-wrap">{summary}</p>
          <button
            onClick={generateSummary}
            className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
};

// --- [RE-ADDED] Gemini Announcement Generator Component ---
export const GeminiAnnouncementGenerator = () => {
  const [topic, setTopic] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateAnnouncement = async () => {
    if (!topic) {
      setError('Please enter a topic for the announcement.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setIsLoading(true);
    setError('');
    setAnnouncement('');

    const prompt = `You are an event host. Write a brief, polite, one-sentence announcement for a workshop. The topic is: "${topic}".`;

    try {
      const result = await callGeminiAPI(prompt);
      setAnnouncement(result);
    } catch (err) {
      setError('Failed to generate. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    // A simple clipboard copy function
    const el = document.createElement('textarea');
    el.value = announcement;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(el);
  };

  return (
    <div className="p-4 mt-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        AI Announcement Generator
      </h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="announcement-topic" className="block text-sm font-medium text-gray-700">Announcement Topic</label>
          <input 
            type="text" id="announcement-topic" value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Lunch is starting, Final 15 minutes"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        <button
          onClick={generateAnnouncement}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg shadow-md transition duration-200 text-lg bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400"
        >
          <Sparkles className="h-6 w-6 mr-2" />
          {isLoading ? 'Generating...' : 'Generate Announcement'}
        </button>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {announcement && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-gray-800">{announcement}</p>
            <button
              onClick={handleCopy}
              className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-medium inline-flex items-center"
            >
              <Copy className="h-4 w-4 mr-1" />
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
