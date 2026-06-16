interface MoodGaugeProps {
    mood: number; // 0-100
}

export default function MoodGauge({ mood }: MoodGaugeProps) {
    const getColor = () => {
        if (mood >= 70) return 'bg-green-500';
        if (mood >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-retro-brown">機嫌</span>
                <span className="text-sm text-retro-brown font-bold">{mood}/100</span>
            </div>
            <div className="w-full h-6 bg-gray-300 border-2 border-retro-brown relative overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${getColor()}`}
                    style={{ width: `${mood}%` }}
                />
                {/* Pixel art style segments */}
                <div className="absolute inset-0 flex">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 border-r border-retro-brown/20"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
