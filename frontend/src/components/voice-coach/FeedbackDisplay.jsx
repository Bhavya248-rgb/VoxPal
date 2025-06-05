import React from 'react';

const FeedbackDisplay = ({ feedback, isPremium }) => {
    if (!feedback) return null;

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4 text-purple-900">Analysis</h3>
                <div className="prose prose-purple max-w-none">
                    {feedback.transcriptAnalysis && feedback.transcriptAnalysis.split('\n\n').map((paragraph, i) => (
                        <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4 text-purple-900">Overall Feedback</h3>
                <div className="prose prose-purple max-w-none">
                    {feedback.overallFeedback && feedback.overallFeedback.split('\n\n').map((paragraph, i) => {
                        if (paragraph.startsWith('Strengths:')) {
                            return (
                                <div key={i} className="mb-6">
                                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Strengths</h4>
                                    <div className="text-gray-700 leading-relaxed">
                                        {paragraph.replace('Strengths:', '').trim()}
                                    </div>
                                </div>
                            );
                        } if (paragraph.startsWith('Areas for Improvement:')) {
                            return (
                                <div key={i} className="mb-6">
                                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Areas for Improvement</h4>
                                    <div className="text-gray-700 leading-relaxed">
                                        {paragraph.replace('Areas for Improvement:', '').trim()}
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <p key={i} className="mb-4 text-gray-700 leading-relaxed">
                                    {paragraph}
                                </p>
                            );
                        }
                    })}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4 text-purple-900">Potential Questions</h3>
                <div className="space-y-3">
                    {feedback.questions && feedback.questions.map((q, i) => (
                        <div key={i} className="flex items-start">
                            <span className="text-purple-500 mr-2">•</span>
                            <p className="text-gray-700 leading-relaxed">{q}</p>
                        </div>
                    ))}
                </div>
            </div>

            {isPremium && feedback.scores && (
                <>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold mb-4 text-purple-900">Performance Scores</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(feedback.scores).map(([key, value]) => (
                                <div key={key} className="bg-purple-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-purple-600">{value}/10</div>
                                    <div className="text-sm text-purple-700 capitalize">{key}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {feedback.feedbackAudioUrl && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-semibold mb-4 text-purple-900">Audio Feedback</h3>
                            <audio src={feedback.feedbackAudioUrl} controls className="w-full" />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FeedbackDisplay; 