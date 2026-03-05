class SoundSystem {

    constructor() {
        this.audio = new (window.AudioContext || window.webkitAudioContext)()
    }

    emit(type, strength) {

        let baseFreq = 200

        if(type === "food") baseFreq = 400
        if(type === "danger") baseFreq = 120
        if(type === "help") baseFreq = 600

        let freq = baseFreq + Math.abs(strength) * 300
        let duration = 0.15
        let volume = 0.3 + Math.abs(strength) * 0.7

        let osc = this.audio.createOscillator()
        let gain = this.audio.createGain()

        osc.type = "square"
        osc.frequency.value = freq
        gain.gain.value = volume * 0.2

        osc.connect(gain)
        gain.connect(this.audio.destination)

        osc.start()
        osc.stop(this.audio.currentTime + duration)

        return { type, freq, strength }
    }
}
