import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const WAKE_WORD = "hey turtle";
const COMMANDS = {
  MOVE: {
    examples: ["move forward", "move left", "move to position one"],
    description: "Controls robot movement in different directions or to specific positions"
  },
  GRAB: {
    examples: ["grab item", "grab from bin", "grab the red block"],
    description: "Commands the robot to pick up items"
  },
  PLACE: {
    examples: ["place here", "place in bin", "place on conveyor"],
    description: "Commands the robot to place held items"
  },
  STOP: {
    examples: ["stop now", "stop moving", "emergency stop"],
    description: "Immediately stops all robot operations"
  },
  HOME: {
    examples: ["go home", "return home", "home position"],
    description: "Returns the robot to its home position"
  }
};

export function Dashboard() {
  // ... existing state and hooks ...
  const status = useQuery(api.robotCommands.getRobotStatus);
  const recentCommands = useQuery(api.robotCommands.getRecentCommands);
  const sendCommand = useMutation(api.robotCommands.sendCommand);
  const initStatus = useMutation(api.robotCommands.initRobotStatus);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ... existing useEffect and handlers ...
  useEffect(() => {
    initStatus();
  }, [initStatus]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    recognitionRef.current = new (window as any).webkitSpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening for 'Hey Turtle'");
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!isProcessing) {
        recognition.start();
      }
    };

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase();
      setTranscript(command);
      
      if (event.results[last].isFinal) {
        if (!isProcessing && command.includes(WAKE_WORD)) {
          handleWakeWord();
        } else if (isProcessing) {
          handleVoiceCommand(command);
        }
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [isProcessing]);

  const handleWakeWord = () => {
    setIsProcessing(true);
    toast.success("Hey! I'm listening for your command");
    recognitionRef.current.stop();
    setTimeout(() => {
      setTranscript("");
      recognitionRef.current.start();
    }, 100);
    
    setTimeout(() => {
      if (isProcessing) {
        setIsProcessing(false);
        toast.error("No command received");
        setTranscript("");
      }
    }, 5000);
  };

  const handleVoiceCommand = async (command: string) => {
    setIsProcessing(false);
    setLastCommand(command);
    
    const normalized = command.toLowerCase();
    let commandType = null;
    
    if (normalized.includes("move")) {
      commandType = "MOVE";
    } else if (normalized.includes("grab")) {
      commandType = "GRAB";
    } else if (normalized.includes("place")) {
      commandType = "PLACE";
    } else if (normalized.includes("stop")) {
      commandType = "STOP";
    } else if (normalized.includes("home")) {
      commandType = "HOME";
    }

    if (commandType) {
      toast.success(`Executing: ${commandType}`);
      await sendCommand({
        type: commandType,
        payload: { command: normalized }
      });
    } else {
      toast.error("Command not recognized");
    }

    setTranscript("");
    recognitionRef.current.stop();
    setTimeout(() => recognitionRef.current.start(), 100);
  };

  const handleManualCommand = async (type: string) => {
    toast.success(`Executing manual command: ${type}`);
    await sendCommand({
      type,
      payload: { manual: true }
    });
  };

  if (!status) {
    return <div className="flex items-center justify-center h-screen">
      <div className="futuristic-panel p-8 floating-panel">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-blue-400">Initializing Systems...</p>
      </div>
    </div>;
  }

  return (
    <div className="cyber-grid min-h-screen p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="futuristic-panel p-6 floating-panel">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">System Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                <span className="text-blue-300">Connection:</span>
                <div className="flex items-center gap-2">
                  <span className={status.isConnected ? "text-green-400" : "text-red-400"}>
                    {status.isConnected ? "Connected" : "Disconnected"}
                  </span>
                  <div className={`status-indicator ${status.isConnected ? 'active' : 'inactive'}`}></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                <span className="text-blue-300">State:</span>
                <span className="text-white">{status.state}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg">
                <span className="text-blue-300">Battery:</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                      style={{ width: `${status.battery}%` }}
                    ></div>
                  </div>
                  <span className="text-white">{status.battery}%</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-blue-300 mb-2">Position Matrix:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['X', 'Y', 'Z'].map((axis) => (
                    <div key={axis} className="bg-slate-800/50 p-3 rounded-lg text-center">
                      <span className="text-blue-400 block text-sm">{axis}-Axis</span>
                      <span className="text-white font-mono">
                        {status.position[axis.toLowerCase() as 'x' | 'y' | 'z'].toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="futuristic-panel p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Decision Matrix</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-blue-500/30">
                <h3 className="font-semibold text-blue-300 mb-2">Current Operation:</h3>
                <p className="text-lg text-white">{status.currentDecision || "Awaiting Command Input"}</p>
                <h3 className="font-semibold text-blue-300 mt-4 mb-2">Logic Path:</h3>
                <p className="text-gray-400">{status.currentReason || "No active processes"}</p>
              </div>
            </div>
          </div>

          <div className="futuristic-panel p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Voice Interface</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`status-indicator ${isListening ? 'active' : 'inactive'}`}></div>
                  <span className="text-white font-semibold">
                    {isListening ? (isProcessing ? 'Processing Command Input...' : 'Monitoring for "Hey Turtle"...') : 'Voice Interface Offline'}
                  </span>
                </div>
                <p className="text-sm text-blue-300 mb-2">Input Stream: {transcript || "No audio detected"}</p>
                <p className="text-sm text-blue-300">Last Command: {lastCommand || "No command history"}</p>
              </div>
            </div>
          </div>

          <div className="futuristic-panel p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Command History</h2>
            <div className="space-y-4">
              {recentCommands?.map((command) => (
                <div key={command._id} className="p-4 bg-slate-800/50 rounded-lg border border-blue-500/30 flex items-start gap-3">
                  <span className={`text-2xl ${command.success ? "text-green-400" : "text-red-400"}`}>
                    {command.success ? "✓" : "✗"}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{command.type}</p>
                    <p className="text-sm text-blue-300">{command.reason}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(command.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="futuristic-panel p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Manual Override Controls</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleManualCommand("HOME")}
                className="futuristic-button p-3"
              >
                Return to Base
              </button>
              <button
                onClick={() => handleManualCommand("STOP")}
                className="futuristic-button p-3"
                style={{ background: 'linear-gradient(45deg, rgba(239, 68, 68, 0.8), rgba(185, 28, 28, 0.8))' }}
              >
                Emergency Override
              </button>
              <button
                onClick={() => handleManualCommand("CALIBRATE")}
                className="futuristic-button p-3"
                style={{ background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.8), rgba(21, 128, 61, 0.8))' }}
              >
                System Calibration
              </button>
              <button
                onClick={() => handleManualCommand("RESET")}
                className="futuristic-button p-3"
                style={{ background: 'linear-gradient(45deg, rgba(234, 179, 8, 0.8), rgba(161, 98, 7, 0.8))' }}
              >
                Reset Protocols
              </button>
              <button
                onClick={() => setShowExplanation(true)}
                className="futuristic-button p-3 col-span-2"
                style={{ background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.8), rgba(107, 33, 168, 0.8))' }}
              >
                Analysis Mode
              </button>
            </div>
          </div>

          <div className="futuristic-panel p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Navigation Interface</h2>
            <div className="p-4 bg-slate-800/50 rounded-lg text-center border border-blue-500/30">
              <p className="text-blue-300">Holographic Map Loading...</p>
              <p className="text-sm text-gray-400 mt-2">
                3D environment mapping and navigation overlay in development.
              </p>
            </div>
          </div>

          <div className="futuristic-panel p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Voice Command Matrix</h2>
            <div className="space-y-4">
              <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-blue-500/30">
                <p className="text-sm text-blue-300 mb-2">
                  Activate with <span className="font-bold text-white">"Hey Turtle"</span>
                </p>
              </div>
              {Object.entries(COMMANDS).map(([command, info]) => (
                <div key={command} className="p-4 bg-slate-800/50 rounded-lg border border-blue-500/30">
                  <h3 className="font-semibold text-lg text-white mb-2">{command}</h3>
                  <p className="text-sm text-blue-300 mb-2">{info.description}</p>
                  <div className="text-sm">
                    <span className="text-gray-400">Command Syntax: </span>
                    <span className="text-blue-300">{info.examples.join(" | ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showExplanation && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="futuristic-panel p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Operation Analysis</h3>
            <p className="text-lg mb-2 text-white">{status.currentDecision || "No active operation"}</p>
            <p className="text-blue-300 mb-4">{status.currentReason || "No analysis available"}</p>
            <button
              onClick={() => setShowExplanation(false)}
              className="futuristic-button w-full p-3"
            >
              Close Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
