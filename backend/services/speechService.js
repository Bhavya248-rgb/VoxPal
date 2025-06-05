import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY;
const ASSEMBLY_API_URL = 'https://api.assemblyai.com/v2';

export const convertSpeechToText = async (audioBuffer) => {
  try {
    console.log('Starting speech to text conversion');
    console.log('Audio buffer size:', audioBuffer.length, 'bytes');

    if (!ASSEMBLY_API_KEY) {
      throw new Error('ASSEMBLY_API_KEY is not configured in environment variables');
    }

    // First, upload the audio file
    console.log('Uploading audio to AssemblyAI...');
    const uploadResponse = await fetch(`${ASSEMBLY_API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLY_API_KEY
      },
      body: audioBuffer
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: errorText
      });
      throw new Error(`Failed to upload audio file: ${uploadResponse.status} ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('Upload successful, got upload_url:', uploadData.upload_url);
    const audioUrl = uploadData.upload_url;

    // Create transcription request
    console.log('Starting transcription...');
    const transcriptResponse = await fetch(`${ASSEMBLY_API_URL}/transcript`, {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: 'en'
      })
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error('Transcription request failed:', {
        status: transcriptResponse.status,
        statusText: transcriptResponse.statusText,
        error: errorText
      });
      throw new Error(`Failed to start transcription: ${transcriptResponse.status} ${errorText}`);
    }

    const transcriptData = await transcriptResponse.json();
    console.log('Transcription started with ID:', transcriptData.id);
    const transcriptId = transcriptData.id;

    // Poll for transcription completion
    console.log('Polling for transcription completion...');
    let transcript;
    for (let i = 0; i < 30; i++) {
      console.log(`Polling attempt ${i + 1}/30...`);
      const pollingResponse = await fetch(`${ASSEMBLY_API_URL}/transcript/${transcriptId}`, {
        headers: {
          'Authorization': ASSEMBLY_API_KEY
        }
      });

      if (!pollingResponse.ok) {
        const errorText = await pollingResponse.text();
        console.error('Polling failed:', {
          status: pollingResponse.status,
          statusText: pollingResponse.statusText,
          error: errorText
        });
        throw new Error(`Failed to get transcription status: ${pollingResponse.status} ${errorText}`);
      }

      const pollingData = await pollingResponse.json();
      console.log('Polling status:', pollingData.status);

      if (pollingData.status === 'completed') {
        transcript = pollingData.text;
        console.log('Transcription completed successfully');
        break;
      } else if (pollingData.status === 'error') {
        console.error('Transcription error:', pollingData.error);
        throw new Error('Transcription failed: ' + pollingData.error);
      }

      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!transcript) {
      throw new Error('Transcription timed out after 30 seconds');
    }

    return transcript;
  } catch (error) {
    console.error('Error in speech to text conversion:', error);
    throw error;
  }
}; 