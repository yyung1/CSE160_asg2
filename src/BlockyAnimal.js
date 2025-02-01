// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  void main() {
    gl_Position = a_Position * u_ModelMatrix;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  
  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;

function addActionsfromHtmlUI() {
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clearButton').onclick = function() { gl.clear(gl.COLOR_BUFFER_BIT); g_shapesList = []; renderAllShapes();};
  
  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE};
  document.getElementById('cirButton').onclick = function() { g_selectedType=CIRCLE};

  document.getElementById('sunButton').onclick = function() { drawSun(); };
  
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100;});
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100;});
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100;});

  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value;});
}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsfromHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
/*
var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = [];
*/

function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Store the coordinates to g_points array
  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE){
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  // Store the coordinates to g_colors array
  /*
  g_colors.push(g_selectedColor.slice());
  g_sizes.push(g_selectedSize);

  
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
  */

  renderAllShapes();
}

 function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
 }

 function renderAllShapes() {
  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
    /*
    var xy = g_shapesList[i].position;
    var rgba = g_shapesList[i].color;
    var size = g_shapesList[i].size;

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniform1f(u_Size, size);
    
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
    */
  }
 }

function drawSun() {
    // Center coordinates
    const sunShapes = [];
    const centerX = 0.0;
    const centerY = 0.0;

    const innerRadius = 0.2; // Radius of the polygon
    const rayRadius = 0.25; // Start of the rays
    const rayLength = 0.2; // Length of the rays
    const innerRayLength = 0.14;
    const baseMult = 0.7; // Factor to reduce the base width of the rays

    // Number of sides for the polygon
    const sides = 20;

    gl.uniform4f(u_FragColor, 1.0, 0.45, 0.0, 1.0);
    // Draw the center polygon
    const polyVertices = [];
    for (let i = 0; i < sides; i++) {
        const angle1 = (i * 2 * Math.PI) / sides;
        const angle2 = ((i + 1) * 2 * Math.PI) / sides;
        polyVertices.push(centerX, centerY);
        polyVertices.push(centerX + innerRadius * Math.cos(angle1), centerY + innerRadius * Math.sin(angle1));
        polyVertices.push(centerX + innerRadius * Math.cos(angle2), centerY + innerRadius * Math.sin(angle2));
    }
    drawTriangles(polyVertices);

    // Draw the rays
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);
    const rayVertices = [];
    const innerRayVertices = [];
    for (let i = 0; i < sides; i += 2) { // Skip every other side
        const angle1 = (i * 2 * Math.PI) / sides;
        const angle2 = ((i + 1) * 2 * Math.PI) / sides;
        const baseAngle1 = angle1 + (1 - baseMult) * (angle2 - angle1) / 2;
        const baseAngle2 = angle2 - (1 - baseMult) * (angle2 - angle1) / 2;

        const base1X = centerX + rayRadius * Math.cos(baseAngle1);
        const base1Y = centerY + rayRadius * Math.sin(baseAngle1);

        const base2X = centerX + rayRadius * Math.cos(baseAngle2);
        const base2Y = centerY + rayRadius * Math.sin(baseAngle2);

        const tipX = centerX + (rayRadius + rayLength) * Math.cos((angle1 + angle2) / 2);
        const tipY = centerY + (rayRadius + rayLength) * Math.sin((angle1 + angle2) / 2);

        const innerBase1X = centerX + (rayRadius * 1) * Math.cos(baseAngle1); // Adjusted inner base
        const innerBase1Y = centerY + (rayRadius * 1) * Math.sin(baseAngle1);

        const innerBase2X = centerX + (rayRadius * 1) * Math.cos(baseAngle2); // Adjusted inner base
        const innerBase2Y = centerY + (rayRadius * 1) * Math.sin(baseAngle2);

        const innerTipX = centerX + (rayRadius + innerRayLength) * Math.cos((angle1 + angle2) / 2); // Adjusted inner tip
        const innerTipY = centerY + (rayRadius + innerRayLength) * Math.sin((angle1 + angle2) / 2);

        
        rayVertices.push(base1X, base1Y, base2X, base2Y, tipX, tipY);
        innerRayVertices.push(innerBase1X, innerBase1Y, innerBase2X, 
            innerBase2Y, innerTipX, innerTipY);
    }
    drawTriangles(rayVertices);
    gl.uniform4f(u_FragColor, 1.0, 0.4, 0.0, 1.0);
    drawTriangles(innerRayVertices);
}

function drawTriangles(vertices) {
    const n = vertices.length / 2;

    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, n);
}
