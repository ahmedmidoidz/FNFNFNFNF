
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from './Icons';

interface InfoTagProps {
    title: string;
    description: string;
}

const InfoTag: React.FC<InfoTagProps> = ({ title, description }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Use fixed coordinates relative to viewport
            setCoords({
                top: rect.bottom + 12,
                left: rect.left
            });
        }
    };

    const toggleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateCoords();
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    return (
        <div className="inline-block align-middle relative">
            <button 
                ref={triggerRef}
                onClick={toggleOpen}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all cursor-help border-2
                    ${isOpen 
                        ? 'bg-primary-500 text-white border-primary-400 scale-110 shadow-lg' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-primary-500 hover:text-white hover:border-primary-400'}`}
                aria-label="More information"
            >
                !
            </button>
            
            {isOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[20000] pointer-events-none">
                    {/* Full screen backdrop for click-out */}
                    <div 
                        className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-auto" 
                        onClick={() => setIsOpen(false)}
                    ></div>
                    
                    {/* Tooltip Card fixed relative to viewport */}
                    <div 
                        style={{ 
                            top: `${coords.top}px`, 
                            left: `${Math.max(10, Math.min(coords.left, window.innerWidth - 300))}px`,
                            position: 'fixed'
                        }}
                        className="w-72 p-5 bg-white dark:bg-slate-800 rounded-[1.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.4)] border-2 border-primary-500/30 dark:border-primary-500/20 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
                    >
                        <div className="flex justify-between items-center mb-3">
                             <h4 className="font-black text-[10px] text-primary-600 dark:text-primary-400 uppercase tracking-widest">{title}</h4>
                             <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition">
                                 <XIcon className="w-3 h-3 text-slate-400" />
                             </button>
                        </div>
                        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-relaxed text-start">
                            {description}
                        </p>
                        {/* Static Arrow */}
                        <div 
                            style={{ left: `${Math.max(10, coords.left - Math.max(10, Math.min(coords.left, window.innerWidth - 300)) + 4)}px` }}
                            className="absolute -top-2 w-4 h-4 bg-white dark:bg-slate-800 border-l-2 border-t-2 border-primary-500/30 dark:border-primary-500/20 rotate-45"
                        ></div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default InfoTag;
