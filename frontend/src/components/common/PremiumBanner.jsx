import React from 'react';
import { Link } from 'react-router-dom';

const PremiumBanner = ({ message, isPremium }) => {
    if (isPremium) return null;
    return (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Unlock Premium Features</h3>
            <p className="mb-4">{message}</p>
            <Link
                to="/pricing"
                className="inline-block bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
                Upgrade Now
            </Link>
        </div>
    );
};

export default PremiumBanner; 