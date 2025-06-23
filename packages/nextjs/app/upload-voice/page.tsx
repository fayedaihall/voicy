"use client";

import { useState, useRef } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { uploadToIPFS } from "../../lib/ipfs";
import { callAIApi } from "../../lib/ai";
import { abi as VoiceRegistryABI } from "../../abis/VoiceRegistry.json";
import { MicrophoneIcon, StopIcon } from "@heroicons/react/24/outline";
import { getAddress } from "viem";

const VOICE_REGISTRY_CONTRACT_ADDRESS = getAddress("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");

const UploadVoice = () => {
    const { address } = useAccount();
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { writeContract } = useWriteContract();

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let randomnizedFilename = "recorded-voice-";
            for (let i = 0; i <= 3; i++) {
                randomnizedFilename += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            randomnizedFilename += ".webm";

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const file = new File([audioBlob], randomnizedFilename, { type: "audio/webm" });
                setAudioFile(file);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(10);

            // Update timer every second
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Auto-stop after 10 seconds
            setTimeout(stopRecording, 10000);
        } catch (error) {
            console.error("Error starting recording:", error);
            alert("Failed to access microphone. Please allow microphone access.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleUpload = async () => {
        if (!audioFile || !address) {
            alert("Please record a voice clip and connect your wallet.");
            return;
        }

        try {
            const ipfsHash = await uploadToIPFS(audioFile);
            // const modelId = await callAIApi(audioFile);
            const modelId = 1234; // Placeholder, replace with actual AI call
            await writeContract({
                address: VOICE_REGISTRY_CONTRACT_ADDRESS,
                abi: VoiceRegistryABI,
                functionName: "registerVoice",
                args: [ipfsHash, BigInt(modelId)],
            });
            alert("Voice uploaded and registered successfully!");
            setAudioFile(null); // Reset after upload
        } catch (error) {
            console.error("Error uploading voice:", error);
            alert("Failed to upload voice. Please try again.");
        }
    };

    return (
        <div className="flex items-center flex-col grow pt-10 px-5">
            <h1 className="text-center text-4xl font-bold mb-8">Upload Your Voice</h1>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-md rounded-3xl">
                {!address && <p className="text-red-500 mb-4">Please connect your wallet to upload a voice.</p>}
                <div className="mb-4">
                    {isRecording ? (
                        <div className="flex flex-col items-center">
                            <p className="text-lg font-medium mb-2">Recording: {recordingTime}s</p>
                            <button onClick={stopRecording} className="btn btn-error">
                                <StopIcon className="h-5 w-5 mr-2" />
                                Stop Recording
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={startRecording}
                            disabled={!address}
                            className="btn btn-secondary"
                        >
                            <MicrophoneIcon className="h-5 w-5 mr-2" />
                            Start 10s Recording
                        </button>
                    )}
                </div>
                {audioFile && (
                    <div className="mb-4">
                        <p className="text-sm">Recorded: {audioFile.name}</p>
                        <audio controls src={URL.createObjectURL(audioFile)} className="mt-2 w-full" />
                    </div>
                )}
                <button
                    onClick={handleUpload}
                    disabled={!audioFile || !address}
                    className="btn btn-primary"
                >
                    Upload and Register
                </button>
            </div>
        </div>
    );
};

export default UploadVoice;