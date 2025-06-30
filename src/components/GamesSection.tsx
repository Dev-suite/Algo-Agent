import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy,
  Clock,
  Users,
  Zap,
  Star,
  Play,
  RotateCcw,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from '../ui';
import { Character } from '../types';

interface GamesSectionProps {
  characters: Character[];
}

interface PuzzleState {
  grid: number[][];
  targetGrid: number[][];
  moves: number;
  isComplete: boolean;
  timeElapsed: number;
  isPlaying: boolean;
}

const GamesSection: React.FC<GamesSectionProps> = ({ characters }) => {
  const [gameState, setGameState] = useState<PuzzleState>({
    grid: [],
    targetGrid: [],
    moves: 0,
    isComplete: false,
    timeElapsed: 0,
    isPlaying: false
  });

  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    bestTime: 0,
    bestMoves: 0,
    totalScore: 0
  });

  // Generate a random 4x4 puzzle
  const generatePuzzle = () => {
    const size = 4;
    const target: number[][] = [];
    const puzzle: number[][] = [];
    
    // Create target pattern (checkerboard)
    for (let i = 0; i < size; i++) {
      target[i] = [];
      puzzle[i] = [];
      for (let j = 0; j < size; j++) {
        target[i][j] = (i + j) % 2;
        puzzle[i][j] = Math.random() > 0.5 ? 1 : 0;
      }
    }

    return { puzzle, target };
  };

  const startGame = () => {
    const { puzzle, target } = generatePuzzle();
    setGameState({
      grid: puzzle,
      targetGrid: target,
      moves: 0,
      isComplete: false,
      timeElapsed: 0,
      isPlaying: true
    });

    // Start timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      setGameState(prev => {
        if (!prev.isPlaying) {
          clearInterval(timer);
          return prev;
        }
        return {
          ...prev,
          timeElapsed: Math.floor((Date.now() - startTime) / 1000)
        };
      });
    }, 1000);
  };

  const toggleCell = (row: number, col: number) => {
    if (!gameState.isPlaying || gameState.isComplete) return;

    setGameState(prev => {
      const newGrid = prev.grid.map(r => [...r]);
      
      // Toggle clicked cell and adjacent cells
      const directions = [
        [0, 0], // center
        [-1, 0], // up
        [1, 0], // down
        [0, -1], // left
        [0, 1] // right
      ];

      directions.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
          newGrid[newRow][newCol] = 1 - newGrid[newRow][newCol];
        }
      });

      // Check if puzzle is complete
      const isComplete = newGrid.every((row, i) => 
        row.every((cell, j) => cell === prev.targetGrid[i][j])
      );

      const newMoves = prev.moves + 1;

      if (isComplete) {
        // Update stats
        setGameStats(prevStats => ({
          gamesPlayed: prevStats.gamesPlayed + 1,
          bestTime: prevStats.bestTime === 0 ? prev.timeElapsed : Math.min(prevStats.bestTime, prev.timeElapsed),
          bestMoves: prevStats.bestMoves === 0 ? newMoves : Math.min(prevStats.bestMoves, newMoves),
          totalScore: prevStats.totalScore + Math.max(1000 - (newMoves * 10) - (prev.timeElapsed * 5), 100)
        }));
      }

      return {
        ...prev,
        grid: newGrid,
        moves: newMoves,
        isComplete,
        isPlaying: !isComplete
      };
    });
  };

  const resetGame = () => {
    setGameState({
      grid: [],
      targetGrid: [],
      moves: 0,
      isComplete: false,
      timeElapsed: 0,
      isPlaying: false
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="font-['Montserrat'] text-[48px] font-[900] text-white leading-[48px]">
          Puzzle Master Arena
        </h1>
        <p className="font-['Montserrat'] text-[18px] font-[400] text-white/60 max-w-2xl mx-auto">
          Challenge your mind with the Puzzle Master - solve increasingly complex light puzzles
        </p>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Trophy, label: 'Games Played', value: gameStats.gamesPlayed, color: 'text-warning-400' },
          { icon: Clock, label: 'Best Time', value: gameStats.bestTime > 0 ? formatTime(gameStats.bestTime) : '--', color: 'text-brand-400' },
          { icon: Zap, label: 'Best Moves', value: gameStats.bestMoves > 0 ? gameStats.bestMoves : '--', color: 'text-success-400' },
          { icon: Star, label: 'Total Score', value: gameStats.totalScore.toLocaleString(), color: 'text-brand-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6"
          >
            <div className="flex items-center space-x-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="font-['Montserrat'] text-[28px] font-[700] text-white">{stat.value}</p>
                <p className="font-['Montserrat'] text-[14px] font-[500] text-white/60">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game Interface */}
        <div className="space-y-6">
          <div className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Montserrat'] text-[24px] font-[700] text-white">Puzzle Master</h2>
              <div className="flex items-center space-x-4">
                {gameState.isPlaying && (
                  <>
                    <div className="text-center">
                      <p className="font-['Montserrat'] text-[12px] text-white/60">Time</p>
                      <p className="font-['Montserrat'] text-[16px] font-[600] text-white">
                        {formatTime(gameState.timeElapsed)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-['Montserrat'] text-[12px] text-white/60">Moves</p>
                      <p className="font-['Montserrat'] text-[16px] font-[600] text-white">
                        {gameState.moves}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!gameState.isPlaying && !gameState.isComplete ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Play className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white mb-2">
                    Ready to Play Puzzle Master?
                  </h3>
                  <p className="font-['Montserrat'] text-[14px] text-white/60 mb-6">
                    Click cells to toggle them and adjacent cells. Match the target pattern to win!
                  </p>
                  <Button
                    variant="brand-primary"
                    size="large"
                    onClick={startGame}
                    icon={<Play className="w-5 h-5" />}
                  >
                    Start Game
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Target Pattern */}
                <div>
                  <h4 className="font-['Montserrat'] text-[16px] font-[600] text-white mb-3">Target Pattern:</h4>
                  <div className="grid grid-cols-4 gap-1 w-32 mx-auto">
                    {gameState.targetGrid.map((row, i) =>
                      row.map((cell, j) => (
                        <div
                          key={`target-${i}-${j}`}
                          className={`w-6 h-6 rounded border-2 ${
                            cell ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-600 border-gray-500'
                          }`}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Current Grid */}
                <div>
                  <h4 className="font-['Montserrat'] text-[16px] font-[600] text-white mb-3">Your Grid:</h4>
                  <div className="grid grid-cols-4 gap-2 w-64 mx-auto">
                    {gameState.grid.map((row, i) =>
                      row.map((cell, j) => (
                        <motion.button
                          key={`cell-${i}-${j}`}
                          onClick={() => toggleCell(i, j)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-12 h-12 rounded-lg border-2 transition-all duration-200 ${
                            cell 
                              ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50' 
                              : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                          } ${!gameState.isPlaying ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          disabled={!gameState.isPlaying}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Game Controls */}
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="neutral-secondary"
                    onClick={resetGame}
                    icon={<RotateCcw className="w-4 h-4" />}
                  >
                    Reset
                  </Button>
                  {!gameState.isPlaying && !gameState.isComplete && (
                    <Button
                      variant="brand-primary"
                      onClick={startGame}
                      icon={<Play className="w-4 h-4" />}
                    >
                      New Game
                    </Button>
                  )}
                </div>

                {/* Win Message */}
                {gameState.isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4 p-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30"
                  >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                    <h3 className="font-['Montserrat'] text-[24px] font-[700] text-white">
                      Puzzle Solved!
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="font-['Montserrat'] text-[20px] font-[600] text-white">
                          {formatTime(gameState.timeElapsed)}
                        </p>
                        <p className="font-['Montserrat'] text-[12px] text-white/60">Time</p>
                      </div>
                      <div>
                        <p className="font-['Montserrat'] text-[20px] font-[600] text-white">
                          {gameState.moves}
                        </p>
                        <p className="font-['Montserrat'] text-[12px] text-white/60">Moves</p>
                      </div>
                    </div>
                    <Button
                      variant="brand-primary"
                      onClick={startGame}
                      icon={<Play className="w-4 h-4" />}
                    >
                      Play Again
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Game Info & Character Selection */}
        <div className="space-y-6">
          {/* Game Description */}
          <div className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6">
            <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white mb-4">How to Play</h3>
            <div className="space-y-3 text-white/80">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">1</div>
                <p className="font-['Montserrat'] text-[14px]">Click any cell in the grid to toggle it and its adjacent cells (up, down, left, right)</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">2</div>
                <p className="font-['Montserrat'] text-[14px]">Match your grid pattern to the target pattern shown above</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">3</div>
                <p className="font-['Montserrat'] text-[14px]">Complete the puzzle in the fewest moves and fastest time possible</p>
              </div>
            </div>
          </div>

          {/* Character Selection */}
          {characters.length > 0 && (
            <div className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6">
              <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white mb-4">Play with Character</h3>
              <p className="font-['Montserrat'] text-[14px] text-white/60 mb-4">
                Select a character to provide hints and encouragement during gameplay
              </p>
              
              <div className="space-y-3">
                {characters.filter(c => c.status === 'active' || c.status === 'idle').slice(0, 3).map((character) => (
                  <motion.div
                    key={character.id}
                    onClick={() => setSelectedCharacter(character.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-[12px] border cursor-pointer transition-all duration-200 ${
                      selectedCharacter === character.id
                        ? 'border-brand-600/50 bg-brand-900/20'
                        : 'border-amber-800/30 bg-neutral-700/30 hover:bg-neutral-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-['Montserrat'] text-[16px] font-[600] text-white">{character.name}</h4>
                        <p className="font-['Montserrat'] text-[12px] text-white/60">Level {character.level} • {character.gamesPlayed} games</p>
                      </div>
                      {selectedCharacter === character.id && (
                        <CheckCircle className="w-5 h-5 text-brand-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6">
            <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white mb-4">Your Best Scores</h3>
            {gameStats.gamesPlayed > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-neutral-700/30 rounded-lg">
                  <span className="font-['Montserrat'] text-[14px] text-white/80">Best Time</span>
                  <span className="font-['Montserrat'] text-[14px] font-[600] text-white">{formatTime(gameStats.bestTime)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-700/30 rounded-lg">
                  <span className="font-['Montserrat'] text-[14px] text-white/80">Fewest Moves</span>
                  <span className="font-['Montserrat'] text-[14px] font-[600] text-white">{gameStats.bestMoves}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-700/30 rounded-lg">
                  <span className="font-['Montserrat'] text-[14px] text-white/80">Total Score</span>
                  <span className="font-['Montserrat'] text-[14px] font-[600] text-white">{gameStats.totalScore.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="font-['Montserrat'] text-[14px] text-white/60 text-center py-4">
                Play your first game to see your scores here!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesSection;