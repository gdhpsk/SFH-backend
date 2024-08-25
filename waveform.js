/**
 * Function to convert audio ArrayBuffer to waveform data
 * @param {ArrayBuffer} arrayBuffer - The audio data in ArrayBuffer format
 * @param {number} samplesPerPixel - Number of samples per pixel for the waveform (controls resolution)
 * @returns {Promise<{waveform: string, duration: float}>} - Promise resolving to an array of normalized amplitudes, and the duration of the given song
 */
module.exports = async function arrayBufferToWaveform(arrayBuffer, samplesPerPixel = 1000) {
  try {
    const {default: audioDecode} = await import('audio-decode');
    // Decode audio data to AudioBuffer
    const audioBuffer = await audioDecode(arrayBuffer);
    const { length, numberOfChannels } = audioBuffer;
    const samplesCount = Math.ceil(length / samplesPerPixel);
    const waveform = []
    let intervals = Math.floor(samplesCount / 100)
    // Process data in chunks
    for (let i = 0; i < samplesCount; i += intervals) {
      const sampleIndex = i * samplesPerPixel;
      let sum = 0;

      // Sum across all channels
      for (let channel = 0; channel < numberOfChannels; channel++) {
        sum += Math.abs(audioBuffer.getChannelData(channel)[sampleIndex]);
      }

      // Average amplitude across channels
      waveform.push(sum / numberOfChannels);
    }
    // Normalize samples between 0 and 1
    const maxAmplitude = Math.max(...waveform);
    const normalizedWaveform = waveform.map(sample => (sample / maxAmplitude)*1000);
    return {
        waveform: Buffer.from(normalizedWaveform).toString("base64"),
        duration: audioBuffer.duration
    };
  } catch (error) {
    throw new Error(`Error processing waveform data: ${error.message}`);
  }
}