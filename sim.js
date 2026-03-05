const size = 50
const cell = 12
const canvas = document.getElementById("world")
const ctx = canvas.getContext("2d")

canvas.width = size * cell
canvas.height = size * cell

let creatures = []
let predators = []
let food = []

function clamp(v){
    return Math.max(0,Math.min(size-1,v))
}

function getNearest(list,x,y){

    let best = null
    let dist = Infinity

    list.forEach(obj=>{
        let d = Math.hypot(obj.x-x,obj.y-y)
        if(d < dist){
            dist = d
            best = obj
        }
    })

    return best
}

function spawnFood(){
    for(let i=0;i<15;i++){
        food.push({
            x: Math.random()*size|0,
            y: Math.random()*size|0
        })
    }
}

function eatFood(creature){

    food = food.filter(f=>{
        if(f.x===creature.x && f.y===creature.y){
            creature.energy += 40
            return false
        }
        return true
    })
}

/* ================= CREATURE ================= */

class Creature{

    constructor(brain=null){
        this.x = Math.random()*size|0
        this.y = Math.random()*size|0
        this.energy = 80
        this.brain = brain || new Brain()
    }

    update(){

        let nearestFood = getNearest(food,this.x,this.y)
        let nearestPred = getNearest(predators,this.x,this.y)

        let inputs = [
            (nearestFood?.x - this.x || 0)/size,
            (nearestFood?.y - this.y || 0)/size,
            (nearestPred?.x - this.x || 0)/size,
            (nearestPred?.y - this.y || 0)/size,
            this.energy/100,
            Math.random(),
            this.x/size,
            this.y/size,
            food.length/100
        ]

        let output = this.brain.think(inputs)

        this.x += output[0] > 0 ? 1 : -1
        this.y += output[1] > 0 ? 1 : -1

        this.x = clamp(this.x)
        this.y = clamp(this.y)

        this.energy -= 0.5

        eatFood(this)

        if(this.energy > 150){

            let childBrain = this.brain.clone()
            childBrain.mutate()

            creatures.push(new Creature(childBrain))

            this.energy -= 70
        }
    }

    draw(){

        ctx.fillStyle = "cyan"
        ctx.beginPath()
        ctx.arc(
            this.x*cell+cell/2,
            this.y*cell+cell/2,
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
        this.x = Math.random()*size|0
        this.y = Math.random()*size|0
    }

    update(){

        let target = getNearest(creatures,this.x,this.y)

        if(target){
            if(target.x > this.x) this.x++
            if(target.x < this.x) this.x--
            if(target.y > this.y) this.y++
            if(target.y < this.y) this.y--
        }

        this.x = clamp(this.x)
        this.y = clamp(this.y)

        creatures = creatures.filter(c=>{
            if(c.x===this.x && c.y===this.y){
                return false
            }
            return true
        })
    }

    draw(){

        ctx.fillStyle="red"

        ctx.beginPath()
        ctx.moveTo(this.x*cell, this.y*cell - cell/2)
        ctx.lineTo(this.x*cell - cell/2, this.y*cell + cell/2)
        ctx.lineTo(this.x*cell + cell/2, this.y*cell + cell/2)
        ctx.closePath()
        ctx.fill()
    }
}

/* ================= INITIALISATION ================= */

creatures = Array.from({length:15},()=>new Creature())
predators = Array.from({length:3},()=>new Predator())

/* ================= LOOP ================= */

function loop(){

    spawnFood()

    // fond
    ctx.fillStyle="#0b1425"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    // zones ecosystem
    let zoneWidth = size/3

    for(let z=0;z<3;z++){
        ctx.fillStyle = `rgba(${z*80},0,80,0.2)`
        ctx.fillRect(z*zoneWidth*cell,0,zoneWidth*cell,canvas.height)
    }

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

    creatures = creatures.filter(c=>c.energy>0)

    requestAnimationFrame(loop)
}

loop()
