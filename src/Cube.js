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
        // front
        drawTriangle3D([0.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 0.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   1.0, 1.0, 0.0]);

        drawTriangle3D([0.0, 0.0, 1.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 1.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0]);

        drawTriangle3D([0.0, 0.0, 0.0,   0.0, 1.0, 1.0,   0.0, 0.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 1.0]);

        drawTriangle3D([1.0, 0.0, 0.0,   1.0, 1.0, 1.0,   1.0, 0.0, 1.0]);
        drawTriangle3D([1.0, 0.0, 0.0,   1.0, 1.0, 0.0,   1.0, 1.0, 1.0]);

        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);

        drawTriangle3D([0.0, 1.0, 0.0,   1.0, 1.0, 1.0,   1.0, 1.0, 0.0]);
        drawTriangle3D([0.0, 1.0, 0.0,   0.0, 1.0, 1.0,   1.0, 1.0, 1.0]);

        drawTriangle3D([0.0, 0.0, 0.0,   1.0, 0.0, 1.0,   1.0, 0.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0,   0.0, 0.0, 1.0,   1.0, 0.0, 1.0]);
    }
}
