class Cube {
    constructor() {
        this.type = 'Cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size = 5.0;
        // this.segments = 50; // Number of segments
        this.matrix = new Matrix4();      
    }

    render() {
        // const xy = this.position;
        var rgba = this.color;
        // const size = this.size;
        // const d = size / 400.0;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        drawTriangle3D([0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0]);
        drawTriangle3D([0.0,0.0,0.0,  0.0,1.0,0.0,  1.0,1.0,0.0]); 
        /* const vertices = this.genCircleVertices(xy[0], xy[1], d);

        const vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return;
        }

        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        // Draw the circle as a triangle fan
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.segments + 2);
    }

    genCircleVertices(centerX, centerY, radius) {
        const vertices = [centerX, centerY]; // Center point of the circle
        for (let i = 0; i <= this.segments; i++) {
            const angle = (i * 2 * Math.PI) / this.segments;
            vertices.push(centerX + radius * Math.cos(angle));
            vertices.push(centerY + radius * Math.sin(angle));
        }
        return vertices; */
    }
}
