class Brain {

    constructor(weights=null){

        if(weights){
            this.w = weights
        }else{
            // 6 entrées → 1 sortie
            this.w = Array.from({length:6},
                ()=>Math.random()*2-1)
        }

        this.learningRate = 0.05
    }

    think(inputs){

        let sum = 0
        for(let i=0;i<this.w.length;i++){
            sum += inputs[i]*this.w[i]
        }

        return Math.tanh(sum)
    }

    learn(error, inputs){

        // apprentissage pendant la vie
        for(let i=0;i<this.w.length;i++){
            this.w[i] += this.learningRate * error * inputs[i]
        }
    }

    mutate(){
        this.w = this.w.map(v =>
            v + (Math.random()-0.5)*0.3
        )
    }

    clone(){
        return new Brain([...this.w])
    }
}
