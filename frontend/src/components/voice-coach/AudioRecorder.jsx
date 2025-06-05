import React, { useRef, useState } from 'react';

const AudioRecorder = ({ onRecordingComplete, onConversionStart }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    sampleRate: 16000
                } 
            });
            
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
                audioBitsPerSecond: 128000
            });
            
            chunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(blob);
                setRecordedAudioUrl(audioUrl);
                onRecordingComplete(audioUrl);
                console.log('Recording stopped, blob size:', blob.size, 'bytes');
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            onConversionStart();
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Error accessing microphone. Please check your permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="space-y-4">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded-lg font-semibold ${
                    isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
            >
                {isRecording ? 'Stop Recording' : 'Record Speech'}
            </button>

            {recordedAudioUrl && (
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Your Recording</h3>
                    <audio src={recordedAudioUrl} controls className="w-full" />
                </div>
            )}
        </div>
    );
};

export default AudioRecorder; 