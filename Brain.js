/* =====================================================
   EVOLUTION BRAIN
===================================================== */

class Brain{

constructor(inputSize=9,hiddenSize=24,outputSize=3){

this.inputSize=inputSize
this.hiddenSize=hiddenSize
this.outputSize=outputSize

this.w1=this.randomMatrix(hiddenSize,inputSize)
this.b1=this.randomArray(hiddenSize)

this.w2=this.randomMatrix(outputSize,hiddenSize)
this.b2=this.randomArray(outputSize)
}

think(inputs){

let hidden=[]

for(let i=0;i<this.hiddenSize;i++){

let sum=this.b1[i]

for(let j=0;j<this.inputSize;j++){
sum+=(inputs[j]||0)*this.w1[i][j]
}

hidden[i]=Math.tanh(sum)
}

let output=[]

for(let i=0;i<this.outputSize;i++){

let sum=this.b2[i]

for(let j=0;j<this.hiddenSize;j++){
sum+=hidden[j]*this.w2[i][j]
}

output[i]=Math.tanh(sum)
}

return output
}

clone(){

let b=new Brain(this.inputSize,this.hiddenSize,this.outputSize)

b.w1=JSON.parse(JSON.stringify(this.w1))
b.w2=JSON.parse(JSON.stringify(this.w2))
b.b1=[...this.b1]
b.b2=[...this.b2]

return b
}

mutate(rate=0.1){

this.mutateMatrix(this.w1,rate)
this.mutateMatrix(this.w2,rate)
}

randomMatrix(r,c){

let m=[]
for(let i=0;i<r;i++){
m[i]=[]
for(let j=0;j<c;j++){
m[i][j]=(Math.random()*2-1)*0.5
}
}
return m
}

randomArray(size){
return Array.from({length:size},()=> (Math.random()*2-1)*0.5)
}

mutateMatrix(matrix,rate){

for(let i=0;i<matrix.length;i++){
for(let j=0;j<matrix[i].length;j++){
if(Math.random()<rate){
matrix[i][j]+=(Math.random()*2-1)*0.3
}
}
}

}

}
