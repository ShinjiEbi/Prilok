const size = 45
const cell = 14
const canvas = document.getElementById("world")
const ctx = canvas.getContext("2d")

canvas.width = size * cell
canvas.height = size * cell

let creatures = []
let predators = []
let food = []

let lastUpdate = 0
const updateDelay = 400   // 🔥 RALENTI FORTEMENT

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
    if(Math.random()<0.2){
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

        // 🔥 Vision murs
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
            food.length/50
        ]

        let output=this.brain.think(inputs)

        // Physique lente
        let speed=0.15

        this.vx += output[0]*speed
        this.vy += output[1]*speed

        this.vx *= 0.9
        this.vy *= 0.9

        this.x += this.vx
        this.y += this.vy

        this.x=clamp(this.x)
        this.y=clamp(this.y)

        this.energy -= 0.2

        eatFood(this)

        // Reproduction proximité
        creatures.forEach(other=>{

            if(other!==this && distance(this,other)<1.5){

                if(this.energy>160 && other.energy>160){

                    let childBrain=this.brain.clone()
                    childBrain.mutate()

                    creatures.push(new Creature(childBrain))

                    this.energy-=70
                    other.energy-=70
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
        this.energy=120
    }

    update(){

        let target=getNearest(creatures,this.x,this.y)

        if(target){

            let dx=target.x-this.x
            let dy=target.y-this.y

            this.x+=Math.sign(dx)*0.3
            this.y+=Math.sign(dy)*0.3
        }

        this.x=clamp(this.x)
        this.y=clamp(this.y)

        this.energy -= 0.3

        // Manger
        creatures=creatures.filter(c=>{

            if(distance(c,this)<0.8){

                this.energy += 60
                return false
            }

            return true
        })

        // Reproduction lente
        if(this.energy>220){

            predators.push(new Predator())
            this.energy-=100
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

function eatFood(creature){

    food=food.filter(f=>{

        if(Math.floor(f.x)===Math.floor(creature.x) &&
           Math.floor(f.y)===Math.floor(creature.y)){

            creature.energy+=50
            return false
        }

        return true
    })
}

/* ================= INIT ================= */

creatures=Array.from({length:12},()=>new Creature())
predators=Array.from({length:2},()=>new Predator())

/* ================= LOOP ULTRA RALENTI ================= */

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

    creatures.forEach(c=>c.update())
    predators.forEach(p=>p.update())

    creatures.forEach(c=>c.draw())
    predators.forEach(p=>p.draw())

    creatures=creatures.filter(c=>c.energy>0)
    predators=predators.filter(p=>p.energy>0)

    requestAnimationFrame(loop)
}

loop()
