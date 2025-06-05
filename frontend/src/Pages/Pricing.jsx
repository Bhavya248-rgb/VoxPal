import React from 'react';

// Commented out for future use
/*
const PricingCard = ({ title, price, features, isPopular }) => (
    <div className={`p-6 rounded-lg shadow-lg ${isPopular ? 'bg-indigo-50 border-2 border-indigo-600' : 'bg-white'}`}>
        {isPopular && (
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                Most Popular
            </span>
        )}
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <div className="mb-6">
            <span className="text-4xl font-bold">${price}</span>
            {price > 0 && <span className="text-gray-600">/month</span>}
        </div>
        <ul className="space-y-3 mb-6">
            {features.map((feature, index) => (
                <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                </li>
            ))}
        </ul>
        <button
            className={`w-full py-3 px-4 rounded-lg font-semibold ${
                isPopular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } transition-colors`}
        >
            Get Started
        </button>
    </div>
);
*/

const Pricing = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="text-center px-4 py-16 sm:px-6 lg:px-8 max-w-2xl mx-auto">
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Pricing Coming Soon
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    We're working hard to bring you flexible pricing plans that cater to your needs.
                    Stay tuned for exciting subscription options!
                </p>
                <div className="inline-flex items-center justify-center space-x-2 text-indigo-600">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="font-semibold">In Development</span>
                </div>
            </div>
        </div>
    );
};

export default Pricing;

/* Original pricing plans for future reference
const plans = [
    {
        title: 'Free',
        price: 0,
        features: [
            'Basic voice chat',
            '5 AI conversations per day',
            'Standard voice quality',
            'Basic chat history'
        ],
        isPopular: false
    },
    {
        title: 'Pro',
        price: 9.99,
        features: [
            'Unlimited voice chat',
            'Unlimited AI conversations',
            'HD voice quality',
            'Advanced chat history',
            'Priority support',
            'Custom voice settings'
        ],
        isPopular: true
    },
    {
        title: 'Enterprise',
        price: 29.99,
        features: [
            'All Pro features',
            'API access',
            'Custom AI model training',
            'Dedicated support',
            'Team collaboration',
            'Advanced analytics'
        ],
        isPopular: false
    }
];
*/ 