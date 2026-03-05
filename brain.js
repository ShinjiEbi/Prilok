class Brain{

    constructor(weights=null){

        this.inputSize = 4
        this.hiddenSize = 8
        this.outputSize = 2

        this.weights = weights || this.randomWeights()
    }

    /* ================= INIT RANDOM ================= */

    randomWeights(){

        let weights=[]

        for(let i=0;i<this.inputSize;i++){
            weights[i]=[]
            for(let h=0;h<this.hiddenSize;h++){
                weights[i][h]=Math.random()*2-1
            }
        }

        this.hiddenBias = Array.from({length:this.hiddenSize},
            ()=>Math.random()*2-1)

        this.outputWeights=[]
        for(let h=0;h<this.hiddenSize;h++){
            this.outputWeights[h]=[]
            for(let o=0;o<this.outputSize;o++){
                this.outputWeights[h][o]=Math.random()*2-1
            }
        }

        this.outputBias = Array.from({length:this.outputSize},
            ()=>Math.random()*2-1)

        return {
            input:this.weights,
            hiddenBias:this.hiddenBias,
            output:this.outputWeights,
            outputBias:this.outputBias
        }
    }

    /* ================= ACTIVATION ================= */

    sigmoid(x){
        return 1/(1+Math.exp(-x))
    }

    /* ================= THINK ================= */

    think(inputs){

        let hidden=[]

        for(let h=0;h<this.hiddenSize;h++){

            let sum=this.weights.input.reduce((acc,inputRow,i)=>{
                return acc + inputs[i]*inputRow[h]
            },0)

            sum += this.weights.hiddenBias[h]

            hidden[h]=this.sigmoid(sum)
        }

        let output=[]

        for(let o=0;o<this.outputSize;o++){

            let sum=0

            for(let h=0;h<this.hiddenSize;h++){
                sum += hidden[h]*this.weights.output[h][o]
            }

            sum += this.weights.outputBias[o]

            output[o]=Math.tanh(sum)
        }

        return output
    }

    /* ================= MUTATION ================= */

    mutate(rate=0.1){

        function mutateValue(v){
            if(Math.random()<rate){
                return v + (Math.random()*2-1)*0.5
            }
            return v
        }

        for(let i=0;i<this.inputSize;i++){
            for(let h=0;h<this.hiddenSize;h++){
                this.weights.input[i][h] =
                    mutateValue(this.weights.input[i][h])
            }
        }

        for(let h=0;h<this.hiddenSize;h++){
            this.weights.hiddenBias[h] =
                mutateValue(this.weights.hiddenBias[h])
        }

        for(let h=0;h<this.hiddenSize;h++){
            for(let o=0;o<this.outputSize;o++){
                this.weights.output[h][o] =
                    mutateValue(this.weights.output[h][o])
            }
        }

        for(let o=0;o<this.outputSize;o++){
            this.weights.outputBias[o] =
                mutateValue(this.weights.outputBias[o])
        }
    }

    /* ================= CLONE ================= */

    clone(){

        let newBrain = new Brain(JSON.parse(JSON.stringify(this.weights)))

        return newBrain
    }
}
