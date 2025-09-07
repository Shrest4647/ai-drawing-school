/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* tslint:disable */
import { useState, useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import {fenAvatar} from "./assets";
import LevelsPage from './components/LevelsPage';
import LessonOne from './components/LessonOne';
import { AvatarFace, AvatarPreview, AvatarShape } from './components/Avatar';


export default function Home() {
  const [view, setView] = useState('welcome');
  const [username, setUsername] = useState('Zara');
  const [avatar, setAvatar] = useState({
    shape: 'circle',
    face: 'smile',
    color: '#FF6B35',
  });
  const [milestones, setMilestones] = useState([
    { id: 1, status: 'current' },
    { id: 2, status: 'locked' },
    { id: 3, status: 'locked' },
    { id: 4, status: 'locked' },
    { id: 5, status: 'locked' },
  ]);

  const handleStartLesson = (lessonId) => {
    // This logic can be expanded for more lessons
    if (lessonId === 1) {
      setView('lesson_one');
    }
  };

  const handleCompleteLesson = (lessonId) => {
    setMilestones(prevMilestones => {
      const newMilestones = prevMilestones.map(m => ({ ...m }));
      const completedLessonIndex = newMilestones.findIndex(m => m.id === lessonId);
      
      if (completedLessonIndex !== -1) {
        newMilestones[completedLessonIndex].status = 'completed';
        if (completedLessonIndex + 1 < newMilestones.length) {
          newMilestones[completedLessonIndex + 1].status = 'current';
        }
      }
      return newMilestones;
    });
    setView('levels');
  };

  const avatarOptions = useMemo(() => ({
    shapes: ['circle', 'square', 'star'],
    faces: ['smile', 'happy', 'excited'],
    colors: ['#FF6B35', '#4A90E2', '#7ED321', '#9013FE'],
  }), []);

  const renderContent = () => {
    switch (view) {
      case 'avatar':
        return (
          <div key="avatar" className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">Create Your Avatar!</h2>
            <div className="w-48 h-48 bg-white rounded-2xl shadow-lg p-2 mb-8">
              <AvatarPreview avatar={avatar} />
            </div>

            <div className="w-full space-y-6">
              <div>
                <h3 className="font-semibold text-lg text-gray-700 mb-3 text-center">Shape</h3>
                <div className="flex justify-center gap-4">
                  {avatarOptions.shapes.map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setAvatar(prev => ({ ...prev, shape }))}
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 ${
                        avatar.shape === shape ? 'ring-4 ring-orange-400 shadow-md' : 'shadow-sm'
                      }`}
                      style={{ backgroundColor: avatar.shape === shape ? 'white' : '#f0f0f0' }}
                      aria-label={`Select ${shape} shape`}
                    >
                      <svg viewBox="0 0 100 100" className="w-12 h-12">
                        <AvatarShape shape={shape} color="#cccccc" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-gray-700 mb-3 text-center">Face</h3>
                <div className="flex justify-center gap-4">
                   {avatarOptions.faces.map((face) => (
                    <button
                      key={face}
                      onClick={() => setAvatar(prev => ({ ...prev, face }))}
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 ${
                        avatar.face === face ? 'ring-4 ring-blue-400 shadow-md' : 'shadow-sm'
                      }`}
                      style={{ backgroundColor: avatar.face === face ? 'white' : '#f0f0f0' }}
                      aria-label={`Select ${face} face`}
                    >
                      <svg viewBox="0 0 100 100" className="w-14 h-14">
                        <AvatarFace face={face} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
               <div>
                <h3 className="font-semibold text-lg text-gray-700 mb-3 text-center">Color</h3>
                <div className="flex justify-center gap-4">
                   {avatarOptions.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatar(prev => ({ ...prev, color }))}
                      className={`w-20 h-20 rounded-2xl transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-4 ${
                        avatar.color === color ? 'ring-4 ring-green-400 shadow-md' : 'shadow-sm'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setView('username')}
              className="onboarding-button bg-color-green mt-12"
              aria-label="Next step: choose username"
            >
              Next <ArrowRight className="w-6 h-6 ml-2" />
            </button>
          </div>
        );
      
      case 'username':
        return (
          <div key="username" className="w-full max-w-lg mx-auto flex flex-col items-center animate-fade-in">
             <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">What should we call you?</h2>
             <div className="w-32 h-32 bg-white rounded-full shadow-lg p-2 mb-8 border-4 border-white">
                <AvatarPreview avatar={avatar} />
             </div>
             <div className="w-full relative">
                <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-16 text-xl text-center text-gray-800 bg-white rounded-full border-2 border-gray-300 shadow-inner focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all px-6"
                    aria-label="Enter your name"
                />
             </div>
             <button
              onClick={() => setView('levels')}
              disabled={!username.trim()}
              className="onboarding-button bg-color-purple mt-8 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none"
              aria-label="Start your adventure"
            >
              Start Your Adventure! <Sparkles className="w-6 h-6 ml-2" />
            </button>
          </div>
        );

      case 'levels':
        return <LevelsPage username={username} milestones={milestones} onStartLesson={handleStartLesson} />;

      case 'lesson_one':
        return <LessonOne onCompleteLesson={() => handleCompleteLesson(1)} />;

      case 'welcome':
      default:
        return (
          <div key="welcome" className="flex flex-col items-center text-center animate-fade-in">
            <div className="relative mb-6">
                <img src={fenAvatar} alt="Fen, the friendly red panda art master" className="w-64 h-64 object-cover rounded-full shadow-2xl border-8 border-white" />
                <Sparkles className="w-12 h-12 text-yellow-300 absolute -top-2 -right-2 animate-sparkle" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Welcome to <span className="text-color-orange">Fen Draw</span>!
            </h1>
            <p className="text-lg md:text-xl max-w-2xl text-gray-600 mb-10">
              Enter a magical forest of sketching and learning, where your creativity comes to life with a little help from your AI friend, Fen!
            </p>
            <button 
              onClick={() => setView('avatar')}
              className="onboarding-button bg-color-blue"
              aria-label="Start the onboarding process"
            >
              Let's Go! <ArrowRight className="w-7 h-7 ml-3" />
            </button>
          </div>
        );
    }
  };

  const backgroundClass = view === 'levels' || view === 'lesson_one' ? 'levels-page-bg' : 'onboarding-bg';

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 ${backgroundClass} transition-colors duration-500`}>
      <main className="w-full">
        {renderContent()}
      </main>
    </div>
  );
}