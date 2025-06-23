"use client";

import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { abi as SubscriptionManagerABI } from '../../abis/SubscriptionManager.json';
import { abi as PaymentSplitterABI } from '../../abis/PaymentSplitter.json';
import { abi as VoiceRegistryABI } from '../../abis/VoiceRegistry.json';
// import { generateTTS } from '../lib/ai';
import { getAddress } from "viem";
// import { callAIApi } from "../../lib/ai";
import React, { useState, useEffect } from 'react';
import axios from 'axios';



const VOICE_REGISTRY_CONTRACT_ADDRESS = getAddress("0xd053239A91E31a1B11c23688a6f9eA5A71f931A8");
const SUBSCRIPTION_MANAGER_CONTRACT_ADDRESS = getAddress("0xc0c38481cBD93418cA5e0F1Fb1BD1afc1255D150");
const PAYMENT_SPLITTER_CONTRACT_ADDRESS = getAddress("0x4c4066452B8bD54423F5991707415d5260FE999f");

export default function Voices() {
    const [text, setText] = useState<string>(''); // Text area input
    const [stringInput, setStringInput] = useState<string>(''); // Input for new strings
    const [selectedString, setSelectedString] = useState<string>(''); // Selected dropdown value
    const [strings, setStrings] = useState<string[]>([]); // List of strings for dropdown
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // Fetch strings on mount
    useEffect(() => {
        const fetchStrings = async () => {
            try {
                const response = await axios.get('/api/cids');
                setStrings(response.data.strings);
                if (response.data.strings.length > 0) {
                    setSelectedString(response.data.strings[0]);
                }
            } catch (err) {
                setError('Failed to load strings');
                console.error('Error:', err);
            }
        };
        fetchStrings();
    }, []);

    // Handle text area change
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    // Handle string input change
    const handleStringInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStringInput(e.target.value);
    };

    // Handle dropdown change
    const handleStringSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedString(e.target.value);
    };

    // Add new string
    const handleAddString = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedString = stringInput.trim();
        if (!trimmedString) {
            setError('Please enter a valid string');
            return;
        }

        try {
            await axios.post('/api/cids', { string: trimmedString });
            setStrings([...strings, trimmedString]);
            setStringInput('');
            setSelectedString(trimmedString);
        } catch (err) {
            setError('Failed to add string');
            console.error('Error:', err);
        }
    };

    // Handle text-to-MP3 submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) {
            setError('Please enter some text');
            return;
        }
        if (!selectedString) {
            setError('Please select a voice ID');
            return;
        }

        setLoading(true);
        setError(null);
        setAudioUrl(null);

        try {
            const response = await axios.post(
                'https://chloe-audiogen.hf.space/api/voice-transfer', // Replace with your API
                {
                    text,
                    cid: selectedString
                },
                {
                    responseType: 'arraybuffer',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const mp3Blob = new Blob([response.data], { type: 'audio/mpeg' });
            const contentType = response.headers['content-type'];
            if (contentType !== 'audio/mpeg' && contentType !== 'audio/mp3') {
                console.warn(`Unexpected Content-Type: ${contentType}`);
            }

            const url = URL.createObjectURL(mp3Blob);
            setAudioUrl(url);
        } catch (err) {
            setError('Failed to fetch MP3');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle download
    const handleDownload = () => {
        if (audioUrl && selectedString) {
            const link = document.createElement('a');
            link.href = audioUrl;
            // Sanitize selectedString for filename
            const safeString = selectedString.replace(/[^a-zA-Z0-9-_]/g, '_');
            link.download = `audio_${safeString}.mp3`;
            link.click();
        }
    };

    // Clean up URL
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Choose a voice:</h1>

            {/* Dropdown for strings */}
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="stringSelect">Select Voice ID:</label>
                <select
                    id="stringSelect"
                    value={selectedString}
                    onChange={handleStringSelect}
                    style={{ marginLeft: '10px' }}
                    disabled={strings.length === 0}
                >
                    {strings.length === 0 ? (
                        <option value="">No voice IDs available</option>
                    ) : (
                        strings.map(str => (
                            <option key={str} value={str}>
                                {str}
                            </option>
                        ))
                    )}
                </select>
            </div>

            {/* Text-to-MP3 form */}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="textInput">Enter Text:</label>
                    <br />
                    <textarea
                        id="textInput"
                        value={text}
                        onChange={handleTextChange}
                        rows={5}
                        cols={50}
                        placeholder="Type your text here..."
                        style={{ width: '100%', marginBottom: '10px' }}
                    />
                </div>
                <button type="submit" disabled={loading || !selectedString}>
                    {loading ? 'Processing...' : 'Generate MP3'}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {audioUrl && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Generated Audio (Voice ID: {selectedString})</h3>
                    <audio controls src={audioUrl} />
                    <br />
                    <button onClick={handleDownload} style={{ marginTop: '10px' }}>
                        Download MP3
                    </button>
                </div>
            )}
        </div>
    );
};