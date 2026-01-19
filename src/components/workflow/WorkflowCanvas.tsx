import React, { useState, useRef, useEffect } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { StepNode } from './StepNode';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export const WorkflowCanvas: React.FC = () => {
    const { steps, selectedStepId, selectStep } = useWorkflowStore();

    // State for infinite canvas
    const [zoom, setZoom] = useState(100);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);

    // Handle Space Key for Hand Tool
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat && !(e.target as HTMLElement).closest('input, textarea')) { // Exclude input/textarea
                e.preventDefault(); // Prevent page scroll
                setIsSpacePressed(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
                setIsDragging(false); // Stop dragging if space is released
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Handle Wheel Zoom (Ctrl + Wheel) and Pan (Wheel only? usually specialized, let's keep it simple)
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = -e.deltaY;
                setZoom(prev => {
                    const newZoom = prev + delta * 0.1;
                    return Math.min(Math.max(newZoom, 25), 200);
                });
            } else {
                // Optional: Wheel to pan if not ctrl? Standard usage usually scrolls.
                // For infinite canvas, standard wheel often pans vertically, shift+wheel horizontally.
                // Let's implement standard scrolling behavior -> panning
                // remove preventDefault if you want native feel, but we are overflow hidden.
                setPan(prev => ({
                    x: prev.x - e.deltaX,
                    y: prev.y - e.deltaY
                }));
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag with left click (0) or middle click (1). 
        // Avoid dragging when clicking on a node (those have their own handlers, stopPropagation there or check target)
        // For simplicity, we check if target is the container directly or the background wrapper
        // But since events bubble, we might catch it from a node.
        // We'll rely on Nodes keeping their click events or preventing default if needed.
        // Actually, Figma allows dragging anywhere if you hold space, or background drag.

        // Check if we clicked on a button or node
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.step-node')) {
            return;
        }

        // Enable drag if Space is pressed OR Middle Mouse Button (button 1)
        const isMiddleClick = e.button === 1;

        // If not Space and not Middle click, check if we clicked background
        // But user asked for Space to trigger hand. 
        // Usually standard tools: Space down -> click drag pans.
        // Without Space -> Click usually selects.
        // So ONLY pan if Space is held OR Middle Click.
        // What about "drag anywhere on background"? User said "space bar... should trigger a hand and able to move".
        // Let's support both: explicit Space mode, or background click? 
        // User complaint was "cant see any cards", implied they couldn't move. 
        // Let's strictly follow: Space triggers Hand -> dragging.

        // Also support dragging blank canvas areas if desired, but Space is the request.
        const isBackground = e.target === containerRef.current || (e.target as HTMLElement).classList.contains('canvas-bg');

        if (isSpacePressed || isMiddleClick || isBackground) {
            // Allow panning
            setIsDragging(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;

        setPan(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));

        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 25));
    const handleResetZoom = () => {
        setZoom(100);
        setPan({ x: 0, y: 0 });
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex-1 h-full relative overflow-hidden flex flex-col items-center select-none bg-slate-50",
                isSpacePressed ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default",
                // Fallback for background dragging if implemented
                isDragging && !isSpacePressed && "cursor-grabbing"
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >

            {/* Dynamic Background Pattern that moves with Pan */}
            <div
                className="canvas-bg absolute inset-0 pointer-events-none opacity-[0.4]"
                style={{
                    backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: `${pan.x}px ${pan.y}px` // Sync grid with pan
                }}
            />

            {/* Infinite Canvas Content Area */}
            {/* 
               We translate the entire content wrapper based on Pan.
               We scale based on Zoom.
               Origin center usually feels best for infinite canvas, but let's try top-center or keeping it simple.
               Actually, putting the content in the center first and allowing it to move is good.
             */}
            <div
                className="absolute w-full min-h-full flex flex-col items-center transition-transform duration-75 ease-out origin-top pointer-events-none" // pointer-events-none on wrapper to let clicks pass through to background/nodes? 
                // Wait, if wrapper is pointer-events-none, nodes need pointer-events-auto
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
                    paddingTop: '4rem'
                }}
            >
                {/* Pointer events auto for children */}
                <div className="flex flex-col items-center pointer-events-auto pb-40">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            {index > 0 && (
                                <div className="h-8 w-0.5 bg-gray-300 my-1" />
                            )}

                            <div className="step-node relative z-10"> {/* Wrapper class for click detection logic */}
                                <StepNode
                                    step={step}
                                    index={index}
                                    isSelected={selectedStepId === step.id}
                                    onClick={() => selectStep(step.id)}
                                />
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Floating Zoom Controls (Bottom Left - Relative to Canvas) */}
            <div className="absolute bottom-6 left-8 bg-white rounded-full shadow-xl border border-gray-200 p-1 flex items-center gap-2 z-50">
                <button
                    onClick={handleZoomOut}
                    className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                    title="Zoom Out"
                >
                    <Minus className="w-4 h-4" />
                </button>

                <span
                    onClick={handleResetZoom}
                    className="text-xs font-semibold text-gray-700 min-w-[3rem] text-center cursor-pointer hover:text-gray-900 select-none"
                    title="Reset to 100%"
                >
                    {Math.round(zoom)}%
                </span>

                <button
                    onClick={handleZoomIn}
                    className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                    title="Zoom In"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

        </div>
    );
};
