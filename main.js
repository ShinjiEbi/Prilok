<!-- ===== HTML ===== -->
<canvas id="world"></canvas>

<script src="brain.js"></script>
<script>
/* ================= CONFIG ================= */

const size = 50
const cell = 12
const canvas = document.getElementById("world")
const ctx = canvas.getContext("2d")

canvas.width = size * cell
canvas.height = size * cell

let creatures = []
let food = []

let lastUpdate = 0
const updateDelay = 120

/* ================= AUDIO 8BIT ================= */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)()

function playBitSound(freq=400,duration=0.08){

    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    osc.type="square"
    osc.frequency.value=freq
    gain.gain.value=0.1

    osc.connect(gain)
    gain.connect(audioCtx.destination)

    osc.start()
    osc.stop(audioCtx.currentTime+duration)
}

/* ================= UTILS ================= */

function clamp(v){
    return Math.max(0,Math.min(size-1,v))
}

function distance(a,b){
    return Math.hypot(a.x-b.x,a.y-b.y)
}

function getNearest(list,x,y){

    let best=null
    let min=Infinity

    list.forEach(obj=>{
        let d=Math.hypot(obj.x-x,obj.y-y)
        if(d<min){
            min=d
            best=obj
        }
    })

    return best
}

function spawnFood(){
    if(Math.random()<0.5){
        food.push({
            x:Math.random()*size|0,
            y:Math.random()*size|0
        })
    }
}

function eatFood(creature){

    food = food.filter(f=>{

        if(Math.floor(f.x)===Math.floor(creature.x) &&
           Math.floor(f.y)===Math.floor(creature.y)){

            creature.energy += 50
            playBitSound(500+Math.random()*200,0.05)
            return false
        }

        return true
    })
}

/* ================= CREATURE ================= */

class Creature{

    constructor(brain=null){

        this.x=Math.random()*size
        this.y=Math.random()*size

        this.vx=0
        this.vy=0

        this.energy=150

        this.brain = brain || new Brain()

        this.messages=[]
        this.vocabulary=[]
    }

    /* ===== COMMUNICATION ===== */

    sendMessage(type){

        let freqMap={
            food:400,
            danger:800,
            reproduce:600
        }

        let freq=freqMap[type]||500

        playBitSound(freq,0.06)

        this.vocabulary.push(type)
        if(this.vocabulary.length>20)
            this.vocabulary.shift()

        creatures.forEach(other=>{

            if(other!==this && distance(this,other)<8){
                other.messages.push(type)
            }
        })
    }

    interpretMessages(){

        this.messages.forEach(msg=>{

            if(msg==="food"){
                let f=getNearest(food,this.x,this.y)
                if(f){
                    this.vx+=(f.x-this.x)*0.02
                    this.vy+=(f.y-this.y)*0.02
                }
            }

            if(msg==="danger"){
                this.vx-=0.2
                this.vy-=0.2
            }

            if(msg==="reproduce"){
                let ally=getNearest(creatures.filter(c=>c!==this),this.x,this.y)
                if(ally){
                    this.vx+=(ally.x-this.x)*0.01
                    this.vy+=(ally.y-this.y)*0.01
                }
            }
        })

        this.messages=[]
    }

    /* ===== UPDATE ===== */

    update(){

        let nearestFood=getNearest(food,this.x,this.y)
        let nearestAlly=getNearest(creatures.filter(c=>c!==this),this.x,this.y)

        /* ===== CONDITIONS AUTOMATIQUES ===== */

        if(nearestFood && distance(this,nearestFood)<5){
            this.sendMessage("food")
        }

        if(this.energy<70){
            this.sendMessage("danger")
        }

        if(this.energy>180){
            this.sendMessage("reproduce")
        }

        this.interpretMessages()

        /* ===== NEURAL INPUT ===== */

        let inputs=[
            (nearestFood?.x-this.x||0)/size,
            (nearestFood?.y-this.y||0)/size,
            this.energy/150,
            food.length/100
        ]

        let output=this.brain.think(inputs)

        /* ===== PHYSIQUE ===== */

        let speed=0.3

        this.vx+=output[0]*speed
        this.vy+=output[1]*speed

        this.vx*=0.88
        this.vy*=0.88

        this.x+=this.vx
        this.y+=this.vy

        if(this.x<=0 || this.x>=size-1) this.vx*=-0.7
        if(this.y<=0 || this.y>=size-1) this.vy*=-0.7

        this.x=clamp(this.x)
        this.y=clamp(this.y)

        this.energy-=0.4

        eatFood(this)

        /* ===== REPRODUCTION ===== */

        creatures.forEach(other=>{

            if(other!==this){

                if(distance(this,other)<2 &&
                   this.energy>140 &&
                   other.energy>140){

                    let childBrain=this.brain.clone()
                    childBrain.mutate()

                    creatures.push(new Creature(childBrain))

                    this.sendMessage("reproduce")

                    this.energy-=50
                    other.energy-=50
                }
            }
        })
    }

    draw(){

        ctx.fillStyle="cyan"
        ctx.beginPath()
        ctx.arc(this.x*cell,this.y*cell,cell/3,0,Math.PI*2)
        ctx.fill()
    }
}

/* ================= INIT ================= */

creatures=Array.from({length:15},()=>new Creature())

/* ================= LOOP ================= */

function loop(timestamp){

    if(timestamp-lastUpdate<updateDelay){
        requestAnimationFrame(loop)
        return
    }

    lastUpdate=timestamp

    spawnFood()

    ctx.fillStyle="#0b1425"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    food.forEach(f=>{
        ctx.fillStyle="lime"
        ctx.fillRect(f.x*cell,f.y*cell,cell,cell)
    })

    creatures.forEach(c=>{
        c.update()
        c.draw()
    })

    creatures=creatures.filter(c=>c.energy>0)

    requestAnimationFrame(loop)
}

loop()
</script>
