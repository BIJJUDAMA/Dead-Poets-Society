import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EventPage = () => {
    const [puzzlePieces, setPuzzlePieces] = useState([]);
    const [draggedPiece, setDraggedPiece] = useState(null);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isComplete, setIsComplete] = useState(false);

    // Store piece and grid sizes as objects to handle rectangular shapes
    const [pieceSize, setPieceSize] = useState({ width: 100, height: 100 });
    const [gridDisplaySize, setGridDisplaySize] = useState({ width: 300, height: 300 });
    const [imageAspectRatio, setImageAspectRatio] = useState(1);
    const gridSize = 3;

    const canvasRef = useRef(null);
    const puzzleGridRef = useRef(null);
    const puzzleContainerRef = useRef(null);
    const puzzleWrapperRef = useRef(null); // Ref for measuring the container

    const imageUrl = '/Event.png';

    // Recalculates grid and piece sizes based on container width and image aspect ratio
    const updateGridSizes = useCallback(() => {
        if (puzzleWrapperRef.current && imageAspectRatio > 0) {
            const element = puzzleWrapperRef.current;
            const style = window.getComputedStyle(element);
            const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

            // Calculate the container width minus padding to get the exact content area
            const containerWidth = element.clientWidth - paddingX;

            // Calculate piece width based on container
            const newPieceWidth = Math.floor(containerWidth / gridSize);
            // Calculate piece height based on aspect ratio to maintain proportions
            const newPieceHeight = Math.floor(newPieceWidth / imageAspectRatio);

            setPieceSize({ width: newPieceWidth, height: newPieceHeight });

            // Calculate the total grid size to be a perfect multiple of the piece size
            const newGridDisplaySize = {
                width: newPieceWidth * gridSize,
                height: newPieceHeight * gridSize,
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

    // Update grid sizes when aspect ratio is known or when window resizes
    useEffect(() => {
        updateGridSizes();
        window.addEventListener('resize', updateGridSizes);
        return () => window.removeEventListener('resize', updateGridSizes);
    }, [updateGridSizes]);

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

    const handleMouseDown = (e, piece) => {
        if (isComplete) return;

        setDraggedPiece(piece);
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
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
        if (!draggedPiece) return;
        setPuzzlePieces(prev => prev.map(piece =>
            piece.id === draggedPiece.id
                ? { ...piece, dragPosition: { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } }
                : piece
        ));
    };

    const handleMouseUp = (e) => {
        if (!draggedPiece) return;

        if (puzzleGridRef.current) {
            const gridRect = puzzleGridRef.current.getBoundingClientRect();
            if (e.clientX > gridRect.left && e.clientX < gridRect.right && e.clientY > gridRect.top && e.clientY < gridRect.bottom) {
                const mouseX = e.clientX - gridRect.left;
                const mouseY = e.clientY - gridRect.top;
                const gridCol = Math.floor(mouseX / pieceSize.width);
                const gridRow = Math.floor(mouseY / pieceSize.height);

                const isOccupied = puzzlePieces.some(p => p.row === gridRow && p.col === gridCol);

                if (!isOccupied) {
                    setPuzzlePieces(prev => {
                        const updated = prev.map(piece =>
                            piece.id === draggedPiece.id
                                ? { ...piece, isInGrid: true, isInAvailable: false, dragPosition: null, row: gridRow, col: gridCol }
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

        setPuzzlePieces(prev => prev.map(piece =>
            piece.id === draggedPiece.id ? { ...piece, dragPosition: null } : piece
        ));
        setDraggedPiece(null);
    };

    const getGridPieces = () => puzzlePieces.filter(piece => piece.isInGrid);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto py-8 sm:py-12 px-4"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={(e) => handleMouseMove(e.touches[0])}
            onTouchEnd={handleMouseUp}
        >
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-white font-cinzel">
                Puzzle Challenge
            </h1>

            <div ref={puzzleContainerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-white">Available Pieces</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center p-2">
                        <div
                            className="grid grid-cols-3 gap-1"
                            style={{
                                width: `${gridDisplaySize.width}px`,
                                height: `${gridDisplaySize.height}px`,
                            }}
                        >
                            {puzzlePieces.map((piece) => {
                                const isVisible = piece.isInAvailable && draggedPiece?.id !== piece.id;
                                return (
                                    <div
                                        key={piece.id}
                                        className={`bg-gray-700 rounded-sm cursor-pointer transition-all duration-200`}
                                        onMouseDown={(e) => isVisible && handleMouseDown(e, piece)}
                                        onTouchStart={(e) => isVisible && handleMouseDown(e.touches[0], piece)}
                                        onClick={() => isVisible && handlePieceClick(piece)}
                                        style={{
                                            width: `${pieceSize.width}px`,
                                            height: `${pieceSize.height}px`,
                                            backgroundImage: isVisible ? `url(${piece.imageData})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            ... (isVisible && selectedPiece?.id === piece.id && {
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
                                                    onMouseDown={(e) => handleMouseDown(e, gridPiece)}
                                                    onTouchStart={(e) => handleMouseDown(e.touches[0], gridPiece)}
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

            {draggedPiece && draggedPiece.dragPosition && (
                <div
                    className="fixed pointer-events-none z-50 rounded shadow-2xl"
                    style={{
                        left: `${draggedPiece.dragPosition.x}px`,
                        top: `${draggedPiece.dragPosition.y}px`,
                        width: `${pieceSize.width}px`,
                        height: `${pieceSize.height}px`,
                        backgroundImage: `url(${draggedPiece.imageData})`,
                        backgroundSize: 'cover',
                        opacity: 0.9,
                        filter: 'drop-shadow(8px 8px 16px rgba(0,0,0,0.7))',
                        transform: 'rotate(-5deg) scale(1.1)',
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

