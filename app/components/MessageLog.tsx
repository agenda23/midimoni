import { useEffect, useRef } from "react";

interface MIDIMessage {
  id: string;
  timestamp: number;
  port: string;
  channel: number;
  type: string;
  data: number[];
  note?: number;
  velocity?: number;
  controller?: number;
  value?: number;
  program?: number;
}

interface MessageLogProps {
  messages: MIDIMessage[];
  filteredMessages: MIDIMessage[];
}

export function MessageLog({ messages, filteredMessages }: MessageLogProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "Note On":
        return "text-green-400";
      case "Note Off":
        return "text-red-400";
      case "Control Change":
        return "text-blue-400";
      case "Program Change":
        return "text-purple-400";
      case "Pitch Bend":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "Note On":
        return "🎵";
      case "Note Off":
        return "🔇";
      case "Control Change":
        return "🎛️";
      case "Program Change":
        return "🎹";
      case "Pitch Bend":
        return "🎚️";
      default:
        return "📡";
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          メッセージログ
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-400">
            表示中: {filteredMessages.length}
          </span>
          <span className="text-gray-400">
            総計: {messages.length}
          </span>
        </div>
      </div>
      
      <div className="h-96 overflow-y-auto bg-gray-900 rounded p-4 font-mono text-sm">
        {filteredMessages.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <div className="text-4xl mb-2">🎹</div>
            <div>MIDIデバイスを選択してメッセージを受信してください</div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((msg, index) => (
              <MessageItem 
                key={msg.id} 
                message={msg} 
                isLatest={index === filteredMessages.length - 1}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

interface MessageItemProps {
  message: MIDIMessage;
  isLatest: boolean;
}

function MessageItem({ message, isLatest }: MessageItemProps) {
  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "Note On":
        return "text-green-400";
      case "Note Off":
        return "text-red-400";
      case "Control Change":
        return "text-blue-400";
      case "Program Change":
        return "text-purple-400";
      case "Pitch Bend":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "Note On":
        return "🎵";
      case "Note Off":
        return "🔇";
      case "Control Change":
        return "🎛️";
      case "Program Change":
        return "🎹";
      case "Pitch Bend":
        return "🎚️";
      default:
        return "📡";
    }
  };

  const getNoteName = (noteNumber: number) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(noteNumber / 12) - 1;
    const note = noteNames[noteNumber % 12];
    return `${note}${octave}`;
  };

  return (
    <div className={`p-3 rounded transition-all duration-300 ${
      isLatest 
        ? 'bg-gray-700 border-l-4 border-blue-400 shadow-lg' 
        : 'bg-gray-800 hover:bg-gray-750'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getMessageIcon(message.type)}</span>
          <span className={`font-semibold ${getMessageTypeColor(message.type)}`}>
            {message.type}
          </span>
        </div>
        <span className="text-gray-400 text-xs">
          {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 3
          })}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-gray-300">
            <span className="text-yellow-400 font-medium">Ch{message.channel}</span>
            <span className="text-gray-500 ml-2">({message.port})</span>
          </div>
          
          {message.note !== undefined && (
            <div className="text-gray-300">
              <span className="text-gray-400">Note:</span>
              <span className="ml-1 font-medium">{getNoteName(message.note)} ({message.note})</span>
            </div>
          )}
          
          {message.velocity !== undefined && (
            <div className="text-gray-300">
              <span className="text-gray-400">Velocity:</span>
              <span className="ml-1 font-medium">{message.velocity}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          {message.controller !== undefined && (
            <div className="text-gray-300">
              <span className="text-gray-400">CC:</span>
              <span className="ml-1 font-medium">{message.controller}</span>
            </div>
          )}
          
          {message.value !== undefined && (
            <div className="text-gray-300">
              <span className="text-gray-400">Value:</span>
              <span className="ml-1 font-medium">{message.value}</span>
            </div>
          )}
          
          {message.program !== undefined && (
            <div className="text-gray-300">
              <span className="text-gray-400">Program:</span>
              <span className="ml-1 font-medium">{message.program}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-2 font-mono">
        Raw: [{message.data.map(d => d.toString(16).padStart(2, '0').toUpperCase()).join(' ')}]
      </div>
    </div>
  );
} 