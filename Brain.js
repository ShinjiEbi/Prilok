class Brain {

    constructor(inputSize = 10, hiddenSize = 32, outputSize = 8) {

        this.inputSize = inputSize
        this.hiddenSize = hiddenSize
        this.outputSize = outputSize

        this.w1 = this.randomMatrix(hiddenSize, inputSize)
        this.b1 = this.randomArray(hiddenSize)

        this.w2 = this.randomMatrix(outputSize, hiddenSize)
        this.b2 = this.randomArray(outputSize)
    }

    think(inputs) {

        let hidden = []

        for (let i = 0; i < this.hiddenSize; i++) {

            let sum = this.b1[i]

            for (let j = 0; j < this.inputSize; j++) {
                sum += (inputs[j] || 0) * this.w1[i][j]
            }

            hidden[i] = Math.tanh(sum)
        }

        let output = []

        for (let i = 0; i < this.outputSize; i++) {

            let sum = this.b2[i]

            for (let j = 0; j < this.hiddenSize; j++) {
                sum += hidden[j] * this.w2[i][j]
            }

            output[i] = Math.tanh(sum)
        }

        return output
    }

    mutate(rate = 0.08) {
        this.mutateMatrix(this.w1, rate)
        this.mutateMatrix(this.w2, rate)
        this.mutateArray(this.b1, rate)
        this.mutateArray(this.b2, rate)
    }

    clone() {

        let clone = new Brain(this.inputSize, this.hiddenSize, this.outputSize)

        clone.w1 = JSON.parse(JSON.stringify(this.w1))
        clone.w2 = JSON.parse(JSON.stringify(this.w2))
        clone.b1 = [...this.b1]
        clone.b2 = [...this.b2]

        return clone
    }

    randomMatrix(rows, cols) {

        let m = []

        for (let i = 0; i < rows; i++) {
            m[i] = []
            for (let j = 0; j < cols; j++) {
                m[i][j] = (Math.random() * 2 - 1) * 0.7
            }
        }

        return m
    }

    randomArray(size) {
        return Array.from({ length: size },
            () => (Math.random() * 2 - 1) * 0.7
        )
    }

    mutateMatrix(matrix, rate) {

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {

                if (Math.random() < rate) {
                    matrix[i][j] += (Math.random() * 2 - 1) * 0.4
                }
            }
        }
    }

    mutateArray(array, rate) {

        for (let i = 0; i < array.length; i++) {
            if (Math.random() < rate) {
                array[i] += (Math.random() * 2 - 1) * 0.5
            }
        }
    }
}
