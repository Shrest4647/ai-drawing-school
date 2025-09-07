/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/* tslint:disable */
import { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import DrawingCanvas, { DrawingCanvasRef } from '../DrawingCanvas';

const lessonSteps = [
    { instruction: "Welcome! Let's start with a simple straight line. Try drawing one from left to right." },
    { instruction: "Great! Now, how about a circle? Try to make it as round as you can." },
    { instruction: "Fantastic! Let's draw a square. Remember, it has four equal sides." },
    { instruction: "You're a natural! Now, try drawing a star. It has five points." },
    { instruction: "Amazing work! You've learned the basic shapes. You're ready to create anything!" },
];

export default function LessonOne({ onCompleteLesson }) {
    const [step, setStep] = useState(0);
    const canvasRef = useRef<DrawingCanvasRef>(null);

    const handleNext = () => {
        if (step < lessonSteps.length - 1) {
            setStep(step + 1);
        }
    };
    
    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };
    
    return (
        <div className="w-full max-w-7xl mx-auto bg-white/80 backdrop-blur-sm rounded-[44px] shadow-2xl overflow-hidden animate-fade-in border-4 border-white p-4 sm:p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-center text-text-dark mb-4">Lesson 1: Fun with Lines & Shapes!</h2>
            
            <div className="lesson-instruction-box p-4 rounded-2xl mb-4">
                <p className="text-lg text-text-dark text-center">{lessonSteps[step].instruction}</p>
            </div>
            
            <div className="flex flex-col items-center">
                <DrawingCanvas ref={canvasRef} />
            </div>
            
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handleBack}
                    disabled={step === 0}
                    className="onboarding-button bg-color-orange disabled:bg-gray-400 disabled:shadow-none"
                    aria-label="Previous step"
                >
                    <ArrowLeft className="w-6 h-6 mr-2" /> Back
                </button>

                {step < lessonSteps.length - 1 ? (
                    <button
                        onClick={handleNext}
                        className="onboarding-button bg-color-blue"
                        aria-label="Next step"
                    >
                        Next <ArrowRight className="w-6 h-6 ml-2" />
                    </button>
                ) : (
                    <button
                        onClick={onCompleteLesson}
                        className="onboarding-button bg-color-green"
                        aria-label="Finish lesson"
                    >
                        Finish Lesson <CheckCircle className="w-6 h-6 ml-2" />
                    </button>
                )}
            </div>
        </div>
    );
}
