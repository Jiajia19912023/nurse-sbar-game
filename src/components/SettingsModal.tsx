import { useState, useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onSaveApiKey: (key: string) => void;
}

export default function SettingsModal({ isOpen, onClose, apiKey, onSaveApiKey }: SettingsModalProps) {
    const [inputKey, setInputKey] = useState(apiKey);

    useEffect(() => {
        setInputKey(apiKey);
    }, [apiKey]);

    const handleSave = () => {
        onSaveApiKey(inputKey);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-retro-beige border-4 border-retro-brown retro-shadow p-6 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-retro-brown mb-4 border-b-2 border-retro-brown pb-2">
                    設定
                </h2>

                <div className="mb-4">
                    <label className="block text-retro-brown font-bold mb-2">
                        Gemini APIキー
                    </label>
                    <input
                        type="password"
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-retro-brown bg-white font-mono text-sm"
                        placeholder="AIzaSy..."
                    />
                    <p className="text-xs text-retro-brown/70 mt-1">
                        ※ APIキーはブラウザのlocalStorageに保存されます
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-retro-brown text-retro-beige px-4 py-2 border-2 border-black retro-shadow hover:bg-retro-brown/80 transition-colors font-bold"
                    >
                        保存
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-400 text-white px-4 py-2 border-2 border-black retro-shadow hover:bg-gray-500 transition-colors font-bold"
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
}
