// // src/pages/Landing.jsx
// const Landing = () => {
//     return (
//         <div>
//             <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 px-6">
//                 <h1 className="text-5xl font-bold text-indigo-700 mb-4">VoxPal</h1>
//                 <p className="text-lg text-indigo-600 mb-8 max-w-xl text-center">
//                     Your voice companion — learn, talk, and express with ease.
//                 </p>
//                 <div className="flex gap-4">
//                     <a href="/login" className="px-6 py-3 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition">
//                         Log In
//                     </a>
//                     <a href="/signup" className="px-6 py-3 border border-indigo-700 text-indigo-700 rounded-lg hover:bg-indigo-100 transition">
//                         Sign Up
//                     </a>
//                 </div>
//             </div>
//             <section className="py-12 bg-white">
//   <div className="max-w-5xl mx-auto px-6">
//     <h2 className="text-3xl font-bold text-center mb-10">What VoxPal Can Do For You</h2>
//     <div className="grid md:grid-cols-3 gap-10">
//       <div className="text-center">
//         <img src="/icons/storyteller.svg" alt="Storyteller" className="mx-auto mb-4 h-16" />
//         <h3 className="text-xl font-semibold mb-2">Storyteller</h3>
//         <p>Listen to your subjects as immersive stories or create your own with custom plots and characters.</p>
//       </div>
//       <div className="text-center">
//         <img src="/icons/dub-voice.svg" alt="Dub Your Voice" className="mx-auto mb-4 h-16" />
//         <h3 className="text-xl font-semibold mb-2">Dub Your Voice</h3>
//         <p>Record or transform your voice with AI-powered dubbing to bring your stories and messages to life.</p>
//       </div>
//       <div className="text-center">
//         <img src="/icons/talkbot.svg" alt="TalkBOT Friend" className="mx-auto mb-4 h-16" />
//         <h3 className="text-xl font-semibold mb-2">TalkBOT Friend</h3>
//         <p>Practice speeches, have conversations, get language help, or just share your day with your friendly AI companion.</p>
//       </div>
//     </div>
//   </div>
// </section>

//         </div>
//     );
// };

// export default Landing;

import React from "react";

const features = [
  {
    title: "Smart Summarizer",
    description: "Need to summarize your notes, research papers, or articles? Our smart Summarizer does it in seconds—clear, concise, and on point.",
    image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=800&q=80",
    alt: "A desk with organized notes and a laptop showing summarized content"
  },
  {
    title: "Story Transformer",
    description: "Struggling to understand complex concepts? Let VoxPal turn them into engaging, easy-to-understand stories—fun and unforgettable!",
    // image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
    image: "https://images.unsplash.com/photo-1690192435015-319c1d5065b2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    // image: "https://unsplash.com/photos/two-women-standing-in-front-of-a-whiteboard-with-writing-on-it-sDRKjiDHk3M",
    alt: "Microphone with sound waves and storytelling elements"
  },
  {
    title: "Speech Coach",
    description: "Curious what your audience thinks during your speech? Meet your personal Speech Coach—get feedback and boost your confidence instantly.",
    image: "https://images.unsplash.com/photo-1557425955-df376b5903c8?auto=format&fit=crop&w=800&q=80",
    alt: "Person confidently speaking at a podium"
  },
  {
    title: "Creative Story Generator",
    description: "Got silly ideas with friends? Turn random thoughts into creative stories with just a small plot—characters, genre, enjoy!",
    // image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    image: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Vintage microphone with colorful sound waves representing storytelling"
  },
  {
    title: "AI Companion",
    description: "Wanna share anything? or have any questions? Here is your Mate to speak - be heard, get answers.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    alt: "Friendly and modern AI interaction concept"
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900">
      {/* Navbar */}
      <nav className="fixed w-full bg-transparent backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                <span className="text-indigo-600 font-bold text-xl">VP</span>
              </div>
              <span className="text-white text-2xl font-bold">VoxPal</span>
            </div>
            <div className="hidden md:flex space-x-8">
              {/* <a href="#Pricing" className="text-white hover:text-pink-400 transition">Pricing</a> */}
              <a href="/register" className="text-white hover:text-pink-400 transition">Sign Up</a>
              <a href="/login" className="text-white hover:text-pink-400 transition">Login</a>
              {/* <a href="/login" className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition">
                Get Started
              </a> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-6">
              Your Voice Companion to Speak, Learn & Create
        </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Turn boring subjects into epic stories, explore fun voice translations, 
              get real-time feedback on your speeches, and chat with your smart AI buddy.
        </p>
            <div className="flex justify-center gap-6">
              <a href="/register" className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition shadow-lg">
                Get Started
              </a>
              {/* <a href="#demo" className="px-8 py-4 bg-white bg-opacity-10 text-white rounded-full hover:bg-opacity-20 transition">
                Watch Demo
              </a> */}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-t-[3rem] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Transform How You Learn and Communicate
        </h2>
          <div className="grid gap-16">
            {features.map((feature, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-center gap-12 ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}>
                <div className="flex-1">
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <img 
                      src={feature.image} 
                      alt={feature.alt}
                      className="w-full h-[300px] object-cover transform hover:scale-105 transition duration-500"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="text-3xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <a href={`#learn-more-${index}`} className="inline-block text-pink-600 hover:text-pink-700 font-semibold">
                    Learn more →
                  </a>
                </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-8">
            Ready to Have a friend to assist and have fun?
          </h2>
          <a href="/register" className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">
            Get Started for Free
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h3 className="font-bold text-xl mb-4">VoxPal</h3>
              <p className="text-gray-400">Your AI-powered voice companion for learning and communication.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#summarizer" className="hover:text-white">VoxBridge</a></li>
                <li><a href="#storyteller" className="hover:text-white">StoryTeller</a></li>
                <li><a href="#speech-coach" className="hover:text-white">SpeechCoach</a></li>
                <li><a href="#story-generator" className="hover:text-white">TalkMate</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#blog" className="hover:text-white">Blog</a></li>
                <li><a href="#careers" className="hover:text-white">Careers</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          {/* <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} VoxPal. All rights reserved.</p>
          </div> */}
        </div>
      </footer>
    </div>
  );
}
