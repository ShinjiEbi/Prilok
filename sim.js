const size = 60
const cell = 10
const canvas = document.getElementById("world")
const ctx = canvas.getContext("2d")

canvas.width = size * cell
canvas.height = size * cell

let creatures = []
let food = []

class Creature {

    constructor(brain = null) {

        this.x = Math.random() * size | 0
        this.y = Math.random() * size | 0
        this.energy = 60
        this.brain = brain || new Brain()
    }

    update() {

        let nearestFood = food[0]
        let dx = nearestFood ? nearestFood.x - this.x : 0
        let dy = nearestFood ? nearestFood.y - this.y : 0

        let inputs = [
            dx / size,
            dy / size,
            this.energy / 100,
            Math.random(),
            this.x / size,
            this.y / size
        ]

        let decision = this.brain.think(inputs)

        // Mouvement plus lent
        if (Math.abs(decision) > 0.3) {
            this.x += decision > 0 ? 1 : -1
        }

        if (Math.abs(decision) > 0.6) {
            this.y += decision > 0 ? 1 : -1
        }

        this.x = Math.max(0, Math.min(size - 1, this.x))
        this.y = Math.max(0, Math.min(size - 1, this.y))

        this.energy -= 0.2

        // Manger
        food = food.filter(f => {
            if (f.x === this.x && f.y === this.y) {
                this.energy += 25
                this.brain.learn(1, inputs)
                return false
            }
            return true
        })

        // Reproduction
        if (this.energy > 100) {

            let childBrain = this.brain.clone()
            childBrain.mutate()

            creatures.push(new Creature(childBrain))
            this.energy -= 50
        }
    }

    draw() {

        // Couleur dynamique selon énergie
        let green = Math.min(255, this.energy * 3)
        ctx.fillStyle = `rgb(0, ${green}, 255)`

        ctx.beginPath()
        ctx.arc(
            this.x * cell + cell / 2,
            this.y * cell + cell / 2,
            cell / 2.5,
            0,
            Math.PI * 2
        )
        ctx.fill()
    }
}

function spawnFood() {

    for (let i = 0; i < 10; i++) {

        food.push({
            x: Math.random() * size | 0,
            y: Math.random() * size | 0
        })
    }
}

creatures = Array.from({ length: 15 }, () => new Creature())

// 🔥 RALENTIR ICI
setInterval(() => {

    spawnFood()

    // Fond dégradé
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#050510")
    gradient.addColorStop(1, "#0f1f3d")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grille
    ctx.strokeStyle = "rgba(255,255,255,0.05)"
    for (let i = 0; i < size; i++) {
        ctx.beginPath()
        ctx.moveTo(i * cell, 0)
        ctx.lineTo(i * cell, canvas.height)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, i * cell)
        ctx.lineTo(canvas.width, i * cell)
        ctx.stroke()
    }

    // Dessin nourriture
    ctx.fillStyle = "lime"
    food.forEach(f => {
        ctx.fillRect(f.x * cell, f.y * cell, cell, cell)
    })

    creatures.forEach(c => {
        c.update()
        c.draw()
    })

    creatures = creatures.filter(c => c.energy > 0)

}, 200) // ⬅️ PLUS LENT (200ms = visibilité claire)

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
