// src/engine/masteringLogic.js

export const applyMastering = async (audioBuffer, style) => {
    // 1. Initialize the Context
    const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
    );

    // 2. Define the Nodes (The "Pedals")
    const source = offlineCtx.createBufferSource();
    const eq = offlineCtx.createBiquadFilter();
    const compressor = offlineCtx.createDynamicsCompressor(); // General "Glue"
    const makeupGain = offlineCtx.createGain();               // Volume Boost
    const limiter = offlineCtx.createDynamicsCompressor();    // The Brick Wall

    // Set the source data
    source.buffer = audioBuffer;

    // 3. Configure the Limiter (The "Ceiling")
    limiter.threshold.setValueAtTime(-0.5, offlineCtx.currentTime);
    limiter.knee.setValueAtTime(0, offlineCtx.currentTime);
    limiter.ratio.setValueAtTime(20, offlineCtx.currentTime);
    limiter.attack.setValueAtTime(0.003, offlineCtx.currentTime);
    limiter.release.setValueAtTime(0.15, offlineCtx.currentTime);

    // 4. Style Logic (Setting the EQ and Drive)
    if (style === 'Cinematic') {
        eq.type = 'highshelf';
        eq.frequency.value = 10000;
        eq.gain.value = 3; 
        makeupGain.gain.setValueAtTime(1.5, offlineCtx.currentTime); // Gentle boost
    } else if (style === 'Indie') {
        eq.type = 'peaking';
        eq.frequency.value = 2500;
        eq.gain.value = 2;
        makeupGain.gain.setValueAtTime(2.5, offlineCtx.currentTime); // Driving it harder
    } else {
        // Moderate/Default
        eq.type = 'allpass'; // Does nothing to the tone
        makeupGain.gain.setValueAtTime(1.2, offlineCtx.currentTime);
    }

    // 5. Connect the Chain (The Signal Path)
    // Audio flow: Source -> EQ -> Compressor -> Makeup -> Limiter -> Output
    source.connect(eq);
    eq.connect(compressor);
    compressor.connect(makeupGain);
    makeupGain.connect(limiter);
    limiter.connect(offlineCtx.destination);

    // 6. Run the Render
    source.start(0);
    return await offlineCtx.startRendering();
};