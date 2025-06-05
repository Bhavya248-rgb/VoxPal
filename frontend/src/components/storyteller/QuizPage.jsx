import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QuizPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [feedbackText, setFeedbackText] = useState('');

    // Hide chat widget when component mounts
    useEffect(() => {
        const chatWidget = document.querySelector('[data-chat-widget]');
        if (chatWidget) {
            chatWidget.style.display = 'none';
        }

        // Show chat widget when component unmounts
        return () => {
            if (chatWidget) {
                chatWidget.style.display = 'block';
            }
        };
    }, []);

    useEffect(() => {
        if (!location.state?.topic) {
            navigate('/storyteller/quiz');
            return;
        }

        generateQuiz();
    }, [location.state]);

    const generateQuiz = async () => {
        try {
            const response = await fetch('http://localhost:7000/api/storyteller/generate-quiz', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: location.state.topic,
                    ageGroup: location.state.ageGroup,
                    wordCount: location.state.wordCount,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate quiz');
            }

            const data = await response.json();
            setQuiz(data.quiz);
            setIsLoading(false);
        } catch (error) {
            console.error('Error generating quiz:', error);
            setIsLoading(false);
        }
    };

    const handleAnswerSelect = (questionIndex, answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const getFeedbackText = (score) => {
        if (score >= 90) {
            return {
                title: "Outstanding Achievement! 🌟",
                message: "Excellent work! Your understanding of the topic is outstanding. You've demonstrated mastery of the material. Keep up the amazing work!"
            };
        } else if (score >= 70) {
            return {
                title: "Great Progress! 👏",
                message: "Good job! You've shown a solid understanding of the material. With a little more practice on the challenging parts, you'll master it completely!"
            };
        } else if (score >= 50) {
            return {
                title: "Good Effort! 💪",
                message: "Nice effort! You're on the right track. Let's review the story again to strengthen your understanding of the key concepts."
            };
        } else {
            return {
                title: "Keep Learning! 📚",
                message: "Thank you for taking the quiz! Learning is a journey, and every attempt helps you improve. Let's go through the story one more time together to help you understand it better."
            };
        }
    };

    const calculateScore = () => {
        const totalQuestions = quiz.questions.length;
        let correctAnswers = 0;

        quiz.questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
        setScore(finalScore);

        // Set feedback text
        const feedback = getFeedbackText(finalScore);
        setFeedbackText(feedback);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
                    <p className="text-gray-600">Failed to generate quiz. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-purple-900 mb-2">Knowledge Check</h2>
                <p className="text-lg text-gray-700">Let's see how well you understood the concept!</p>
            </div>

            {score === null ? (
                <div className="space-y-8">
                    {quiz.questions.map((question, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                {index + 1}. {question.question}
                            </h3>
                            <div className="space-y-3">
                                {question.options.map((option, optionIndex) => (
                                    <label
                                        key={optionIndex}
                                        className={`block cursor-pointer p-3 rounded-lg transition-colors ${
                                            selectedAnswers[index] === option
                                                ? 'bg-purple-100 border-purple-500'
                                                : 'bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            value={option}
                                            checked={selectedAnswers[index] === option}
                                            onChange={() => handleAnswerSelect(index, option)}
                                            className="mr-3"
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={calculateScore}
                        disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
                        className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Answers
                    </button>
                </div>
            ) : (
                <div className="text-center space-y-6">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h3 className="text-2xl font-bold mb-4">Your Score</h3>
                        <div className="text-5xl font-bold text-purple-600 mb-4">{score}%</div>
                        <p className="text-gray-600">
                            You got {Object.entries(selectedAnswers).filter(([index, answer]) => 
                                answer === quiz.questions[index].correctAnswer
                            ).length} out of {quiz.questions.length} questions correct!
                        </p>
                    </div>

                    {/* Feedback Section */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h4 className="text-xl font-bold text-purple-900 mb-3">{feedbackText.title}</h4>
                        <p className="text-gray-700 leading-relaxed">{feedbackText.message}</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/storyteller')}
                            className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Try Another Story
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 py-3 px-6 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition-colors"
                        >
                            Retake Quiz
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage; 