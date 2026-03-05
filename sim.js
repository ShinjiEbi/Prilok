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
const updateDelay = 150   // 🔥 RALENTI PROPREMENT

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
    if(Math.random()<0.4){
        food.push({
            x:Math.random()*size|0,
            y:Math.random()*size|0
        })
    }
}

/* ================= CREATURE ================= */

class Creature{

    constructor(brain=null){

        this.x=Math.random()*size
        this.y=Math.random()*size

        this.vx=0
        this.vy=0

        this.energy=100

        this.brain=brain||new Brain()
    }

    update(){

        let nearestFood=getNearest(food,this.x,this.y)
        let nearestPred=getNearest(predators,this.x,this.y)

        // ✅ VISION DES MURS
        let wallLeft=this.x/size
        let wallRight=(size-this.x)/size
        let wallTop=this.y/size
        let wallBottom=(size-this.y)/size

        let inputs=[
            (nearestFood?.x-this.x||0)/size,
            (nearestFood?.y-this.y||0)/size,
            (nearestPred?.x-this.x||0)/size,
            (nearestPred?.y-this.y||0)/size,
            wallLeft,
            wallRight,
            wallTop,
            wallBottom,
            this.energy/100,
            this.vx,
            this.vy,
            food.length/100
        ]

        let output=this.brain.think(inputs)

        // ✅ PHYSIQUE REALISTE
        let speed=0.2

        this.vx += output[0]*speed
        this.vy += output[1]*speed

        // friction
        this.vx *= 0.92
        this.vy *= 0.92

        this.x += this.vx
        this.y += this.vy

        this.x=clamp(this.x)
        this.y=clamp(this.y)

        this.energy -= 0.3

        eatFood(this)

        // ✅ REPRODUCTION PROXIMITE
        creatures.forEach(other=>{

            if(other!==this && distance(this,other)<1.5){

                if(this.energy>130 && other.energy>130){

                    let childBrain=this.brain.clone()
                    childBrain.mutate()

                    creatures.push(new Creature(childBrain))

                    this.energy-=60
                    other.energy-=60
                }
            }
        })
    }

    draw(){

        ctx.fillStyle="cyan"

        ctx.beginPath()
        ctx.arc(
            this.x*cell,
            this.y*cell,
            cell/3,
            0,
            Math.PI*2
        )
        ctx.fill()
    }
}

/* ================= PREDATEUR ================= */

class Predator{

    constructor(){
        this.x=Math.random()*size
        this.y=Math.random()*size
    }

    update(){

        let target=getNearest(creatures,this.x,this.y)

        if(target){

            let dx=target.x-this.x
            let dy=target.y-this.y

            this.x+=Math.sign(dx)*0.4
            this.y+=Math.sign(dy)*0.4
        }

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
        ctx.moveTo(this.x*cell,this.y*cell-cell/2)
        ctx.lineTo(this.x*cell-cell/2,this.y*cell+cell/2)
        ctx.lineTo(this.x*cell+cell/2,this.y*cell+cell/2)
        ctx.closePath()
        ctx.fill()
    }
}

function eatFood(creature){

    food=food.filter(f=>{

        if(Math.floor(f.x)===Math.floor(creature.x) &&
           Math.floor(f.y)===Math.floor(creature.y)){

            creature.energy+=40
            return false
        }

        return true
    })
}

creatures=Array.from({length:15},()=>new Creature())
predators=Array.from({length:3},()=>new Predator())

/* ================= LOOP AVEC RALENTI ================= */

function loop(timestamp){

    if(timestamp-lastUpdate<updateDelay){
        requestAnimationFrame(loop)
        return
    }

    lastUpdate=timestamp

    spawnFood()

    // fond
    ctx.fillStyle="#0b1425"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    // nourriture
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
