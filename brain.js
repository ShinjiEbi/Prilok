class Brain{

    constructor(){

        // petit réseau simple
        this.weights=[]

        for(let i=0;i<12;i++){
            this.weights[i]=Math.random()*2-1
        }

        this.bias=Math.random()*2-1
    }

    think(inputs){

        let outputs=[0,0]

        // sécurité si mauvais input
        if(!inputs) return outputs

        let sum=0

        for(let i=0;i<this.weights.length;i++){
            sum += (inputs[i]||0) * this.weights[i]
        }

        sum += this.bias

        // activation tanh
        let activated=Math.tanh(sum)

        outputs[0]=activated
        outputs[1]=Math.tanh(sum*0.5)

        return outputs
    }

    clone(){

        let b=new Brain()

        b.weights=[...this.weights]
        b.bias=this.bias

        return b
    }

    mutate(){

        for(let i=0;i<this.weights.length;i++){

            if(Math.random()<0.1){
                this.weights[i]+= (Math.random()*2-1)*0.3
            }
        }

        if(Math.random()<0.1){
            this.bias += (Math.random()*2-1)*0.5
        }
    }
}
