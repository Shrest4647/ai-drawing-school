/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* tslint:disable */
import { CatMascot, CoinIcon, HeartIcon, LockIcon, PlayIcon, RibbonIcon, StreakIcon, TranslateIcon, TrophyIcon } from './Icons';

const Header = ({ username }) => (
    <header className="flex justify-between items-center p-4">
        <div>
            <h1 className="text-2xl font-bold text-text-dark">Hi {username}!</h1>
            <p className="text-md text-text-light">Ready to learn today?</p>
        </div>
        <div className="flex items-center space-x-2">
            <div className="stats-item" aria-label="200 coins">
                <CoinIcon />
                <span className="font-bold">200</span>
            </div>
            <div className="stats-item" aria-label="5 lives">
                <HeartIcon />
                <span className="font-bold">5</span>
            </div>
            <div className="stats-item" aria-label="10 day streak">
                <StreakIcon />
                <span className="font-bold">10</span>
            </div>
        </div>
    </header>
);

const TopicCard = () => (
    <div className="relative mx-4 md:mx-0 p-4 rounded-3xl topic-card cursor-pointer" aria-label="Current Topic: Language & Literacy">
        <div className="flex justify-between">
            <div>
                <p className="font-semibold text-green-dark text-sm">Topic 3</p>
                <h2 className="text-3xl font-bold text-text-dark mt-1">Language & Literacy</h2>
            </div>
            <div className="relative">
                <CatMascot />
                <div className="absolute -top-1 -right-2 bg-white p-2 rounded-full shadow-md animate-pulse">
                    <TranslateIcon />
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-4 mt-4 text-sm font-semibold text-text-dark">
            <div className="flex items-center gap-2">
                <RibbonIcon /> Chatterbox
            </div>
            |
            <div className="flex items-center gap-2">
                <RibbonIcon /> Story Spinner
            </div>
        </div>
        <div className="mt-4">
            <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: '60%' }} aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}></div>
            </div>
        </div>
    </div>
);

const MilestoneNode = ({ status, style, label, onClick }) => {
    let icon;
    switch (status) {
        case 'completed':
            icon = <TrophyIcon />;
            break;
        case 'locked':
            icon = <LockIcon />;
            break;
        case 'current':
            icon = <PlayIcon />;
            break;
        default:
            icon = null;
    }

    return (
        <div className="absolute text-center transition-transform duration-200 hover:scale-110" style={style}>
            <button onClick={onClick} disabled={status !== 'current'} className={`milestone-node ${status}`} aria-label={label}>
                {icon}
            </button>
            {status === 'current' && (
                <span className="mt-2 inline-block start-lesson-label text-xs">
                    START LESSON
                </span>
            )}
        </div>
    );
};

const LessonPath = ({ milestones, onStartLesson }) => {
    const mobilePositions = [
        { top: '0%', left: '15%' },
        { top: '0%', left: '55%' },
        { top: '28%', left: '65%' },
        { top: '35%', left: '10%' },
        { top: '75%', left: '35%' },
    ];
    
    const desktopPositions = [
        { top: '30%', left: '5%' },
        { top: '10%', left: '35%' },
        { top: '25%', left: '65%' },
        { top: '70%', left: '35%' },
        { top: '55%', left: '85%' },
    ];
    
    // Create a map to ensure consistent positioning regardless of filtering
    const orderedMilestones = [...milestones].sort((a,b) => {
      const statusOrder = { 'completed': 1, 'current': 2, 'locked': 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return a.id - b.id;
    });

    // This logic maps the first two completed to the first two trophy spots,
    // the first current to the play button spot, and the rest to locked spots.
    // It's a bit contrived to match the static design but allows for dynamic data.
    const completedPositions = { mobile: [mobilePositions[0], mobilePositions[1]], desktop: [desktopPositions[0], desktopPositions[1]] };
    const currentPosition = { mobile: mobilePositions[2], desktop: desktopPositions[2] };
    const lockedPositions = { mobile: [mobilePositions[3], mobilePositions[4]], desktop: [desktopPositions[3], desktopPositions[4]] };

    const getStyle = (milestone, completedCount, lockedCount, isMobile) => {
        if(milestone.status === 'completed') return isMobile ? completedPositions.mobile[completedCount] : completedPositions.desktop[completedCount];
        if(milestone.status === 'current') return isMobile ? currentPosition.mobile : currentPosition.desktop;
        if(milestone.status === 'locked') return isMobile ? lockedPositions.mobile[lockedCount] : lockedPositions.desktop[lockedCount];
        return {};
    }

    let completedCounter = 0;
    let lockedCounter = 0;

    return (
        <div className="relative w-full h-80 md:h-96 mt-6 md:mt-0" aria-label="Lesson Path">
            <div className="md:hidden">
                <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 28 13 Q 45 13 65 13 Q 95 13 90 40 T 40 45 Q 5 50 15 70 T 50 85" stroke="var(--color-path)" strokeWidth="5" fill="none" strokeLinecap="round" />
                </svg>
                {milestones.map((milestone) => (
                    <MilestoneNode 
                        key={milestone.id} 
                        status={milestone.status}
                        style={getStyle(milestone, completedCounter, lockedCounter, true)}
                        label={`Lesson ${milestone.id}: ${milestone.status}`}
                        onClick={milestone.status === 'current' ? () => onStartLesson(milestone.id) : null}
                    />
                ))}
            </div>
            <div className="hidden md:block">
                 <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 10 40 Q 25 20 40 40 T 70 40 Q 90 50 75 65 T 40 75" stroke="var(--color-path)" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
                {milestones.map((milestone) => {
                    const style = getStyle(milestone, completedCounter, lockedCounter, false);
                    if(milestone.status === 'completed') completedCounter++;
                    if(milestone.status === 'locked') lockedCounter++;
                    return (
                        <MilestoneNode 
                            key={milestone.id} 
                            status={milestone.status}
                            style={style}
                            label={`Lesson ${milestone.id}: ${milestone.status}`}
                            onClick={milestone.status === 'current' ? () => onStartLesson(milestone.id) : null}
                        />
                    )
                })}
            </div>
        </div>
    );
}


export default function LevelsPage({ username, milestones, onStartLesson }) {
    return (
        <div className="w-full max-w-sm md:max-w-7xl mx-auto bg-white/80 backdrop-blur-sm rounded-[44px] shadow-2xl overflow-hidden animate-fade-in border-4 border-white">
            <div className="p-2 md:p-4">
                <Header username={username} />
                <div className="md:flex md:gap-8 md:items-start mt-4">
                    <div className="md:w-2/5 lg:w-1/3">
                        <TopicCard />
                    </div>
                    <div className="md:w-3/5 lg:w-2/3">
                        <LessonPath milestones={milestones} onStartLesson={onStartLesson} />
                    </div>
                </div>
            </div>
        </div>
    );
}