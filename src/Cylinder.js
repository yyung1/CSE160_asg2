class Cylinder {
  constructor() {
    this.type = 'Cylinder';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 36;
  }

  render() {
    let rgba = this.color;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    let segments = this.segments;
    
    for (let i = 0; i < segments; i++) {
      let theta = 2 * Math.PI * i / segments;
      let nextTheta = 2 * Math.PI * (i + 1) / segments;
      drawTriangle3D([
        0.0, 1.0, 0.0,
        Math.cos(theta), 1.0, Math.sin(theta),
        Math.cos(nextTheta), 1.0, Math.sin(nextTheta)
      ]);
    }

    for (let i = 0; i < segments; i++) {
      let theta = 2 * Math.PI * i / segments;
      let nextTheta = 2 * Math.PI * (i + 1) / segments;
      drawTriangle3D([
        0.0, 0.0, 0.0,
        Math.cos(nextTheta), 0.0, Math.sin(nextTheta),
        Math.cos(theta), 0.0, Math.sin(theta)
      ]);
    }

    for (let i = 0; i < segments; i++) {
      let theta = 2 * Math.PI * i / segments;
      let nextTheta = 2 * Math.PI * (i + 1) / segments;
      
      let top1 = [Math.cos(theta), 1.0, Math.sin(theta)];
      let bottom1 = [Math.cos(theta), 0.0, Math.sin(theta)];
      let top2 = [Math.cos(nextTheta), 1.0, Math.sin(nextTheta)];
      let bottom2 = [Math.cos(nextTheta), 0.0, Math.sin(nextTheta)];

      drawTriangle3D([
        top1[0], top1[1], top1[2],
        bottom1[0], bottom1[1], bottom1[2],
        bottom2[0], bottom2[1], bottom2[2]
      ]);
      drawTriangle3D([
        top1[0], top1[1], top1[2],
        bottom2[0], bottom2[1], bottom2[2],
        top2[0], top2[1], top2[2]
      ]);
    }
  }
}
