/* =====================================================
   EVOLUTIONARY SOUND SYSTEM
===================================================== */

let audioUnlocked = false

class SoundSystem{

constructor(){

if(!audioUnlocked) return

this.audio=new (window.AudioContext||window.webkitAudioContext)()
}

emit(type,strength){

if(!audioUnlocked || !this.audio) return

let base=200

if(type==="food") base=400
if(type==="danger") base=120
if(type==="help") base=600

let freq=base+Math.abs(strength)*300
let duration=0.15
let volume=0.3+Math.abs(strength)

let osc=this.audio.createOscillator()
let gain=this.audio.createGain()

osc.type="square"
osc.frequency.value=freq
gain.gain.value=volume*0.2

osc.connect(gain)
gain.connect(this.audio.destination)

osc.start()
osc.stop(this.audio.currentTime+duration)

}

}
