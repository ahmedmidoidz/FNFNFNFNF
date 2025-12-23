
import React, { useState, useEffect } from 'react';
import { StorySlide } from '../types';
import { XIcon } from './Icons';

interface StoryViewerProps {
    stories: StorySlide[];
    onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (currentIndex < stories.length - 1) {
                        setCurrentIndex(c => c + 1);
                        return 0;
                    } else {
                        clearInterval(timer);
                        onClose();
                        return 100;
                    }
                }
                return prev + 1; // 1% every 50ms approx 5 seconds
            });
        }, 50);

        return () => clearInterval(timer);
    }, [currentIndex, stories.length, onClose]);

    const handleTap = (side: 'left' | 'right') => {
        if (side === 'left') {
            if (currentIndex > 0) {
                setCurrentIndex(c => c - 1);
                setProgress(0);
            }
        } else {
            if (currentIndex < stories.length - 1) {
                setCurrentIndex(c => c + 1);
                setProgress(0);
            } else {
                onClose();
            }
        }
    };

    if (stories.length === 0) return null;

    const slide = stories[currentIndex];
    const bgColor = slide.type === 'warning' ? 'bg-red-500' : slide.type === 'summary' ? 'bg-emerald-500' : 'bg-indigo-500';

    return (
        <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center sm:p-4 animate-in fade-in duration-300">
            <div className={`relative w-full max-w-md h-full sm:h-[80vh] sm:rounded-[2.5rem] overflow-hidden flex flex-col ${bgColor} transition-colors duration-700`}>
                {/* Background Decor */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Progress Bars */}
                <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
                    {stories.map((_, idx) => (
                        <div key={idx} className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                            <div 
                                className={`h-full bg-white transition-all duration-100 ease-linear ${idx < currentIndex ? 'w-full' : idx === currentIndex ? '' : 'w-0'}`}
                                style={{ width: idx === currentIndex ? `${progress}%` : undefined }}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-8 right-4 z-30 text-white/80 hover:text-white p-2">
                    <XIcon className="w-8 h-8" />
                </button>

                {/* Tap Zones */}
                <div className="absolute inset-0 z-10 flex">
                    <div className="w-1/3 h-full" onClick={() => handleTap('left')}></div>
                    <div className="w-2/3 h-full" onClick={() => handleTap('right')}></div>
                </div>

                {/* Content */}
                <div className="relative z-0 flex flex-col items-center justify-center h-full text-center p-8 space-y-8 animate-in zoom-in-95 duration-500 key={currentIndex}">
                    <div className="text-9xl animate-bounce shadow-xl drop-shadow-2xl filter">{slide.emoji}</div>
                    <div>
                        <h2 className="text-4xl font-black text-white mb-4 drop-shadow-md leading-tight">{slide.title}</h2>
                        <p className="text-xl text-white/90 font-medium leading-relaxed">{slide.text}</p>
                    </div>
                    {slide.dataPoint && (
                        <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                            <span className="text-2xl font-black text-white">{slide.dataPoint}</span>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-8 left-0 right-0 text-center z-0">
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest">SpendWise Stories</p>
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;
