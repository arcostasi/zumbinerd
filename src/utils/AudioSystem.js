/**
 * ZumbiNerd - Audio System (Web Audio API Synth)
 * Generates retro 8-bit sound effects and background music in real-time.
 * Avoids the need to load heavy audio files.
 */

class AudioSystem {
    constructor() {
        this.ctx = null;
        
        // Load preferences from LocalStorage with fallback defaults
        this.musicEnabled = localStorage.getItem('zumbinerd_music_enabled') !== 'false';
        this.sfxEnabled = localStorage.getItem('zumbinerd_sfx_enabled') !== 'false';
        
        const storedMusicVolume = localStorage.getItem('zumbinerd_music_volume');
        this.musicVolume = storedMusicVolume !== null ? parseFloat(storedMusicVolume) : 0.3;
        
        const storedSfxVolume = localStorage.getItem('zumbinerd_sfx_volume');
        this.sfxVolume = storedSfxVolume !== null ? parseFloat(storedSfxVolume) : 0.5;
        
        // Playlists for Menu and Game
        this.introPlaylist = [
            'assets/sound/ZumbiNerd - Nowhere Left To Hide (Intro 1).mp3',
            'assets/sound/ZumbiNerd - Nowhere Left To Hide (Intro 2).mp3'
        ];
        this.gamePlaylist = [
            'assets/sound/ZumbiNerd - Nowhere Left To Hide (Part 1).mp3',
            'assets/sound/ZumbiNerd - Nowhere Left To Hide (Part 2).mp3'
        ];
        this.currentPlaylist = [];
        this.playlistIndex = 0;
        this.currentMusicType = null; // 'intro' or 'game'
        
        // Custom background music HTML5 Audio (no default source, loaded dynamically)
        this.musicAudio = new Audio();
        this.musicAudio.volume = this.musicVolume;
        this.musicAudio.loop = false; // We manage looping manually by playing the next track!
        
        // Listen to ended event to transition to next track in playlist
        this.musicAudio.addEventListener('ended', () => {
            this.playNextTrack();
        });
        
        // Compatibility flag for MenuScene check
        this.musicInterval = null;
    }

    /**
     * Lazy-load AudioContext because browser security blocks autoplay
     */
    initContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Helper to create a gain node with custom envelope
     */
    createOscillator(type, freq, duration, gainStart, gainEnd = 0.001, ease = 'exponential') {
        this.initContext();
        if (!this.ctx) return null;

        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gainNode.gain.setValueAtTime(gainStart, this.ctx.currentTime);
        if (ease === 'exponential') {
            gainNode.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);
        } else {
            gainNode.gain.linearRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);
        }

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);

        return { osc, gainNode };
    }

    /**
     * Pulo (Jump SFX): Resonant filter sweep over a sawtooth wave (futuristic jet jump)
     */
    playJump() {
        if (!this.sfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const duration = 0.16;
        const now = this.ctx.currentTime;
        
        // Triangle oscillator for a warm, solid retro jump sweep (no "quack")
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(140, now);
        osc1.frequency.exponentialRampToValueAtTime(600, now + duration);
        gain1.gain.setValueAtTime(this.sfxVolume * 0.5, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + duration);

        // Sine oscillator for a clean high digital blip, making it feel crispy and cyber
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(300, now);
        osc2.frequency.exponentialRampToValueAtTime(900, now + 0.08);
        gain2.gain.setValueAtTime(this.sfxVolume * 0.25, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.08);
    }

    /**
     * Coleta (Collect SFX): Ultra-fast high-pitched cyber-scanner arpeggio
     */
    playCollect() {
        if (!this.sfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // 3-note digital data scan (C6 -> F6 -> C7)
        const notes = [1046.50, 1396.91, 2093.00];
        notes.forEach((freq, idx) => {
            const time = now + (idx * 0.04);
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, time);
            
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(900, time);
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.15, time);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(time);
            osc.stop(time + 0.08);
        });
    }

    /**
     * Dano (Hit SFX): Short circuit frequency-modulated glitch & static burst
     */
    playHit() {
        if (!this.sfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 0.28;

        // Glitch generator (Frequency Modulation)
        const osc = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const gainNode = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(40, now + duration);

        modulator.type = 'square';
        modulator.frequency.setValueAtTime(60, now); // Glitch rate

        modGain.gain.setValueAtTime(80, now); // FM depth

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.Q.setValueAtTime(3, now);

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        modulator.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        modulator.start(now);
        osc.start(now);
        modulator.stop(now + duration);
        osc.stop(now + duration);

        // High-frequency digital noise burst (static spark)
        try {
            const bufferSize = this.ctx.sampleRate * 0.15;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.setValueAtTime(1200, now);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            
            noise.start(now);
            noise.stop(now + 0.15);
        } catch (e) {}
    }

    /**
     * Ataque (Attack SFX): Cyber laser energy slash / compiler swoop
     */
    playAttack() {
        if (!this.sfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 0.18;

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gainNode = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + duration);

        filter.type = 'lowpass';
        filter.Q.setValueAtTime(5, now);
        filter.frequency.setValueAtTime(4000, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + duration);

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    /**
     * Fase Concluída (Level Complete): Futuristic corporate boot chord
     */
    playLevelWin() {
        if (!this.sfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Cyber Startup Boot Chord (Cmaj7/9: C3, G3, D4, E4, B4)
        const freqs = [130.81, 196.00, 293.66, 329.63, 493.88];
        const duration = 1.2;

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gainNode = this.ctx.createGain();
            
            osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);
            
            // Sweep filter upwards for a swell "loading mainframe" boot feel
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(100, now);
            filter.frequency.exponentialRampToValueAtTime(2000, now + 0.6);
            
            gainNode.gain.setValueAtTime(this.sfxVolume * 0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(now);
            osc.stop(now + duration);
        });
    }

    /**
     * Derrota (Game Over): Server power down with double warning panic beeps
     */
    playGameOver() {
        if (!this.sfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 1.0;

        // Falling power-down frequency
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gainNode = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + duration);

        filter.type = 'lowpass';
        filter.Q.setValueAtTime(10, now);
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + duration);

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.45, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);

        // Kernel Panic warnings
        for (let i = 0; i < 2; i++) {
            const beepTime = now + (i * 0.25);
            const beepOsc = this.ctx.createOscillator();
            const beepGain = this.ctx.createGain();
            
            beepOsc.type = 'sine';
            beepOsc.frequency.setValueAtTime(1200, beepTime);
            
            beepGain.gain.setValueAtTime(this.sfxVolume * 0.2, beepTime);
            beepGain.gain.exponentialRampToValueAtTime(0.001, beepTime + 0.15);
            
            beepOsc.connect(beepGain);
            beepGain.connect(this.ctx.destination);
            
            beepOsc.start(beepTime);
            beepOsc.stop(beepTime + 0.15);
        }
    }

    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    playNextTrack() {
        if (!this.musicEnabled || this.currentPlaylist.length === 0) return;
        
        this.playlistIndex = (this.playlistIndex + 1) % this.currentPlaylist.length;
        const nextSrc = this.currentPlaylist[this.playlistIndex];
        console.log(`MÚSICA: Transicionando para a próxima faixa: ${nextSrc}`);
        
        this.musicAudio.src = nextSrc;
        this.musicAudio.volume = this.musicVolume;
        this.musicAudio.play().catch(err => {
            console.warn('Música: Transição automática de faixa bloqueada pelo navegador:', err);
        });
    }

    /**
     * Starts looping the background music playlist based on the type ('intro' or 'game')
     * Sequence is shuffled and plays one track after another.
     */
    startMusic(type = 'intro') {
        if (!this.musicEnabled) return;
        this.initContext();

        // If the same playlist is already playing, do not interrupt it!
        if (this.currentMusicType === type && this.musicAudio && !this.musicAudio.paused) {
            return;
        }

        this.stopMusic();

        this.currentMusicType = type;
        this.musicInterval = true; // Compatibility flag for MenuScene

        let basePlaylist = [];
        if (type === 'game') {
            basePlaylist = this.gamePlaylist;
        } else if (type === 'gameover' || type === 'death') {
            basePlaylist = ['assets/sound/Terminal_State.mp3'];
        } else {
            basePlaylist = this.introPlaylist;
        }
        
        this.currentPlaylist = this.shuffleArray(basePlaylist);
        this.playlistIndex = 0;

        if (this.currentPlaylist.length > 0) {
            const firstSrc = this.currentPlaylist[this.playlistIndex];
            console.log(`MÚSICA: Iniciando playlist '${type}' com a faixa: ${firstSrc}`);
            
            this.musicAudio.src = firstSrc;
            this.musicAudio.volume = this.musicVolume;
            this.musicAudio.play().catch(err => {
                console.warn(`Música: Reprodução bloqueada pelo navegador para ${firstSrc}:`, err);
                this.musicInterval = null;
            });
        }
    }

    /**
     * Stops the background music track
     */
    stopMusic() {
        this.musicInterval = null;
        this.currentMusicType = null;
        if (this.musicAudio) {
            this.musicAudio.pause();
        }
    }

    /**
     * Mute / Unmute controls
     */
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        localStorage.setItem('zumbinerd_music_enabled', enabled ? 'true' : 'false');
        if (!enabled) {
            this.stopMusic();
        } else {
            this.startMusic(this.currentMusicType || 'intro');
        }
    }

    setSfxEnabled(enabled) {
        this.sfxEnabled = enabled;
        localStorage.setItem('zumbinerd_sfx_enabled', enabled ? 'true' : 'false');
    }

    setMusicVolume(vol) {
        this.musicVolume = Math.max(0, Math.min(1, vol));
        localStorage.setItem('zumbinerd_music_volume', this.musicVolume.toString());
        if (this.musicAudio) {
            this.musicAudio.volume = this.musicVolume;
        }
    }

    setSfxVolume(vol) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
        localStorage.setItem('zumbinerd_sfx_volume', this.sfxVolume.toString());
    }
}

// Expose a single global instance
window.audioSystem = new AudioSystem();

export default window.audioSystem;
