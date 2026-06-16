export default function PatientInfo() {
    return (
        <div className="bg-retro-beige border-4 border-retro-brown p-4 retro-shadow h-full">
            <h3 className="text-lg font-bold text-retro-brown mb-3 border-b-2 border-retro-brown pb-1">
                患者情報
            </h3>
            <div className="space-y-2 text-sm">
                <div>
                    <span className="text-retro-brown/70">氏名：</span>
                    <span className="font-bold">山田 太郎</span>
                </div>
                <div>
                    <span className="text-retro-brown/70">年齢：</span>
                    <span className="font-bold">65歳</span>
                </div>
                <div>
                    <span className="text-retro-brown/70">性別：</span>
                    <span className="font-bold">男性</span>
                </div>
                <div>
                    <span className="text-retro-brown/70">診断：</span>
                    <span className="font-bold">急性腹症</span>
                </div>
                <div className="pt-2 border-t-2 border-retro-brown/30">
                    <span className="text-retro-brown/70">バイタル：</span>
                </div>
                <div className="pl-2 space-y-1">
                    <div>BP: 140/90 mmHg</div>
                    <div>HR: 95 bpm</div>
                    <div>BT: 38.2°C</div>
                    <div>SpO2: 96%</div>
                </div>
            </div>
        </div>
    );
}
