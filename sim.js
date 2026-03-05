const size = 45
const cell = 14
const canvas = document.getElementById("world")
const ctx = canvas.getContext("2d")

canvas.width = size * cell
canvas.height = size * cell

let creatures = []
let predators = []
let food = []

let lastTime = 0

function clamp(v){
    return Math.max(0,Math.min(size-1,v))
}

function distance(a,b){
    return (a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)
}

/* ================= UTIL ================= */

function getNearest(list,x,y){

    let best=null
    let min=Infinity

    for(let i=0;i<list.length;i++){

        let obj=list[i]
        let d=(obj.x-x)*(obj.x-x)+(obj.y-y)*(obj.y-y)

        if(d<min){
            min=d
            best=obj
        }
    }

    return best
}

function spawnFood(){

    if(food.length>300) return   // 🔥 limite accumulation

    if(Math.random()<0.3){
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

        this.energy=120
        this.brain=brain||new Brain()
    }

    update(){

        let nearestFood=getNearest(food,this.x,this.y)
        let nearestPred=getNearest(predators,this.x,this.y)

        let inputs=[
            (nearestFood?.x-this.x||0)/size,
            (nearestFood?.y-this.y||0)/size,
            (nearestPred?.x-this.x||0)/size,
            (nearestPred?.y-this.y||0)/size,
            this.x/size,
            this.y/size,
            (size-this.x)/size,
            (size-this.y)/size,
            this.energy/100,
            this.vx,
            this.vy,
            food.length/200
        ]

        let output=this.brain.think(inputs)

        // 🔥 Physique fluide
        let force=0.12

        this.vx += output[0]*force
        this.vy += output[1]*force

        this.vx *= 0.93
        this.vy *= 0.93

        this.x += this.vx
        this.y += this.vy

        this.x=clamp(this.x)
        this.y=clamp(this.y)

        this.energy -= 0.15

        eatFood(this)
        reproduceProximity(this)
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
        this.energy=150
    }

    update(){

        let target=getNearest(creatures,this.x,this.y)

        if(target){
            let dx=target.x-this.x
            let dy=target.y-this.y

            this.x += Math.sign(dx)*0.25
            this.y += Math.sign(dy)*0.25
        }

        this.x=clamp(this.x)
        this.y=clamp(this.y)

        this.energy -= 0.2

        creatures=creatures.filter(c=>{

            if((c.x-this.x)**2+(c.y-this.y)**2<0.8){
                this.energy+=70
                return false
            }

            return true
        })

        if(this.energy>300){
            predators.push(new Predator())
            this.energy-=120
        }
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

/* ================= SYSTEM ================= */

function eatFood(creature){

    for(let i=food.length-1;i>=0;i--){

        let f=food[i]

        if(Math.floor(f.x)===Math.floor(creature.x) &&
           Math.floor(f.y)===Math.floor(creature.y)){

            creature.energy+=50
            food.splice(i,1)
        }
    }
}

function reproduceProximity(creature){

    for(let i=0;i<creatures.length;i++){

        let other=creatures[i]

        if(other!==creature){

            let d=(creature.x-other.x)**2+(creature.y-other.y)**2

            if(d<2 && creature.energy>200 && other.energy>200){

                let childBrain=creature.brain.clone()
                childBrain.mutate()

                creatures.push(new Creature(childBrain))

                creature.energy-=80
                other.energy-=80

                break
            }
        }
    }
}

/* ================= INIT ================= */

creatures=Array.from({length:12},()=>new Creature())
predators=Array.from({length:2},()=>new Predator())

/* ================= LOOP FLUIDE ================= */

function loop(time){

    let delta=time-lastTime
    lastTime=time

    // Update plusieurs fois si besoin pour stabilité
    let steps=Math.min(3,Math.floor(delta/16))

    for(let s=0;s<steps;s++){

        spawnFood()
        creatures.forEach(c=>c.update())
        predators.forEach(p=>p.update())

        creatures=creatures.filter(c=>c.energy>0)
        predators=predators.filter(p=>p.energy>0)
    }

    // 🔥 RENDER OPTIMISÉ
    ctx.fillStyle="#0b1425"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    food.forEach(f=>{
        ctx.fillStyle="lime"
        ctx.fillRect(f.x*cell,f.y*cell,cell,cell)
    })

    creatures.forEach(c=>c.draw())
    predators.forEach(p=>p.draw())

    requestAnimationFrame(loop)
}

loop(0)
