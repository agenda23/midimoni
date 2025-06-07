import { useState, useEffect } from "react";

interface MIDIVisualizerProps {
  ccValues: { [key: number]: number };
  noteStates: { [key: number]: boolean };
}

export function MIDIVisualizer({ ccValues, noteStates }: MIDIVisualizerProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">グラフィカルUI</h2>
      
      {/* CC Controllers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">コントロールチェンジ</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(ccValues).slice(0, 16).map(([cc, value]) => (
            <CCKnob key={cc} ccNumber={parseInt(cc)} value={value} />
          ))}
        </div>
        {Object.keys(ccValues).length === 0 && (
          <div className="text-gray-500 text-center py-8">
            CCメッセージを受信すると表示されます
          </div>
        )}
      </div>

      {/* Note States */}
      <div>
        <h3 className="text-lg font-semibold mb-3">ノート状態</h3>
        <PianoRoll noteStates={noteStates} />
      </div>
    </div>
  );
}

interface CCKnobProps {
  ccNumber: number;
  value: number;
}

function CCKnob({ ccNumber, value }: CCKnobProps) {
  const percentage = (value / 127) * 100;
  const circumference = 2 * Math.PI * 28;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-600"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={strokeDasharray}
            className="text-blue-400 transition-all duration-200"
            style={{
              filter: `drop-shadow(0 0 ${Math.max(2, percentage / 10)}px rgb(96 165 250))`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold">{value}</span>
        </div>
      </div>
      <div className="text-xs text-gray-400">CC{ccNumber}</div>
    </div>
  );
}

interface PianoRollProps {
  noteStates: { [key: number]: boolean };
}

function PianoRoll({ noteStates }: PianoRollProps) {
  const whiteKeys = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
  const blackKeys = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#
  
  const getNoteName = (noteNumber: number) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = noteNames[noteNumber % 12];
    return `${note}${octave}`;
  };

  const isBlackKey = (noteNumber: number) => {
    return blackKeys.includes(noteNumber % 12);
  };

  return (
    <div className="space-y-4">
      {/* Piano keyboard view for one octave */}
      <div className="bg-gray-900 p-4 rounded">
        <h4 className="text-sm font-medium mb-2">ピアノキーボード (C4-B4)</h4>
        <div className="relative h-20">
          {/* White keys */}
          {whiteKeys.map((keyOffset, index) => {
            const noteNumber = 60 + keyOffset; // C4 = 60
            const isActive = noteStates[noteNumber];
            return (
              <div
                key={`white-${keyOffset}`}
                className={`absolute h-full w-8 border border-gray-600 rounded-b transition-all duration-100 ${
                  isActive 
                    ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                    : 'bg-white'
                }`}
                style={{ left: `${index * 32}px` }}
                title={getNoteName(noteNumber)}
              />
            );
          })}
          
          {/* Black keys */}
          {blackKeys.map((keyOffset, index) => {
            const noteNumber = 60 + keyOffset; // C4 = 60
            const isActive = noteStates[noteNumber];
            const positions = [20, 52, 116, 148, 180]; // Positions for black keys
            return (
              <div
                key={`black-${keyOffset}`}
                className={`absolute h-12 w-5 rounded-b transition-all duration-100 z-10 ${
                  isActive 
                    ? 'bg-green-300 shadow-lg shadow-green-300/50' 
                    : 'bg-gray-800'
                }`}
                style={{ left: `${positions[index]}px` }}
                title={getNoteName(noteNumber)}
              />
            );
          })}
        </div>
      </div>

      {/* All notes grid */}
      <div className="bg-gray-900 p-4 rounded">
        <h4 className="text-sm font-medium mb-2">全ノート状態 (0-127)</h4>
        <div className="grid grid-cols-16 gap-1 max-h-32 overflow-y-auto">
          {Array.from({length: 128}, (_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded transition-all duration-200 ${
                noteStates[i] 
                  ? isBlackKey(i)
                    ? 'bg-purple-400 shadow-lg shadow-purple-400/50'
                    : 'bg-green-400 shadow-lg shadow-green-400/50'
                  : isBlackKey(i)
                    ? 'bg-gray-700'
                    : 'bg-gray-600'
              }`}
              title={`${getNoteName(i)} (${i})`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 