// ===============================
// 🔥 ECOSYSTEM LIVE CONTROL
// ===============================

const size = 50
const cell = 12
const canvas = document.getElementById("world")
const ctx = canvas.getContext("2d")

canvas.width = size * cell
canvas.height = size * cell

// ===============================
// 🎛 PARAMÈTRES MODIFIABLES
// ===============================

let updateDelay = 400
let predatorSpeed = 0.2
let predatorCount = 3
let creatureCount = 15
let foodSpawnRate = 15
let friction = 0.92

let creatures = []
let predators = []
let food = []

let lastUpdate = 0

// ===============================
// 🔧 UTILITAIRES
// ===============================

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

// ===============================
// 🌱 NOURRITURE
// ===============================

function spawnFood(){

    for(let i=0;i<foodSpawnRate;i++){

        if(Math.random()<0.5){

            food.push({
                x:Math.random()*size|0,
                y:Math.random()*size|0
            })
        }
    }
}

function eatFood(creature){

    food = food.filter(f=>{

        if(Math.floor(f.x)===Math.floor(creature.x) &&
           Math.floor(f.y)===Math.floor(creature.y)){

            creature.energy += 40
            return false
        }

        return true
    })
}

// ===============================
// 🧠 CREATURE
// ===============================

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

        // Vision murs
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

        // Physique réaliste
        let speed=0.2

        this.vx += output[0]*speed
        this.vy += output[1]*speed

        this.vx *= friction
        this.vy *= friction

        this.x += this.vx
        this.y += this.vy

        this.x=clamp(this.x)
        this.y=clamp(this.y)

        this.energy -= 0.3

        eatFood(this)

        // Reproduction proximité
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

// ===============================
// 🔴 PREDATEUR
// ===============================

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

            this.x+=Math.sign(dx)*predatorSpeed
            this.y+=Math.sign(dy)*predatorSpeed
        } else {

            this.x+=(Math.random()-0.5)*0.1
            this.y+=(Math.random()-0.5)*0.1
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

// ===============================
// 🌍 INITIALISATION
// ===============================

creatures=Array.from({length:creatureCount},()=>new Creature())
predators=Array.from({length:predatorCount},()=>new Predator())

// ===============================
// 🎛 PARAMÈTRES LIVE
// ===============================

function updateParams(){

    updateDelay=parseInt(document.getElementById("speed").value)
    predatorSpeed=parseFloat(document.getElementById("predSpeed").value)
    predatorCount=parseInt(document.getElementById("predCount").value)
    creatureCount=parseInt(document.getElementById("creatureCount").value)
    foodSpawnRate=parseInt(document.getElementById("foodSpawn").value)
    friction=parseFloat(document.getElementById("friction").value)
}

// ===============================
// 🔄 LOOP PRINCIPAL
// ===============================

function loop(timestamp){

    updateParams()

    if(timestamp-lastUpdate<updateDelay){
        requestAnimationFrame(loop)
        return
    }

    lastUpdate=timestamp

    spawnFood()

    ctx.fillStyle="#0b1425"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    // Nourriture
    food.forEach(f=>{
        ctx.fillStyle="lime"
        ctx.fillRect(f.x*cell,f.y*cell,cell,cell)
    })

    // Créatures
    creatures.forEach(c=>{
        c.update()
        c.draw()
    })

    // Prédateurs
    predators.forEach(p=>{
        p.update()
        p.draw()
    })

    creatures=creatures.filter(c=>c.energy>0)

    requestAnimationFrame(loop)
}

loop()
