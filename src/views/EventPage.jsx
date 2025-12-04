"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EventPage = () => {
    const [puzzlePieces, setPuzzlePieces] = useState([]);
    const [draggedPiece, setDraggedPiece] = useState(null);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });
    const dragElementRef = useRef(null);
    const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
    const [isComplete, setIsComplete] = useState(false);

    const [pieceSize, setPieceSize] = useState({ width: 100, height: 100 });
    const [gridDisplaySize, setGridDisplaySize] = useState({ width: 300, height: 300 });
    const [imageAspectRatio, setImageAspectRatio] = useState(1);
    const [isDesktop, setIsDesktop] = useState(false);
    const gridSize = 3;

    const canvasRef = useRef(null);
    const puzzleGridRef = useRef(null);
    const puzzleContainerRef = useRef(null);
    const puzzleWrapperRef = useRef(null)

    const imageUrl = '/Event.png';

    const updateGridSizes = useCallback(() => {
        if (puzzleWrapperRef.current && imageAspectRatio > 0) {
            const element = puzzleWrapperRef.current;
            const style = window.getComputedStyle(element);
            const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

            const containerWidth = element.clientWidth - paddingX;

            // On mobile, we stack 2 grids, so we need space for roughly 2 * (gridSize * height)
            // On desktop, we have side-by-side, so we need space for 1 * (gridSize * height)
            const currentIsDesktop = window.innerWidth >= 1024; // lg breakpoint
            const availableHeight = window.innerHeight - 200; // Subtract header/padding

            let maxPieceWidth = Math.floor(containerWidth / gridSize);

            // Mobile: 2 grids stacked + gap. Desktop: 1 grid.
            const verticalDivisor = currentIsDesktop ? gridSize : (gridSize * 2.2); // 2.2 to account for gap/tray
            const maxPieceHeight = Math.floor(availableHeight / verticalDivisor);

            const widthFromHeight = Math.floor(maxPieceHeight * imageAspectRatio);
            const finalPieceWidth = Math.min(maxPieceWidth, widthFromHeight);
            const finalPieceHeight = Math.floor(finalPieceWidth / imageAspectRatio);

            setPieceSize({ width: finalPieceWidth, height: finalPieceHeight });

            // Calculate the total grid size to be a perfect multiple of the piece size
            const newGridDisplaySize = {
                width: finalPieceWidth * gridSize,
                height: finalPieceHeight * gridSize,
            };
            setGridDisplaySize(newGridDisplaySize);
        }
    }, [gridSize, imageAspectRatio]);

    // Load image to determine its aspect ratio
    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            setImageAspectRatio(img.width / img.height);
        };
        img.src = imageUrl;
    }, [imageUrl]);

    // Update grid sizes using ResizeObserver
    useEffect(() => {
        if (!puzzleWrapperRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            updateGridSizes();
        });

        resizeObserver.observe(puzzleWrapperRef.current);
        return () => resizeObserver.disconnect();
    }, [updateGridSizes]);

    useEffect(() => {
        setIsDesktop(window.innerWidth >= 1024);
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const createPuzzlePieces = useCallback(() => {
        if (!canvasRef.current || pieceSize.width <= 0 || pieceSize.height <= 0) return;

        setIsComplete(false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            const totalWidth = pieceSize.width * gridSize;
            const totalHeight = pieceSize.height * gridSize;
            canvas.width = totalWidth;
            canvas.height = totalHeight;
            ctx.drawImage(img, 0, 0, totalWidth, totalHeight);

            const pieces = [];
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    const pieceId = row * gridSize + col;
                    const x = col * pieceSize.width;
                    const y = row * pieceSize.height;

                    const pieceCanvas = document.createElement('canvas');
                    pieceCanvas.width = pieceSize.width;
                    pieceCanvas.height = pieceSize.height;
                    const pieceCtx = pieceCanvas.getContext('2d');
                    pieceCtx.drawImage(
                        canvas,
                        x, y, pieceSize.width, pieceSize.height,
                        0, 0, pieceSize.width, pieceSize.height
                    );

                    pieces.push({
                        id: pieceId,
                        correctPosition: { row, col },
                        imageData: pieceCanvas.toDataURL(),
                        row: null,
                        col: null,
                        isInGrid: false,
                        isInAvailable: true
                    });
                }
            }

            const shuffledPieces = shuffleArray(pieces);
            setPuzzlePieces(shuffledPieces);
        };

        img.src = imageUrl;
    }, [pieceSize, gridSize, imageUrl]);

    useEffect(() => {
        // Recreate pieces whenever the pieceSize changes
        if (pieceSize.width > 0 && pieceSize.height > 0) {
            createPuzzlePieces();
        }
    }, [createPuzzlePieces]);

    const handleDragStart = (e, piece) => {
        if (isComplete) return;

        // Prevent default to stop scrolling immediately on touch
        if (e.type === 'touchstart') {

        }

        // Normalize event coordinates (Mouse vs Touch)
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Record start for tap detection
        touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };

        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;

        dragOffsetRef.current = { x: offsetX, y: offsetY };
        setDraggedPiece({ ...piece, initialX: clientX - offsetX, initialY: clientY - offsetY });
        setSelectedPiece(null);

        if (piece.isInGrid) {
            setPuzzlePieces(prev => prev.map(p =>
                p.id === piece.id
                    ? { ...p, isInGrid: false, isInAvailable: true, row: null, col: null }
                    : p
            ));
        }
    };

    const handlePieceClick = (piece) => {
        if (!piece.isInAvailable) return;
        setSelectedPiece(prev => (prev && prev.id === piece.id ? null : piece));
    };

    const handleGridClick = (row, col) => {
        if (!selectedPiece) return;

        const isOccupied = puzzlePieces.some(p => p.row === row && p.col === col);

        if (!isOccupied) {
            setPuzzlePieces(prev => {
                const updated = prev.map(piece =>
                    piece.id === selectedPiece.id
                        ? { ...piece, isInGrid: true, isInAvailable: false, row: row, col: col }
                        : piece
                );
                const isNowComplete = updated.every(p => p.isInGrid && p.row === p.correctPosition.row && p.col === p.correctPosition.col);
                if (isNowComplete) {
                    setIsComplete(true);
                }
                return updated;
            });
            setSelectedPiece(null);
        }
    };

    const handleMouseMove = (e) => {
        if (!draggedPiece || !dragElementRef.current) return;

        // Prevent scrolling on touch devices
        if (e.cancelable) e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = clientX - dragOffsetRef.current.x;
        const y = clientY - dragOffsetRef.current.y;

        dragElementRef.current.style.transform = `translate(${x}px, ${y}px) rotate(-5deg) scale(1.1)`;
    };

    const handleMouseUp = (e) => {
        if (!draggedPiece) return;

        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

        // Check for Tap (Click)
        const diffX = Math.abs(clientX - touchStartRef.current.x);
        const diffY = Math.abs(clientY - touchStartRef.current.y);
        const diffTime = Date.now() - touchStartRef.current.time;

        // If moved less than 10px and faster than 300ms, treat as click
        if (diffX < 10 && diffY < 10 && diffTime < 300) {
            handlePieceClick(draggedPiece);
            setDraggedPiece(null);
            return;
        }

        if (puzzleGridRef.current) {
            const gridRect = puzzleGridRef.current.getBoundingClientRect();
            // Calculate the center of the dragged piece for better hit testing
            const pieceCenterX = clientX - dragOffsetRef.current.x + (pieceSize.width / 2);
            const pieceCenterY = clientY - dragOffsetRef.current.y + (pieceSize.height / 2);

            if (pieceCenterX > gridRect.left && pieceCenterX < gridRect.right &&
                pieceCenterY > gridRect.top && pieceCenterY < gridRect.bottom) {

                const relativeX = pieceCenterX - gridRect.left;
                const relativeY = pieceCenterY - gridRect.top;

                const gridCol = Math.floor(relativeX / pieceSize.width);
                const gridRow = Math.floor(relativeY / pieceSize.height);

                // Ensure we are within valid grid bounds
                if (gridCol >= 0 && gridCol < gridSize && gridRow >= 0 && gridRow < gridSize) {
                    const isOccupied = puzzlePieces.some(p => p.row === gridRow && p.col === gridCol);

                    if (!isOccupied) {
                        setPuzzlePieces(prev => {
                            const updated = prev.map(piece =>
                                piece.id === draggedPiece.id
                                    ? { ...piece, isInGrid: true, isInAvailable: false, row: gridRow, col: gridCol }
                                    : piece
                            );

                            const isNowComplete = updated.every(p => p.isInGrid && p.row === p.correctPosition.row && p.col === p.correctPosition.col);
                            if (isNowComplete) {
                                setIsComplete(true);
                            }

                            return updated;
                        });
                        setDraggedPiece(null);
                        return;
                    }
                }
            }
        }

        setDraggedPiece(null);
    };

    const getGridPieces = () => puzzlePieces.filter(piece => piece.isInGrid);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto py-4 sm:py-8 px-4 h-[100dvh] overflow-hidden flex flex-col"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
        >
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-white font-cinzel">
                Puzzle Challenge
            </h1>

            <div ref={puzzleContainerRef} className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-start overflow-y-auto lg:overflow-visible">
                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Available Pieces</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center p-2">
                        <div
                            className="flex flex-wrap gap-2 justify-center lg:grid lg:grid-cols-3 lg:gap-1"
                            style={{
                                // Only apply fixed size on desktop to maintain grid structure
                                ...(isDesktop && {
                                    width: `${gridDisplaySize.width}px`,
                                    height: `${gridDisplaySize.height}px`,
                                })
                            }}
                        >
                            {puzzlePieces.map((piece) => {
                                const isVisible = piece.isInAvailable && draggedPiece?.id !== piece.id;
                                // On mobile: hide if not available (compact tray).
                                // On desktop: invisible if not available (maintain grid slot).
                                const visibilityClass = isVisible ? '' : 'hidden lg:block lg:invisible';

                                return (
                                    <div
                                        key={piece.id}
                                        className={`bg-gray-700 rounded-sm cursor-pointer transition-all duration-200 touch-none ${visibilityClass}`}
                                        onMouseDown={(e) => isVisible && handleDragStart(e, piece)}
                                        onTouchStart={(e) => isVisible && handleDragStart(e, piece)}
                                        // onClick removed, handled by custom tap detection in handleMouseUp
                                        style={{
                                            width: `${pieceSize.width}px`,
                                            height: `${pieceSize.height}px`,
                                            backgroundImage: isVisible ? `url(${piece.imageData})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            ...(isVisible && selectedPiece?.id === piece.id && {
                                                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.75)',
                                                transform: 'scale(1.05)',
                                            })
                                        }}
                                    />
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white text-center">Puzzle Grid</CardTitle>
                    </CardHeader>
                    <CardContent ref={puzzleWrapperRef} className="flex justify-center items-center p-2">
                        <div
                            ref={puzzleGridRef}
                            className="relative bg-gray-800 rounded-lg"
                            style={{
                                width: `${gridDisplaySize.width}px`,
                                height: `${gridDisplaySize.height}px`
                            }}
                        >
                            <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                                {Array.from({ length: gridSize - 1 }).map((_, i) => (
                                    <line
                                        key={`v-${i}`}
                                        x1={(i + 1) * pieceSize.width}
                                        y1={0}
                                        x2={(i + 1) * pieceSize.width}
                                        y2={gridDisplaySize.height}
                                        stroke="#4b5563"
                                        strokeWidth="2"
                                        opacity="0.5"
                                    />
                                ))}
                                {Array.from({ length: gridSize - 1 }).map((_, i) => (
                                    <line
                                        key={`h-${i}`}
                                        x1={0}
                                        y1={(i + 1) * pieceSize.height}
                                        x2={gridDisplaySize.width}
                                        y2={(i + 1) * pieceSize.height}
                                        stroke="#4b5563"
                                        strokeWidth="2"
                                        opacity="0.5"
                                    />
                                ))}
                            </svg>
                            {Array.from({ length: gridSize }).map((_, row) =>
                                Array.from({ length: gridSize }).map((_, col) => {
                                    const gridPiece = getGridPieces().find(p => p.row === row && p.col === col);
                                    return (
                                        <div
                                            key={`${row}-${col}`}
                                            className={`absolute cursor-pointer transition-all duration-200 ${!gridPiece && selectedPiece ? 'hover:bg-blue-500 hover:bg-opacity-20' : ''}`}
                                            style={{ left: `${col * pieceSize.width}px`, top: `${row * pieceSize.height}px`, width: `${pieceSize.width}px`, height: `${pieceSize.height}px` }}
                                            onClick={() => handleGridClick(row, col)}
                                        >
                                            {gridPiece && (
                                                <div
                                                    className="w-full h-full cursor-grab"
                                                    style={{ backgroundImage: `url(${gridPiece.imageData})`, backgroundSize: 'cover' }}
                                                    onMouseDown={(e) => handleDragStart(e, gridPiece)}
                                                    onTouchStart={(e) => handleDragStart(e, gridPiece)}
                                                />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {draggedPiece && (
                <div
                    ref={dragElementRef}
                    className="fixed pointer-events-none z-50 rounded shadow-2xl"
                    style={{
                        left: 0,
                        top: 0,
                        width: `${pieceSize.width}px`,
                        height: `${pieceSize.height}px`,
                        backgroundImage: `url(${draggedPiece.imageData})`,
                        backgroundSize: 'cover',
                        opacity: 0.9,
                        filter: 'drop-shadow(8px 8px 16px rgba(0,0,0,0.7))',
                        transform: `translate(${draggedPiece.initialX}px, ${draggedPiece.initialY}px) rotate(-5deg) scale(1.1)`,
                        border: '3px solid rgba(59, 130, 246, 0.5)',
                        borderRadius: '8px'
                    }}
                />
            )}

            {isComplete && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-8 p-6 bg-green-900/50 border border-green-700 rounded-lg"
                >
                    <h3 className="text-3xl font-bold text-green-400 mb-2">Puzzle Complete!</h3>
                    <p className="text-gray-300 text-lg">
                        Congratulations! You solved the puzzle.
                    </p>
                </motion.div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </motion.div>
    );
};

export default EventPage;

