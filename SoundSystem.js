/* =====================================================
   EVOLUTIONARY SOUND LANGUAGE
===================================================== */

class SoundSystem {

    constructor() {
        this.audio = new (window.AudioContext || window.webkitAudioContext)()
    }

    emit(signal) {

        let freq = 200 + Math.abs(signal.freq) * 800
        let duration = 0.1 + Math.abs(signal.duration) * 0.4
        let volume = Math.abs(signal.volume)

        let osc = this.audio.createOscillator()
        let gain = this.audio.createGain()

        osc.type = "square"
        osc.frequency.value = freq
        gain.gain.value = volume * 0.2

        osc.connect(gain)
        gain.connect(this.audio.destination)

        osc.start()
        osc.stop(this.audio.currentTime + duration)

        return {
            freq: freq,
            strength: volume
        }
    }
}
