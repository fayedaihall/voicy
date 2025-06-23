"use client";

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { abi as SubscriptionManagerABI } from '../../abis/SubscriptionManager.json';
import { abi as PaymentSplitterABI } from '../../abis/PaymentSplitter.json';
import { abi as VoiceRegistryABI } from '../../abis/VoiceRegistry.json';
// import { generateTTS } from '../lib/ai';
import { getAddress } from "viem";

const VOICE_REGISTRY_CONTRACT_ADDRESS = getAddress("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
const MOCK_USDC_CONTRACT_ADDRESS = getAddress("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
const SUBSCRIPTION_MANAGER_CONTRACT_ADDRESS = getAddress("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
const PAYMENT_SPLITTER_CONTRACT_ADDRESS = getAddress("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");

export default function Voices() {
    const { address } = useAccount();
    const [text, setText] = useState('');
    const [selectedVoiceId, setSelectedVoiceId] = useState<number | null>(null);

    const { data: isSubscribed } = useReadContract({
        address: SUBSCRIPTION_MANAGER_CONTRACT_ADDRESS,
        abi: SubscriptionManagerABI,
        functionName: 'isSubscribed',
        args: [address],
    });

    const { writeContract } = useWriteContract();

    const { data: voices } = useReadContract({
        address: VOICE_REGISTRY_CONTRACT_ADDRESS,
        abi: VoiceRegistryABI,
        functionName: 'voiceCount',
    });

    const handleSubscribe = async () => {
        try {
            await writeContract({
                address: SUBSCRIPTION_MANAGER_CONTRACT_ADDRESS,
                abi: SubscriptionManagerABI,
                functionName: "subscribe",
            });
        } catch (error) {
            console.error("Error subscribing:", error);
            alert("Failed to subscribe. Please try again.");
        }
    };

    const handleUseVoice = async (voiceId: number) => {
        try {
            await writeContract({
                address: PAYMENT_SPLITTER_CONTRACT_ADDRESS,
                abi: PaymentSplitterABI,
                functionName: "useVoice",
                args: [voiceId],
            });
        } catch (error) {
            console.error("Error using voice:", error);
            alert("Failed to use voice. Please try again.");
        }
    };

    const handleGenerate = async () => {
        if (!isSubscribed) {
            await handleSubscribe();
            return;
        }
        if (selectedVoiceId && text) {
            await handleUseVoice(selectedVoiceId);
            // const audioUrl = await generateTTS(text, selectedVoiceId);
            const audioUrl = "https://example.com";
            // Play or download audio
            const audio = new Audio(audioUrl);
            audio.play();
        }
    };

    return (
        <div className="flex items-center flex-col grow pt-10 px-5">
            <h1 className="text-center text-4xl font-bold mb-8">Browse Voices</h1>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-md rounded-3xl">
                {!address && <p className="text-red-500 mb-4">Please connect your wallet to browse voices.</p>}
                {!isSubscribed && (
                    <button onClick={handleSubscribe} className="btn btn-primary mb-4">
                        Subscribe ($5 USDC/month)
                    </button>
                )}
                <select
                    onChange={(e) => setSelectedVoiceId(Number(e.target.value))}
                    className="select select-bordered w-full mb-4"
                    disabled={!isSubscribed || !address}
                >
                    <option value="" disabled selected>
                        Select a voice
                    </option>
                    {Array.from({ length: Number(voices) || 0 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            Voice #{i + 1}
                        </option>
                    ))}
                </select>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text for text-to-speech"
                    className="textarea textarea-bordered w-full mb-4"
                    disabled={!isSubscribed || !address}
                />
                <button
                    onClick={handleGenerate}
                    disabled={!isSubscribed || !selectedVoiceId || !text || !address}
                    className="btn btn-primary"
                >
                    Generate Audio
                </button>
            </div>
        </div>
    );
}