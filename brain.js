class Brain {

    constructor(weights=null){

        this.inputSize = 12
        this.hiddenSize = 16
        this.outputSize = 4

        this.w1 = weights?.w1 || this.randomMatrix(this.hiddenSize,this.inputSize)
        this.w2 = weights?.w2 || this.randomMatrix(this.outputSize,this.hiddenSize)

        this.memory = Math.random()
    }

    randomMatrix(rows,cols){
        return Array.from({length:rows},()=> 
            Array.from({length:cols},()=>Math.random()*2-1)
        )
    }

    activate(x){
        return Math.tanh(x)
    }

    think(inputs){

        inputs.push(this.memory)

        let hidden = this.w1.map(row =>
            this.activate(row.reduce((s,w,i)=>s+w*inputs[i],0))
        )

        let output = this.w2.map(row =>
            this.activate(row.reduce((s,w,i)=>s+w*hidden[i],0))
        )

        this.memory = output[0]

        return output
    }

    mutate(){

        function mutateMatrix(m){
            return m.map(row =>
                row.map(v=> v + (Math.random()-0.5)*0.2)
            )
        }

        this.w1 = mutateMatrix(this.w1)
        this.w2 = mutateMatrix(this.w2)
    }

    clone(){
        return new Brain({
            w1: JSON.parse(JSON.stringify(this.w1)),
            w2: JSON.parse(JSON.stringify(this.w2))
        })
    }
}
