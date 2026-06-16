interface Message {
    sender: 'user' | 'doctor';
    text: string;
}

interface DialogueWindowProps {
    messages: Message[];
    currentTranscript?: string;
}

export default function DialogueWindow({ messages, currentTranscript }: DialogueWindowProps) {
    return (
        <div className="bg-black/80 border-4 border-retro-brown p-4 retro-shadow h-48 overflow-y-auto">
            <div className="space-y-3">
                {messages.map((msg, idx) => (
                    <div key={idx} className="text-retro-beige">
                        <span className="font-bold text-yellow-400">
                            {msg.sender === 'user' ? '看護師：' : 'Dr.ラッシュ：'}
                        </span>
                        <span className="ml-2">{msg.text}</span>
                    </div>
                ))}
                {currentTranscript && (
                    <div className="text-retro-beige animate-pulse">
                        <span className="font-bold text-yellow-400">看護師：</span>
                        <span className="ml-2">{currentTranscript}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
