interface DrRushProps {
    mood: number;
}

export default function DrRush({ mood }: DrRushProps) {
    const getExpression = () => {
        if (mood >= 70) return '😊';
        if (mood >= 40) return '😐';
        return '😠';
    };

    return (
        <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-retro-brown border-4 border-retro-brown retro-shadow flex items-center justify-center text-6xl">
                {getExpression()}
            </div>
            <div className="mt-2 bg-retro-brown text-retro-beige px-4 py-1 border-2 border-black retro-shadow">
                <span className="font-bold">Dr. ラッシュ</span>
            </div>
        </div>
    );
}
