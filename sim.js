const size = 60
const cell = 8

const canvas = document.getElementById("world")
const ctx = canvas.getContext("2d")

canvas.width = size*cell
canvas.height = size*cell

let creatures = []
let food = []

function rand(n){
    return Math.floor(Math.random()*n)
}

function createCreature(){
    return {
        x: rand(size),
        y: rand(size),
        energy: 50,
        speed: Math.random()*1.5 + 0.2,
        vision: rand(6)+2
    }
}

for(let i=0;i<25;i++){
    creatures.push(createCreature())
}

function spawnFood(){
    for(let i=0;i<30;i++){
        food.push({
            x: rand(size),
            y: rand(size)
        })
    }
}

function distance(a,b){
    return Math.hypot(a.x-b.x,a.y-b.y)
}

function step(){

    spawnFood()

    creatures.forEach(c=>{

        let target=null
        let best=999

        food.forEach(f=>{
            let d=distance(c,f)
            if(d<c.vision && d<best){
                best=d
                target=f
            }
        })

        if(target){

            if(target.x>c.x)c.x++
            if(target.x<c.x)c.x--
            if(target.y>c.y)c.y++
            if(target.y<c.y)c.y--

        }else{

            if(Math.random()<c.speed){
                c.x+=rand(3)-1
                c.y+=rand(3)-1
            }

        }

        c.x=Math.max(0,Math.min(size-1,c.x))
        c.y=Math.max(0,Math.min(size-1,c.y))

        c.energy -= 1 + c.speed*0.2

        food = food.filter(f=>{

            if(f.x==c.x && f.y==c.y){
                c.energy+=20
                return false
            }

            return true
        })

        if(c.energy>90){

            let child = {...c}

            child.speed += (Math.random()-0.5)*0.2
            child.vision += rand(3)-1

            child.energy=40
            c.energy-=40

            creatures.push(child)

        }

    })

    creatures = creatures.filter(c=>c.energy>0)
}

function draw(){

    ctx.fillStyle="#081018"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    ctx.fillStyle="#2ecc71"

    food.forEach(f=>{
        ctx.fillRect(f.x*cell,f.y*cell,cell,cell)
    })

    creatures.forEach(c=>{

        ctx.fillStyle=`hsl(${c.speed*200},80%,60%)`

        ctx.fillRect(
            c.x*cell,
            c.y*cell,
            cell,
            cell
        )
    })

}

function stats(){

    if(creatures.length==0)return

    let avgSpeed = creatures.reduce((a,b)=>a+b.speed,0)/creatures.length
    let avgVision = creatures.reduce((a,b)=>a+b.vision,0)/creatures.length

    document.getElementById("stats").innerText =
        "Population: "+creatures.length+
        " | Vitesse moy: "+avgSpeed.toFixed(2)+
        " | Vision moy: "+avgVision.toFixed(2)

}

function loop(){

    step()
    draw()
    stats()

}

setInterval(loop,100)
