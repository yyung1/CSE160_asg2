// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_GlobalRotateMatrix;

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
  gl.enable(gl.DEPTH_TEST);
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

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identifyM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identifyM.elements);
  
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_limbAngle = 0;
let g_lowerArmAngle = 0;
let g_footAngle = 0;
let g_limbMaxAngle = 40;
let g_headMaxAngle = 5;
let g_limbAnimation = false;
let g_disassembleRP = false;
let g_fallHeight = 0;
let g_tailAngle = 0;
let g_headAngle = 0;
let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
var legWidth = 0.1;
var legHeight = 0.15;
var legDepth = 0.1;
var footWidth = legWidth;
var footHeight = 0.05;
var footDepth = -0.12;


function addActionsfromHtmlUI() {
  /* document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  document.getElementById('clearButton').onclick = function() { gl.clear(gl.COLOR_BUFFER_BIT); g_shapesList = []; renderAllShapes();};
  
  document.getElementById('pointButton').onclick = function() { g_selectedType=POINT};
  document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE};
  document.getElementById('cirButton').onclick = function() { g_selectedType=CIRCLE};

  document.getElementById('sunButton').onclick = function() { drawSun(); }; */
  document.getElementById('animationButton').onclick = function(e) { 
    if (e.shiftKey) {
      /* g_disassembleRP = true;
      this.textContent = "Disassembled";
      disassembleRedPanda(); */
    } else {
      g_limbAnimation = !g_limbAnimation;
      this.textContent = g_limbAnimation ? "Disable" : "Enable";
    }
   };
  
  /* document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100;});
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100;});
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100;});
 */
  // document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value;});

  document.getElementById('angleXSlide').addEventListener('mousemove', function() { g_globalAngleX = this.value; /* renderAllShapes(); */renderScene(); });
  document.getElementById('angleYSlide').addEventListener('mousemove', function() { g_globalAngleY = this.value; /* renderAllShapes(); */renderScene(); });
  document.getElementById('limbSlide').addEventListener('mousemove', function() { 
    g_limbAngle = this.value; /* renderAllShapes(); */
    document.getElementById("lowerArmSlider").value = Math.abs(g_limbAngle/2);
    g_lowerArmAngle = Math.abs(g_limbAngle/2);
    document.getElementById("footSlider").value = Math.abs(g_limbAngle/2);
    g_footAngle = Math.abs(g_limbAngle/2);
    renderScene(); 
  });
  document.getElementById("lowerArmSlider").addEventListener("mousemove", function() { g_lowerArmAngle = this.value; renderScene(); });
  document.getElementById("footSlider").addEventListener("mousemove", function() { g_footAngle = this.value; renderScene(); });
  document.getElementById('tailSlide').addEventListener('mousemove', function() { g_tailAngle = this.value; /* renderAllShapes(); */renderScene(); });
  document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; /* renderAllShapes(); */renderScene(); });
  document.addEventListener("mousedown", function(ev) {
    mouseDown = true;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
  });
  
  document.addEventListener("mouseup", function(ev) {
    mouseDown = false;
  });
  
  document.addEventListener("mousemove", function(ev) {
    if (!mouseDown) return;
    let dx = ev.clientX - lastMouseX;
    let dy = ev.clientY - lastMouseY;
    // Adjust the global rotation angles (for example, g_globalAngleY for y-axis, g_globalAngleX for x-axis)
    g_globalAngleY += dx * 0.5;
    g_globalAngleX += dy * 0.5;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
    renderScene();
  });
}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsfromHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.2, 0.2, 0.2, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);

  renderScene();
  // renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
var g_prevSeconds = g_seconds;
var fpsCounter = document.getElementById("fps");

function tick() {
  g_seconds = performance.now()/1000.0-g_startTime;
  // console.log(g_seconds);
  var dT = g_seconds - g_prevSeconds;
  g_prevSeconds = g_seconds;

  var fps = dT > 0 ? (1.0 / dT) : 0;
  
  // Update the FPS display:
  if (fpsCounter) {
    fpsCounter.textContent = "FPS: " + fps.toFixed(2);
  }

  updateAnimationAngle();

  if (g_disassembleRP) {
    disassembleRedPanda();
  }

  // renderAllShapes();
  renderScene();

  requestAnimationFrame(tick);
}

function updateAnimationAngle() {
  if (g_limbAnimation) {
    g_limbAngle = (g_limbMaxAngle * Math.sin(g_seconds*3.6));
  }
}

var g_shapesList = [];
//var // g_redPandaParts = [];
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

  var globalRotMat = new Matrix4().rotate(g_globalAngleX,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.matrix.setTranslate(-.25, -.5, 0.0);
  body.matrix.scale(.5,1,.5);
  body.render();

  var leftArm = new Cube();
  leftArm.color = [1.0,1.0,0.0,1.0];
  leftArm.matrix.setTranslate(.7, 0, 0.0);
  leftArm.matrix.rotate(45, 0, 0.0,1);
  leftArm.matrix.scale(.25, .7, .5);
  leftArm.render();

  var box = new Cube();
  box.color = [1.0,1.0,0.0,1.0];
  box.matrix.setTranslate(0, 0, -.5,0);
  box.matrix.rotate(-30, 1, 0.0,0);
  box.matrix.scale(.5, .5, .5);
  box.render();
  

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

function renderScene() {

  var globalRotMat = new Matrix4().rotate(g_globalAngleX,0,1,0);
  globalRotMat.rotate(g_globalAngleY,1,0,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawAnimal();
}

function drawAnimal() {
  // g_redPandaParts = [];

  if(g_limbAnimation) {
    g_limbAngle = g_limbMaxAngle * Math.sin(g_seconds*3.6);
    g_headAngle = g_headMaxAngle * Math.sin(g_seconds*3.6);
  } else {
    // g_limbAngle = Number(document.getElementById('limbSlide').value);
  }

  var bodyTransform = new Matrix4();
  bodyTransform.setTranslate(-0.25, -0.5, 0.0);

  // Draw the body bottom
  var bodyBottom = new Cube();
  bodyBottom.color = [0, 0, 0, 1];
  bodyBottom.matrix.set(bodyTransform);
  bodyBottom.matrix.scale(0.5, 0.025, 0.25);
  bodyBottom.render();
  // g_redPandaParts.push(bodyBottom);

  var bodyTop = new Cube();
  bodyTop.color = [0.8, 0.4, 0.0, 1.0];
  bodyTop.matrix.set(bodyTransform);
  bodyTop.matrix.translate(0, 0.025, 0);
  bodyTop.matrix.scale(0.5, 0.175, 0.25);
  bodyTop.render();
  // g_redPandaParts.push(bodyTop);

  var headTransform = new Matrix4();
  headTransform.setTranslate(-0.52, -0.5, -0.02);
  headTransform.translate(0.5,0, 0.5);
  headTransform.rotate(-g_headAngle, 0, 0, 1);
  headTransform.translate(-0.5,0, -0.5);

  var head = new Cube();
  head.color = [0.8, 0.4, 0.0, 1.0];
  head.matrix.set(headTransform);
  head.matrix.scale(0.29, 0.24, 0.29);
  head.render();

  var head2 = new Cube();
  head2.color = [0, 0, 0, 0];
  head2.matrix.set(headTransform);
  head2.matrix.translate(-0.06, 0, 0.09);
  head2.matrix.scale(0.07, 0.11, 0.11);
  head2.render();

  var nose = new Cube();
  nose.color = [0, 0, 0, 1];
  nose.matrix.set(headTransform);
  nose.matrix.translate(-0.08, 0.045, 0.12);
  nose.matrix.scale(0.02, 0.045, 0.05);
  nose.render();

  var earWidth = 0.12;
  var earHeight = 0.12;
  var earDepth = 0.065;
  var frameThickness = 0.02;
  var innerPanelDepth = 0.005;

  // Left ear
  var leftEarTransform = new Matrix4(headTransform);
  leftEarTransform.translate(0.22, 0.18, -0.06);
  leftEarTransform.rotate(-90, 0, 1, 0);

  var leftEarTop = new Cube();
  leftEarTop.color = [1.0, 1.0, 1.0, 1.0];
  leftEarTop.matrix.set(leftEarTransform);
  leftEarTop.matrix.translate(0, earHeight - frameThickness, 0);
  leftEarTop.matrix.scale(earWidth, frameThickness, earDepth);
  leftEarTop.render();
  // g_redPandaParts.push(leftEarTop);

  var leftEarBottom = new Cube();
  leftEarBottom.color = [1.0, 1.0, 1.0, 1.0];
  leftEarBottom.matrix.set(leftEarTransform);
  leftEarBottom.matrix.translate(0, 0, 0);
  leftEarBottom.matrix.scale(earWidth, frameThickness, earDepth);
  leftEarBottom.render();
  // g_redPandaParts.push(leftEarBottom);

  var leftEarLeft = new Cube();
  leftEarLeft.color = [1.0, 1.0, 1.0, 1.0];
  leftEarLeft.matrix.set(leftEarTransform);
  leftEarLeft.matrix.translate(0, frameThickness, 0);
  leftEarLeft.matrix.scale(frameThickness, earHeight - 2 * frameThickness, earDepth);
  leftEarLeft.render();
  // g_redPandaParts.push(leftEarLeft);

  var leftEarRight = new Cube();
  leftEarRight.color = [1.0, 1.0, 1.0, 1.0];
  leftEarRight.matrix.set(leftEarTransform);
  leftEarRight.matrix.translate(earWidth - frameThickness, frameThickness, 0);
  leftEarRight.matrix.scale(frameThickness, earHeight - 2 * frameThickness, earDepth);
  leftEarRight.render();
  // g_redPandaParts.push(leftEarRight);

  var leftEarInner = new Cube();
  leftEarInner.color = [0.0, 0.0, 0.0, 1.0];
  leftEarInner.matrix.set(leftEarTransform);
  leftEarInner.matrix.translate(frameThickness, frameThickness, (earDepth - innerPanelDepth) * 0.5);
  leftEarInner.matrix.scale(earWidth - 2 * frameThickness, earHeight - 2 * frameThickness, innerPanelDepth);
  leftEarInner.render();
  // g_redPandaParts.push(leftEarInner);

  var leftEarBack = new Cube();
  leftEarBack.color = [1.0, 1.0, 1.0, 1.0];
  leftEarBack.matrix.set(leftEarTransform);
  // leftEarBack.matrix.translate(frameThickness, frameThickness, -(earDepth - innerPanelDepth) * 0.5);
  leftEarBack.matrix.scale(earWidth, earHeight, innerPanelDepth);
  leftEarBack.render();
  // g_redPandaParts.push(leftEarBack);

  // Right ear
  var rightEarTransform = new Matrix4(headTransform);
  rightEarTransform.translate(0.22, 0.18, 0.23);
  rightEarTransform.rotate(-90, 0, 1, 0);

  var rightEarTop = new Cube();
  rightEarTop.color = [1.0, 1.0, 1.0, 1.0];
  rightEarTop.matrix.set(rightEarTransform);
  rightEarTop.matrix.translate(0, earHeight - frameThickness, 0);
  rightEarTop.matrix.scale(earWidth, frameThickness, earDepth);
  rightEarTop.render();
  // g_redPandaParts.push(rightEarTop);

  var rightEarBottom = new Cube();
  rightEarBottom.color = [1.0, 1.0, 1.0, 1.0];
  rightEarBottom.matrix.set(rightEarTransform);
  rightEarBottom.matrix.translate(0, 0, 0);
  rightEarBottom.matrix.scale(earWidth, frameThickness, earDepth);
  rightEarBottom.render();
  // g_redPandaParts.push(rightEarBottom);

  var rightEarLeft = new Cube();
  rightEarLeft.color = [1.0, 1.0, 1.0, 1.0];
  rightEarLeft.matrix.set(rightEarTransform);
  rightEarLeft.matrix.translate(0, frameThickness, 0);
  rightEarLeft.matrix.scale(frameThickness, earHeight - 2 * frameThickness, earDepth);
  rightEarLeft.render();
  // g_redPandaParts.push(rightEarLeft);

  var rightEarRight = new Cube();
  rightEarRight.color = [1.0, 1.0, 1.0, 1.0];
  rightEarRight.matrix.set(rightEarTransform);
  rightEarRight.matrix.translate(earWidth - frameThickness, frameThickness, 0);
  rightEarRight.matrix.scale(frameThickness, earHeight - 2 * frameThickness, earDepth);
  rightEarRight.render();
  // g_redPandaParts.push(rightEarRight);

  var rightEarInner = new Cube();
  rightEarInner.color = [0.0, 0.0, 0.0, 1.0];
  rightEarInner.matrix.set(rightEarTransform);
  rightEarInner.matrix.translate(frameThickness, frameThickness, (earDepth - innerPanelDepth) * 0.5);
  rightEarInner.matrix.scale(earWidth - 2 * frameThickness, earHeight - 2 * frameThickness, innerPanelDepth);
  rightEarInner.render();
  // g_redPandaParts.push(rightEarInner);

  var rightEarBack = new Cube();
  rightEarBack.color = [1.0, 1.0, 1.0, 1.0];
  rightEarBack.matrix.set(rightEarTransform);
  // rightEarBack.matrix.translate(frameThickness, frameThickness, -(earDepth - innerPanelDepth) * 0.5);
  rightEarBack.matrix.scale(earWidth, earHeight, innerPanelDepth);
  rightEarBack.render();
  // g_redPandaParts.push(rightEarBack);

  var rightEye = new Cube();
  rightEye.color = [0, 0, 0, 1];
  rightEye.matrix.set(headTransform);
  rightEye.matrix.translate(-0.01, 0.12, 0.20);
  rightEye.matrix.scale(0.04, 0.04, 0.04);
  rightEye.render();
  // g_redPandaParts.push(rightEye);

  var leftEye = new Cube();
  leftEye.color = [0, 0, 0, 1];
  leftEye.matrix.set(headTransform);
  leftEye.matrix.translate(-0.01, 0.12, 0.05);
  leftEye.matrix.scale(0.04, 0.04, 0.04);
  leftEye.render();
  // g_redPandaParts.push(leftEye);

  var furHeight = 0.07
  
  var rightFaceFurTransform = new Matrix4(headTransform); 
  rightFaceFurTransform.translate(0.035, 0, 0.23);
  rightFaceFurTransform.rotate(-90, 0, 1, 0);

  var rightFaceFurTop = new Cube();
  rightFaceFurTop.color = [1.0, 1.0, 1.0, 1.0];
  rightFaceFurTop.matrix.set(rightFaceFurTransform);
  rightFaceFurTop.matrix.translate(-0.015, furHeight - 0.02, 0);
  rightFaceFurTop.matrix.scale(0.035, furHeight - 0.02, 0.04);
  rightFaceFurTop.render();
  // g_redPandaParts.push(rightFaceFurTop);

  var rightFaceFurBottom = new Cube();
  rightFaceFurBottom.color = [1.0, 1.0, 1.0, 1.0];
  rightFaceFurBottom.matrix.set(rightFaceFurTransform);
  rightFaceFurBottom.matrix.translate(0, 0, 0);
  rightFaceFurBottom.matrix.scale(0.04, furHeight, 0.04);
  rightFaceFurBottom.render();
  // g_redPandaParts.push(rightFaceFurBottom);

  var leftFaceFurTransform = new Matrix4(headTransform); 
  leftFaceFurTransform.translate(0.035, 0, 0.025);
  leftFaceFurTransform.rotate(-90, 0, 1, 0);

  var leftFaceFurTop = new Cube();
  leftFaceFurTop.color = [1.0, 1.0, 1.0, 1.0];
  leftFaceFurTop.matrix.set(leftFaceFurTransform);
  leftFaceFurTop.matrix.translate(0.015, furHeight - 0.02 -g_fallHeight, 0);
  leftFaceFurTop.matrix.scale(0.035, furHeight - 0.02, 0.04);
  leftFaceFurTop.render();
  // g_redPandaParts.push(leftFaceFurTop);

  var leftFaceFurBottom = new Cube();
  leftFaceFurBottom.color = [1.0, 1.0, 1.0, 1.0];
  leftFaceFurBottom.matrix.set(leftFaceFurTransform);
  leftFaceFurBottom.matrix.translate(0, 0-g_fallHeight, 0);
  leftFaceFurBottom.matrix.scale(0.04, furHeight, 0.04);
  leftFaceFurBottom.render();
  // g_redPandaParts.push(leftFaceFurBottom);



  var leftArmBase = new Matrix4(bodyTransform);
  leftArmBase.translate(0.025, 0, 0.02); // adjust as needed for front left attachment
  drawLimb(leftArmBase, g_limbAngle, g_lowerArmAngle, g_footAngle, 0.1);

  var rightArmBase = new Matrix4(bodyTransform);
  rightArmBase.translate(0.4, 0, 0.02); // adjust for front right
  // If the natural motion requires the right limb to move oppositely, you can negate overall angle:
  drawLimb(rightArmBase, -g_limbAngle, g_lowerArmAngle, g_footAngle, 0.1);

  // For the hind limbs (legs), you might use a different base offset:
  var leftLegBase = new Matrix4(bodyTransform);
  leftLegBase.translate(0.025, 0, 0.15); // rear left
  // For natural gait, perhaps the hind limb moves opposite to the front:
  drawLimb(leftLegBase, -g_limbAngle, g_lowerArmAngle, g_footAngle, 0.1);

  var rightLegBase = new Matrix4(bodyTransform);
  rightLegBase.translate(0.4, 0, 0.15); // rear right
  drawLimb(rightLegBase, g_limbAngle, g_lowerArmAngle, g_footAngle, 0.1);

  var numSegments = 7;
  var tailSegmentLength = 0.07;
  var tailSegmentHeight = 0.075;
  var tailSegmentDepth = 0.1;
  var tailPosition = -0.38

  var amplitude = 20;      // maximum rotation for each segment
  var frequency = 3.0;     // how fast the tail wags
  var phase = 0.3;
  var tailBase = new Matrix4();
  tailBase.setTranslate(0.31, tailPosition, 0.175 - tailSegmentDepth/2);

  for (var i = 0; i < numSegments; i++) {
    if (g_limbAnimation) {
      var angle = amplitude * Math.sin(g_seconds * frequency + i * phase);
    } else {
      var angle = g_tailAngle;
    }

    var segmentTransform = new Matrix4(tailBase);

    segmentTransform.translate(tailSegmentLength/2, tailSegmentHeight/2, tailSegmentDepth/2);
    
    segmentTransform.rotate(angle, 0, 1, 0);
    segmentTransform.rotate(angle, 1, 0, 0);

    segmentTransform.translate(-tailSegmentLength/2, -tailSegmentHeight/2, -tailSegmentDepth/2);

    segmentTransform.scale(tailSegmentLength, tailSegmentHeight, tailSegmentDepth);

    var tailSegment = new Cylinder();
    tailSegment.matrix.set(segmentTransform);
    tailSegment.matrix.rotate(90, 0, 0, 1);
    tailSegment.color = (i % 2 === 0) ? [0.8, 0.4, 0.0, 1.0] : [0, 0, 0, 1];
    tailSegment.render();

    var translation = new Matrix4();
    translation.setTranslate(tailSegmentLength, 0, 0);
    tailBase.multiply(translation);
  }
}

function disassembleRedPanda() {
  g_fallHeight = g_fallHeight + 0.1;
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

function drawLimb(baseTransform, overallAngle, lowerArmAngle, footAngle, xFootOffset) {
  var limbTransform = new Matrix4(baseTransform);
  limbTransform.translate(legWidth/2, 0, legDepth/2);
  limbTransform.rotate(overallAngle, 0, 0, 1);
  limbTransform.translate(-legWidth/2, 0, -legDepth/2);

  var upperLimb = new Cube();
  upperLimb.color = [0, 0, 0, 1.0];
  upperLimb.matrix.set(limbTransform);
  upperLimb.matrix.scale(legWidth, -0.4 * legHeight, legDepth);
  upperLimb.render();

  var iT = new Cube();
  iT.color = [0, 0, 0, 1.0];
  iT.matrix.set(limbTransform);
  iT.matrix.scale(legWidth, legHeight/4, legDepth);
  iT.render();

  var lowerTransform = new Matrix4(limbTransform);
  lowerTransform.translate(0, -0.4 * legHeight, 0);
  lowerTransform.rotate(lowerArmAngle, 0, 0, 1);
  
  var lowerLimb = new Cube();
  lowerLimb.color = [0, 0, 0, 1.0];
  lowerLimb.matrix.set(lowerTransform);
  lowerLimb.matrix.scale(legWidth, -0.6 * legHeight, legDepth);
  lowerLimb.render();

  var footTransform = new Matrix4(lowerTransform);
  footTransform.translate(xFootOffset, -0.6 * legHeight, 0);
  footTransform.rotate(footAngle, 0, 0, 1);
  
  var footLimb = new Cube();
  footLimb.color = [0, 0, 0, 1.0];
  footLimb.matrix.set(footTransform);
  footLimb.matrix.scale(footDepth, footHeight, footWidth);
  footLimb.render();
}