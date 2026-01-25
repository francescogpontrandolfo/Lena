// Voice Input Service - Audio recording with Mistral AI transcription

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface VoiceInputResult {
  text: string;
  confidence: number;
}

// Mistral API configuration from environment variables
const MISTRAL_API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY || '';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/audio/transcriptions';

/**
 * Request microphone permissions
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to request microphone permission:', error);
    return false;
  }
}

/**
 * Start voice recording and return audio file URI
 */
export async function startVoiceRecording(): Promise<Audio.Recording | null> {
  try {
    // Check permissions first
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      throw new Error('Microphone permission denied');
    }

    // Configure audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create recording
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    return recording;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return null;
  }
}

/**
 * Stop voice recording and get the audio file URI
 */
export async function stopVoiceRecording(recording: Audio.Recording): Promise<string | null> {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return uri;
  } catch (error) {
    console.error('Failed to stop recording:', error);
    return null;
  }
}

/**
 * Transcribe audio file using Mistral API
 */
export async function transcribeAudioWithMistral(audioUri: string): Promise<VoiceInputResult | null> {
  try {
    if (!MISTRAL_API_KEY) {
      console.warn('Mistral API key not configured. Using mock transcription.');
      // For testing without API key
      return {
        text: 'Mock transcription - Add your Mistral API key to enable real transcription',
        confidence: 0.9,
      };
    }

    // Read audio file as base64
    const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model', 'whisper-large-v3');

    // Call Mistral API
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      text: data.text || '',
      confidence: 0.95, // Mistral doesn't return confidence, use default
    };
  } catch (error) {
    console.error('Transcription failed:', error);
    return null;
  }
}

/**
 * Complete voice input flow: record, stop, and transcribe
 */
export async function recordAndTranscribe(): Promise<VoiceInputResult | null> {
  let recording: Audio.Recording | null = null;

  try {
    // Start recording
    recording = await startVoiceRecording();
    if (!recording) {
      throw new Error('Failed to start recording');
    }

    // Wait for user to stop (this will be controlled by the UI)
    // Return the recording object so UI can control when to stop
    return null;
  } catch (error) {
    console.error('Voice input failed:', error);
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    return null;
  }
}

/**
 * Clean up audio file after transcription
 */
export async function cleanupAudioFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.error('Failed to delete audio file:', error);
  }
}
