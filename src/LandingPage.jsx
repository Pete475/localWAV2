import { useState } from 'react';
import { applyMastering } from './engine/masteringLogic';
import { bufferToWav } from './engine/wavEncoder';
import { FileDrop } from './components/dragAndDrop';

function LandingPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('fileSelected');
    }
  };

  const masterTrack = async (style) => {
    if (!file) return;
    setStatus('processing');

    try {
      const audioCtx = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // 1. Run the Engine
      const masteredBuffer = await applyMastering(decodedBuffer, style);

      // 2. Convert to WAV Blob
      const wavBlob = bufferToWav(masteredBuffer);

      // 3. Trigger Download
      const url = URL.createObjectURL(wavBlob);
      const anchor = document.createElement('a');
      anchor.href = url;

      // Naming the file as you requested
      const newName =
        file.name.replace('.wav', '') + `_MASTERED-${style.toUpperCase()}.wav`;
      anchor.download = newName;

      anchor.click(); // This makes the download happen
      URL.revokeObjectURL(url); // Clean up memory

      setStatus('complete');
    } catch (error) {
      console.error('Mastering failed:', error);
      setStatus('selected');
    }
  };

  return (
    <div style={styles.outerWrapper}>
      <div style={styles.contentContainer}>
        {/* HEADER SECTION */}
        <header style={styles.header}>
          <h1 style={styles.title}>LOCAL WAV //</h1>
          <div style={styles.statusLine}>
            <span style={styles.mono}>STATUS: {status.toUpperCase()}</span>
            <span style={styles.mono}>ENGINE: CLIENT_SIDE_v1.0</span>
          </div>
          <p style={styles.description}>
            Professional mastering without the cloud. Your propriety audio stays
            on your machine.
          </p>
        </header>

        {/* STATE 1: IDLE / UPLOAD */}
        {status === 'idle' && (
          <div style={styles.dropContainer}>
            <FileDrop onFileSelect={handleFileChange} />
          </div>
        )}

        {/* STATE 2: FILE SELECTED / STYLE PICKER */}
        {status === 'fileSelected' && (
          <section>
            <div style={styles.fileInfo}>
              <span style={styles.mono}>SOURCE_FILE: {file.name}</span>
            </div>
            {/* Updated Selection Area */}
            <div style={styles.grid}>
              <button
                className='card-button cinematic-hover'
                onClick={() => masterTrack('Cinematic')}
              >
                <span className='mono-text' style={styles.cardNumber}>
                  01 //
                </span>
                <h4 style={styles.cardTitle}>CINEMATIC</h4>
                <p style={styles.cardDesc}>
                  Wide dynamic range. Enhanced sub-bass.
                </p>
              </button>

              <button
                className='card-button indie-hover'
                onClick={() => masterTrack('Indie')}
              >
                <span className='mono-text' style={styles.cardNumber}>
                  02 //
                </span>
                <h4 style={styles.cardTitle}>INDIE ARTIST</h4>
                <p style={styles.cardDesc}>
                  Warm mids and aggressive limiting.
                </p>
              </button>

              <button
                className='card-button clean-hover'
                onClick={() => masterTrack('Moderate')}
              >
                <span className='mono-text' style={styles.cardNumber}>
                  03 //
                </span>
                <h4 style={styles.cardTitle}>CLEAN POLISH</h4>
                <p style={styles.cardDesc}>
                  Transparent gain and subtle balancing.
                </p>
              </button>
            </div>
            <button style={styles.resetLink} onClick={() => setStatus('idle')}>
              [ CANCEL_AND_EXIT ]
            </button>
          </section>
        )}

        {/* STATE 3: PROCESSING */}
        {status === 'processing' && (
          <div style={styles.processingBox}>
            <div className='spinner-line'></div>
            <h2 style={styles.mono}>COMPUTING_MASTER...</h2>
            <p style={styles.mono}>
              Accessing local hardware nodes. Do not close tab.
            </p>
          </div>
        )}

        {/* STATE 4: COMPLETE */}
        {status === 'complete' && (
          <div style={styles.completeBox}>
            <div style={styles.successHeader}>
              <span style={styles.successBullet}>●</span>
              <span style={styles.successText}>EXPORT_SUCCESSFUL</span>
              <span style={styles.timestamp}>
                {new Date().toLocaleTimeString()}
              </span>
            </div>

            <div style={styles.logBody}>
              <p>// SEQUENCE: RENDER_COMPLETED</p>
              <p>
                // FILENAME: {file.name.replace(/\.[^/.]+$/, '')}_MASTERED.wav
              </p>
              <p>// BIT_DEPTH: 16-BIT PCM</p>
              <p>// DESTINATION: LOCAL_SYSTEM_DOWNLOADS</p>
            </div>

            <button
              className='card-button'
              style={styles.resetButton}
              onClick={() => {
                setFile(null);
                setStatus('idle');
              }}
            >
              <strong>[ NEW_SESSION ]</strong>
            </button>

            <p style={styles.privacyNote}>
              NOTE: Processed locally on your machine. No audio data was
              transmitted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  outerWrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    padding: '20px',
  },
  contentContainer: {
    maxWidth: '900px',
    width: '100%',
  },
  header: {
    marginBottom: '3rem',
    textAlign: 'left',
  },
  title: {
    fontFamily: '"Space Mono", monospace',
    fontSize: '3.5rem',
    margin: 0,
    letterSpacing: '-3px',
    lineHeight: '0.9',
  },
  statusLine: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px',
    borderTop: '2px solid #1a1a1a',
    paddingTop: '5px',
  },
  mono: {
    fontFamily: '"Space Mono", monospace',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: '1.1rem',
    marginTop: '20px',
    maxWidth: '500px',
    lineHeight: '1.4',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  },
  fileInfo: {
    borderBottom: '1px solid #ddd',
    paddingBottom: '10px',
    color: '#666',
  },
  cardNumber: {
    fontFamily: '"Space Mono", monospace',
    fontSize: '0.8rem',
    display: 'block',
    marginBottom: '10px',
    color: '#999',
  },
  cardTitle: {
    margin: '0 0 10px 0',
    fontSize: '1.4rem',
  },
  cardDesc: {
    fontSize: '0.9rem',
    margin: 0,
    color: '#444',
    lineHeight: '1.4',
  },
  resetLink: {
    marginTop: '2rem',
    background: 'none',
    border: 'none',
    fontFamily: '"Space Mono", monospace',
    cursor: 'pointer',
    color: '#999',
    fontSize: '0.7rem',
  },
  processingBox: {
    padding: '100px',
    textAlign: 'center',
    border: '3px solid #1a1a1a',
  },
  completeBox: {
    border: '3px solid #1a1a1a',
    padding: '3rem',
    background: '#fff',
    boxShadow: '10px 10px 0px #00ff41',
    textAlign: 'left',
  },
  successHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '2rem',
    borderBottom: '1px solid #eee',
    paddingBottom: '1rem',
  },
  successBullet: { color: '#00ff41', fontSize: '1.2rem' },
  successText: { fontFamily: '"Space Mono", monospace', fontWeight: 'bold' },
  timestamp: {
    marginLeft: 'auto',
    color: '#999',
    fontSize: '0.8rem',
    fontFamily: '"Space Mono"',
  },
  logBody: {
    fontFamily: '"Space Mono", monospace',
    fontSize: '0.85rem',
    lineHeight: '1.8',
    color: '#333',
  },
  resetButton: {
    marginTop: '2.5rem',
    width: '100%',
    textAlign: 'center',
    padding: '1.5rem',
  },
  privacyNote: {
    marginTop: '1.5rem',
    fontSize: '0.65rem',
    color: '#bbb',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
};

export default LandingPage;
