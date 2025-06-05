import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMessageSquare, FiMic, FiGlobe, FiFileText, FiSettings, FiStar, FiBookOpen, FiEdit3, FiRefreshCw } from 'react-icons/fi';
import authService from '../services/authService';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchUserData = async () => {
        try {
            setIsRefreshing(true);
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserData();

        // Refresh data every 30 seconds
        const intervalId = setInterval(fetchUserData, 30000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const handleRefresh = () => {
        fetchUserData();
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const features = [
        {
            title: "Transform Topics",
            description: "Turn hard or boring subjects into interesting stories of any genre",
            icon: <FiBookOpen className="w-6 h-6" />,
            link: "/storyteller",
            color: "from-green-500 to-teal-400"
        },        
        {
            title: "Voice Translation",
            description: "Translate your voice into different languages instantly",
            icon: <FiGlobe className="w-6 h-6" />,
            link: "/voice-assist",
            color: "from-purple-500 to-pink-400"
        },
        {
            title: "Voice Coach",
            description: "Practice your speech and get instant feedback to improve your public speaking skills",
            icon: <FiMic className="w-6 h-6" />,
            link: "/voice-coach",
            color: "from-emerald-300 to-blue-500"
        },
        {
            title: "Talk Buddy",
            description: "Have any conversation and queries with your AI mate",
            icon: <FiMessageSquare className="w-6 h-6" />,
            link: "/talkmate",
            color: "from-blue-500 to-cyan-400"
        },
        {
            title: "Summarizer",
            description: "Get quick summaries of articles and documents",
            icon: <FiFileText className="w-6 h-6" />,
            link: "/voice-assist",
            color: "from-orange-500 to-yellow-400"
        },
        {
            title: "Create Story",
            description: "Turn your imagination into captivating words instantly",
            icon: <FiEdit3 className="w-6 h-6" />,
            link: "/storyteller",
            // color: "from-pink-400 to-blue-400"
            color: "from-red-500 to-rose-400"
        },        
        // {
        //     title: "My Saves",
        //     description: "Access your saved translations and practice sessions",
        //     icon: <FiStar className="w-6 h-6" />,
        //     link: "/my-saves",
        //     color: "from-red-500 to-rose-400"
        // }
    ];

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.username}! 👋</h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`p-2 text-gray-600 hover:text-purple-600 focus:outline-none ${isRefreshing ? 'animate-spin' : ''}`}
                                title="Refresh stats"
                            >
                                <FiRefreshCw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Topics Learned</h3>
                            <FiBookOpen className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold text-green-600 mt-2">{user.TotalStories || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Stories generated from topics</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Speeches Practiced</h3>
                            <FiMic className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{user.TotalSpeeches || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Speech feedback sessions</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Translations Made</h3>
                            <FiGlobe className="w-6 h-6 text-purple-500" />
                        </div>
                        <p className="text-3xl font-bold text-purple-600 mt-2">{user.TotalTranslations || 0}</p>
                        <p className="text-sm text-gray-500 mt-1">Voice translations completed</p>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-gray-600 to-gray-500 p-2 rounded-lg text-white">
                                <FiSettings className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Voice Settings</h3>
                        </div>
                        <Link
                            to="/settings"
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            Customize Voices
                        </Link>
                    </div>
                    <p className="text-gray-600">Personalize your VoxPal experience by choosing your preferred voice for each feature.</p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.link}
                            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                            <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                            <div className="p-6">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className={`bg-gradient-to-r ${feature.color} p-2 rounded-lg text-white`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                        {feature.title}
                                    </h3>
                                </div>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Premium Banner */}
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-purple-900">Unlock Premium Features ⭐</h3>
                            <p className="text-sm text-gray-600">Get access to advanced features, unlimited usage, and priority support</p>
                        </div>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
