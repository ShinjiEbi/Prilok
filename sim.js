const size = 50
const cell = 12
const canvas = document.getElementById("world")
const ctx = canvas.getContext("2d")

canvas.width = size * cell
canvas.height = size * cell

let creatures = []
let predators = []
let food = []

let lastUpdate = 0
const updateDelay = 120

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

        this.energy=120

        this.brain=brain||new Brain()
    }

    update(){

        let nearestFood=getNearest(food,this.x,this.y)
        let nearestPred=getNearest(predators,this.x,this.y)
        let nearestAlly=getNearest(creatures.filter(c=>c!==this),this.x,this.y)

        /* ===== INSTINCT SURVIE ===== */

        let fearX=0
        let fearY=0

        if(nearestPred){

            let d=distance(this,nearestPred)

            if(d<12 && d>0){

                let dx=this.x-nearestPred.x
                let dy=this.y-nearestPred.y

                fearX=(dx/d)*(1-d/12)
                fearY=(dy/d)*(1-d/12)
            }
        }

        /* ===== ENTRAIDE ===== */

        let helpX=0
        let helpY=0

        if(nearestAlly){

            let d=distance(this,nearestAlly)

            if(d<6 && d>0){

                let dx=nearestAlly.x-this.x
                let dy=nearestAlly.y-this.y

                helpX=(dx/d)*0.1
                helpY=(dy/d)*0.1
            }
        }

        /* ===== INPUT NEURONE ===== */

        let inputs=[
            (nearestFood?.x-this.x||0)/size,
            (nearestFood?.y-this.y||0)/size,
            (nearestPred?.x-this.x||0)/size,
            (nearestPred?.y-this.y||0)/size,
            this.energy/150,
            food.length/100,
            predators.length/10
        ]

        let output=this.brain.think(inputs)

        /* ===== PHYSIQUE ===== */

        let speed=0.3

        this.vx += output[0]*speed
        this.vy += output[1]*speed

        // instincts automatiques
        this.vx += fearX*0.6
        this.vy += fearY*0.6

        // entraide
        this.vx += helpX
        this.vy += helpY

        // friction
        this.vx*=0.88
        this.vy*=0.88

        this.x+=this.vx
        this.y+=this.vy

        // rebond murs
        if(this.x<=0 || this.x>=size-1) this.vx*=-0.7
        if(this.y<=0 || this.y>=size-1) this.vy*=-0.7

        this.x=clamp(this.x)
        this.y=clamp(this.y)

        this.energy-=0.4

        eatFood(this)

        /* ===== REPRODUCTION FACILE ===== */

        creatures.forEach(other=>{

            if(other!==this){

                if(distance(this,other)<2.2 &&
                   this.energy>110 &&
                   other.energy>110){

                    let childBrain=this.brain.clone()
                    childBrain.mutate()

                    creatures.push(new Creature(childBrain))

                    this.energy-=40
                    other.energy-=40
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

/* ================= PREDATEUR ================= */

class Predator{

    constructor(){

        this.x=Math.random()*size
        this.y=Math.random()*size

        this.vx=0
        this.vy=0
    }

    update(){

        let target=getNearest(creatures,this.x,this.y)

        if(target){

            let dx=target.x-this.x
            let dy=target.y-this.y

            this.vx += Math.sign(dx)*0.08
            this.vy += Math.sign(dy)*0.08
        }

        this.vx*=0.9
        this.vy*=0.9

        this.x+=this.vx
        this.y+=this.vy

        this.x=clamp(this.x)
        this.y=clamp(this.y)

        creatures=creatures.filter(c=>{

            if(distance(c,this)<0.8){
                return false
            }

            return true
        })
    }

    draw(){

        ctx.fillStyle="red"

        ctx.beginPath()
        ctx.arc(this.x*cell,this.y*cell,cell/2,0,Math.PI*2)
        ctx.fill()
    }
}

/* ================= INIT ================= */

creatures=Array.from({length:15},()=>new Creature())
predators=Array.from({length:2},()=>new Predator())

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

    predators.forEach(p=>{
        p.update()
        p.draw()
    })

    creatures=creatures.filter(c=>c.energy>0)

    requestAnimationFrame(loop)
}

loop()
