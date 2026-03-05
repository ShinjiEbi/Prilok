const size = 60
const cell = 8
const canvas = document.getElementById("world")
const ctx = canvas.getContext("2d")

canvas.width = size*cell
canvas.height = size*cell

let creatures = []
let food = []

class Creature{

    constructor(brain=null){

        this.x = Math.random()*size|0
        this.y = Math.random()*size|0

        this.energy = 50
        this.brain = brain || new Brain()
    }

    update(){

        // --- perception ---
        let nearestFood = food[0]

        let dx = nearestFood ? nearestFood.x - this.x : 0
        let dy = nearestFood ? nearestFood.y - this.y : 0

        let inputs = [
            dx/size,
            dy/size,
            this.energy/100,
            Math.random(),
            this.x/size,
            this.y/size
        ]

        let decision = this.brain.think(inputs)

        // --- action ---
        this.x += decision > 0.2 ? 1 : -1
        this.y += decision > 0.5 ? 1 : -1

        this.x = Math.max(0,Math.min(size-1,this.x))
        this.y = Math.max(0,Math.min(size-1,this.y))

        this.energy -= 0.5

        // manger
        food = food.filter(f=>{
            if(f.x===this.x && f.y===this.y){
                this.energy += 20

                // apprentissage immédiat
                this.brain.learn(1,inputs)

                return false
            }
            return true
        })

        // reproduction
        if(this.energy > 90){

            let childBrain = this.brain.clone()
            childBrain.mutate()

            creatures.push(
                new Creature(childBrain)
            )

            this.energy -= 40
        }

    }

    draw(){
        ctx.fillStyle="cyan"
        ctx.fillRect(
            this.x*cell,
            this.y*cell,
            cell,
            cell
        )
    }
}

function spawnFood(){
    for(let i=0;i<20;i++){
        food.push({
            x: Math.random()*size|0,
            y: Math.random()*size|0
        })
    }
}

creatures = Array.from(
    {length:15},
    ()=> new Creature()
)

function loop(){

    spawnFood()

    ctx.fillStyle="#000"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    creatures.forEach(c=>{
        c.update()
        c.draw()
    })

    ctx.fillStyle="green"
    food.forEach(f=>{
        ctx.fillRect(f.x*cell,f.y*cell,cell,cell)
    })

    creatures = creatures.filter(c=>c.energy>0)

    requestAnimationFrame(loop)
}

loop()
