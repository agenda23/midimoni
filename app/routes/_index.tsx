import { useState, useEffect, useRef } from "react";
import type { MetaFunction } from "@remix-run/node";
import { MIDIVisualizer } from "~/components/MIDIVisualizer";
import { MessageLog } from "~/components/MessageLog";

export const meta: MetaFunction = () => {
  return [
    { title: "MIDI Monitor" },
    { name: "description", content: "MIDIコントローラ入力モニターアプリ" },
  ];
};

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

interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
}

export default function Index() {
  const [midiAccess, setMidiAccess] = useState<MIDIAccess | null>(null);
  const [devices, setDevices] = useState<MIDIDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [messages, setMessages] = useState<MIDIMessage[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [filterChannel, setFilterChannel] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [ccValues, setCcValues] = useState<{ [key: number]: number }>({});
  const [noteStates, setNoteStates] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      setIsSupported(false);
      return;
    }

    navigator.requestMIDIAccess({ sysex: false })
      .then((access) => {
        setMidiAccess(access);
        updateDevices(access);
        
        access.onstatechange = () => {
          updateDevices(access);
        };
      })
      .catch((error) => {
        console.error("MIDI access failed:", error);
        setIsSupported(false);
      });
  }, []);

  const updateDevices = (access: MIDIAccess) => {
    const deviceList: MIDIDevice[] = [];
    access.inputs.forEach((input: MIDIInput) => {
      deviceList.push({
        id: input.id!,
        name: input.name || "Unknown Device",
        manufacturer: input.manufacturer || "Unknown",
        state: input.state || "connected"
      });
    });
    setDevices(deviceList);
  };

  const handleMIDIMessage = (event: MIDIMessageEvent) => {
    if (!event.data) return;
    
    const [status, data1, data2] = event.data;
    const channel = (status & 0x0F) + 1;
    const messageType = status & 0xF0;
    
    let type = "Unknown";
    let note: number | undefined;
    let velocity: number | undefined;
    let controller: number | undefined;
    let value: number | undefined;
    let program: number | undefined;

    switch (messageType) {
      case 0x80:
        type = "Note Off";
        note = data1;
        velocity = data2;
        setNoteStates(prev => ({ ...prev, [data1]: false }));
        break;
      case 0x90:
        type = data2 > 0 ? "Note On" : "Note Off";
        note = data1;
        velocity = data2;
        setNoteStates(prev => ({ ...prev, [data1]: data2 > 0 }));
        break;
      case 0xB0:
        type = "Control Change";
        controller = data1;
        value = data2;
        setCcValues(prev => ({ ...prev, [data1]: data2 }));
        break;
      case 0xC0:
        type = "Program Change";
        program = data1;
        break;
      case 0xE0:
        type = "Pitch Bend";
        value = (data2 << 7) | data1;
        break;
    }

    const message: MIDIMessage = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: event.timeStamp || Date.now(),
      port: event.target?.name || "Unknown",
      channel,
      type,
      data: Array.from(event.data),
      note,
      velocity,
      controller,
      value,
      program
    };

    setMessages(prev => [...prev, message]);
  };

  useEffect(() => {
    if (!midiAccess || !selectedDevice) return;

    const input = midiAccess.inputs.get(selectedDevice);
    if (input) {
      input.onmidimessage = handleMIDIMessage;
      return () => {
        input.onmidimessage = null;
      };
    }
  }, [midiAccess, selectedDevice]);



  const filteredMessages = messages.filter(msg => {
    if (filterChannel && msg.channel !== filterChannel) return false;
    if (filterType && msg.type !== filterType) return false;
    return true;
  });

  const exportLogs = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `midi-log-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearLogs = () => {
    setMessages([]);
    setCcValues({});
    setNoteStates({});
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">MIDI Monitor</h1>
          <p className="text-red-400">このブラウザはWebMIDI APIをサポートしていません。</p>
          <p className="text-gray-400 mt-2">Chrome、Edge、またはOperaをご使用ください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            MIDI Monitor
          </h1>
          
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">デバイス:</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
              >
                <option value="">デバイスを選択</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.manufacturer})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">チャンネル:</label>
              <select
                value={filterChannel || ""}
                onChange={(e) => setFilterChannel(e.target.value ? parseInt(e.target.value) : null)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
              >
                <option value="">全て</option>
                {Array.from({length: 16}, (_, i) => (
                  <option key={i + 1} value={i + 1}>Ch {i + 1}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">タイプ:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm"
              >
                <option value="">全て</option>
                <option value="Note On">Note On</option>
                <option value="Note Off">Note Off</option>
                <option value="Control Change">Control Change</option>
                <option value="Program Change">Program Change</option>
                <option value="Pitch Bend">Pitch Bend</option>
              </select>
            </div>

            <button
              onClick={exportLogs}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-sm font-medium transition-colors"
            >
              ログ出力
            </button>

            <button
              onClick={clearLogs}
              className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm font-medium transition-colors"
            >
              クリア
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MIDIVisualizer ccValues={ccValues} noteStates={noteStates} />
          <MessageLog messages={messages} filteredMessages={filteredMessages} />
        </div>
      </div>
    </div>
  );
}
