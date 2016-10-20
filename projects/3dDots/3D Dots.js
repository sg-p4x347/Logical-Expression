'use strict';
// Game: 3D Dots
// Developer: Gage Coates (sg_p4x347)
// Date: 5-23-2015
// Synopsis: My attempt at using WebGl for a 3 dimensional version of the classic paper game, Dots.

var canvas;
var HUD;
var ctx;
window.requestAnimFrame = (function () {
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function (callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

//=============
// webGL Set-up
//=============

var gl;
function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}
function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	};

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}
var shaderProgram;
function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
	gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();
function mvPushMatrix() {
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvMatrixStack.push(copy);
}
function mvPopMatrix() {
	if (mvMatrixStack.length == 0) {
		throw "Invalid popMatrix!";
	}
	mvMatrix = mvMatrixStack.pop();
}
function setMatrixUniforms() {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}
var vertexBuffer;
var colorBuffer;
var vertexIndexBuffer;
var pointVerticies = [
// Front face
-0.25, -0.25, 0.25,
0.25, -0.25, 0.25,
0.25, 0.25, 0.25,
-0.25, 0.25, 0.25,

// Back face
-0.25, -0.25, -0.25,
-0.25, 0.25, -0.25,
0.25, 0.25, -0.25,
0.25, -0.25, -0.25,

// Top face
-0.25, 0.25, -0.25,
-0.25, 0.25, 0.25,
0.25, 0.25, 0.25,
0.25, 0.25, -0.25,

// Bottom face
-0.25, -0.25, -0.25,
0.25, -0.25, -0.25,
0.25, -0.25, 0.25,
-0.25, -0.25, 0.25,

// Right face
0.25, -0.25, -0.25,
0.25, 0.25, -0.25,
0.25, 0.25, 0.25,
0.25, -0.25, 0.25,

// Left face
-0.25, -0.25, -0.25,
-0.25, -0.25, 0.25,
-0.25, 0.25, 0.25,
-0.25, 0.25, -0.25
];
function drawScene() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	// apply camera position
	mat4.rotate(pMatrix, -camera.pitch, [1, 0, 0]);
	mat4.rotate(pMatrix, -camera.yaw, [0, 1, 0]);
	mat4.translate(pMatrix, [-camera.x, -camera.y, -camera.z]);

	mvPushMatrix();

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, colorBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
	setMatrixUniforms();

	gl.drawElements(gl.TRIANGLES, game.vertexIndices.length, gl.UNSIGNED_SHORT, 0);
	mvPopMatrix();
}
var lastTime = 0;
function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = (timeNow - lastTime)/1000;
		//W
		if (keyMap[87]) {
			camera.x -= (Math.sin(camera.yaw) * Math.cos(camera.pitch)) * camera.movementSpeed * elapsed;
			camera.y += Math.sin(camera.pitch) * camera.movementSpeed * elapsed;
			camera.z -= (Math.cos(camera.yaw) * Math.cos(camera.pitch)) * camera.movementSpeed * elapsed;
		};
		//D
		if (keyMap[68]) {
			camera.x += Math.cos(camera.yaw) * camera.movementSpeed * elapsed;
			camera.z -= Math.sin(camera.yaw) * camera.movementSpeed * elapsed;
		};
		//A
		if (keyMap[65]) {
			camera.x -= Math.cos(camera.yaw) * camera.movementSpeed * elapsed;
			camera.z += Math.sin(camera.yaw) * camera.movementSpeed * elapsed;
		};
		//S
		if (keyMap[83]) {
			camera.x += (Math.sin(camera.yaw) * Math.cos(camera.pitch)) * camera.movementSpeed * elapsed;
			camera.y -= Math.sin(camera.pitch) * camera.movementSpeed * elapsed;
			camera.z += (Math.cos(camera.yaw) * Math.cos(camera.pitch)) * camera.movementSpeed * elapsed;
		};
		//Space
		if (keyMap[32]) {
			camera.y += camera.movementSpeed * elapsed;
		};
		//Shift
		if (keyMap[16]) {
			camera.y -= camera.movementSpeed * elapsed;
		};
	};
	lastTime = timeNow;
}
function tick() {
	drawScene();
	animate();
	requestAnimFrame(tick);
}
function webGLStart() {
	canvas = document.getElementById("canvas");
	HUD = document.getElementById("HUD");
	ctx = HUD.getContext('2d');
	ctx.fillStyle = "rgb(255,64,64)";
	ctx.fillRect(HUD.width / 2 - 16, HUD.height / 2 - 2, 32, 4);
	ctx.fillRect(HUD.width / 2 - 2, HUD.height / 2 - 16, 4, 32);
	initGL(canvas);
	initShaders();
	game.init();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	// start animation
	tick();
}
// get the mouse position on canvas
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
x: evt.clientX - rect.left,
y: evt.clientY - rect.top
	};
};

//========
// 3D Dots
//========

var menu = [
{type:'BUTTON',fontSize: 80,color:[64,128,64],width:512,height:128,text:'Join Game',menu:[
	{type:'BUTTON',fontSize: 80,color:[64,128,64],width:512,height:128,text:'Back',menu:'back',object:null}
],object:null},
{type:'BUTTON',fontSize: 80,color:[64,128,64],width:512,height:128,text:'Create Game',menu:[
	{type:'FORM',fontSize: 16,color:[64,128,64],width:256,height:230,name:'createGame',menu:[
		{type:'SELECT',fontSize: 16,color:[220,255,220],width:256,height:24,text: 'Gamemode',name: 'gamemode',option:['Classic','Segments for Cubes','Planes for Cubes'],object:null},
		{type:'TEXT',fontSize: 16,color:[220,255,220],width:480,height:24,text: 'Width',name:'width',value:4,object:null},
		{type:'TEXT',fontSize: 16,color:[220,255,220],width:480,height:24,text: 'Length',name:'length',value:4,object:null},
		{type:'TEXT',fontSize: 16,color:[220,255,220],width:480,height:24,text: 'Height',name:'height',value:4,object:null}
		],object:null},
	{type:'BUTTON',fontSize: 80,color:[64,128,64],width:512,height:128,text:'Create',menu: 
		function () {
			game = new createGame(Math.round(Number(document.forms['createGame']['width'].value)),Math.round(Number(document.forms['createGame']['length'].value)),Math.round(Number(document.forms['createGame']['height'].value)),document.forms['createGame']['gamemode'].value)
			camera = new createCamera(Math.PI/5,-3*Math.PI/4,-3*Math.PI/4,-4,-4,-4,0.0025,3);
			// blue counter
			var blueCounter = document.createElement('P');
			var blueText = document.createTextNode('Blue: 0');
			blueCounter.id = 'blueCounter';
			blueCounter.appendChild(blueText);
			blueCounter.style.position = 'absolute';
			blueCounter.style.zIndex = '2';
			blueCounter.style.backgroundColor = 'rgb(64,64,128)';
			blueCounter.style.borderRadius = '8px';
			blueCounter.style.border = '8px groove rgb(64,255,64)';
			// red counter
			var redCounter = document.createElement('P');
			var redText = document.createTextNode('Red: 0');
			redCounter.id = 'redCounter';
			redCounter.appendChild(redText);
			redCounter.style.position = 'absolute';
			redCounter.style.zIndex = '2';
			redCounter.style.backgroundColor = 'rgb(128,64,64)';
			redCounter.style.borderRadius = '8px';
			redCounter.style.right = '0px';
			redCounter.style.border = '8px groove rgb(64,64,64)';
			// main div
			var main = document.getElementById('main')
			main.style.font = 'bold 40px Times';
			main.appendChild(blueCounter);
			main.appendChild(redCounter);
			webGLStart();
			window.addEventListener("mousedown", function (evt) {
				camera.selectTest();
				canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
				canvas.requestPointerLock();
			});
			window.addEventListener("keydown", function (evt) {
				keyMap.splice(evt.keyCode, 1, true);
				if (keyMap[27]) {
					document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
					document.exitPointerLock();
				};
				if (keyMap[69]) {
					camera.cancelSelection();
				}
				evt.preventDefault();
				evt.stopPropagation();
				evt.cancelBubble = true;
			});
			window.addEventListener("keyup", function (evt) {
				keyMap.splice(evt.keyCode, 1, false);
				evt.preventDefault();
				evt.stopPropagation();
				evt.cancelBubble = true;
			});
		},object:null},
	{type:'BUTTON',fontSize: 80,color:[64,128,64],width:512,height:128,text:'Back',menu:'back',object:null}
],object:null},
{type:'BUTTON',fontSize: 80,color:[64,128,64],width:512,height:128,text:'Options',menu:[
	{type:'BUTTON',fontSize: 80,color:[64,128,64],width:512,height:128,text:'Back',menu:'back',object:null}
],object:null},
{type:'BUTTON',fontSize: 80,color:[64,128,64],width:512,height:128,text:'Credits',menu:[
	{type:'P',fontSize: 40,color:[255,255,255],width:512,height:128,text:'Made by sg_p4x347, many thanks to the Beards team!',menu:null,object:null},
	{type:'BUTTON',fontSize: 80,color:[64,128,64],width:512,height:128,text:'Back',menu:'back',object:null}
	],object:null}
];
var game;
var mouse = { deltaX:0 ,deltaY:0};
var camera;
function loadMenu(data) {
	data.forEach(function (button, index) {		
		button.object = document.createElement(button.type);
		button.object.style.position = 'absolute';
		var y = (720/(data.length+1))*(index+1)-(button.height/2);
		var x = (720/2)-(button.width/2);
		button.object.style.top = y + 'px';
		button.object.style.left = x + 'px';			
		button.object.style.zIndex = "4";
		button.object.style.font = 'bold ' + button.fontSize + 'px Times';
		button.object.style.backgroundColor = 'rgba(' + button.color[0]+','+button.color[1] + ',' + button.color[2]+',0.9)';
		button.object.style.border = '16px groove rgb(64,64,64)';
		button.object.style.borderRadius = '16px';
		// Add Event Listeners
		if (button.type == 'BUTTON') {
			button.object.addEventListener('click', function (evt) {
				if (button.menu === 'back') {
					loadMenu(menu);
				} else if (button.menu.constructor === Array) {
					loadMenu(button.menu);
				} else {
					button.menu();					};
					data.forEach(function (buttonElm) {
					document.getElementById("main").removeChild(buttonElm.object);
				});			
			});
			button.object.addEventListener('mouseover', function (evt) {
				button.object.style.backgroundColor = 'rgba(' + (button.color[0]-64)+','+(button.color[1]-64) + ',' + (button.color[2]-64)+',0.9)';
			});
			button.object.addEventListener('mouseout', function (evt) {
				button.object.style.backgroundColor = 'rgba(' + button.color[0]+','+button.color[1] + ',' + button.color[2]+',0.9)';
			});
		};
		// Element widths
		switch (button.type) {
		case 'BUTTON':
			button.object.style.width = button.width + 'px';
			button.object.style.height = button.height + 'px';
			button.object.style.textAlign = 'center';
			break;
		default:
			button.object.style.width = button.width-32 + 'px';
			button.object.style.height = button.height-32 + 'px';
			break;
		};
		// Special functionalities
		switch (button.type) {
		case 'FORM':
			button.object.name = button.name;
			button.object.style.textAlign = 'center';
			button.menu.forEach(function (input, inputIndex) {
				var linebreak = document.createElement('BR');
				button.object.appendChild(linebreak);
				var text = document.createTextNode(input.text);
				button.object.appendChild(text);
				switch (input.type) {
				case 'SELECT':
					input.object = document.createElement(input.type);
					input.object.name = input.name;
					input.option.forEach(function (option) {
						var optionObject = document.createElement('OPTION');
						optionObject.value = option;
						// option text
						var text = document.createTextNode(option);
						optionObject.appendChild(text);
						input.object.appendChild(optionObject);
					});
					break;
				default:
					input.object = document.createElement('INPUT');							
					// Functionality
					input.object.type = input.type;
					input.object.name = input.name;
					input.object.value = input.value;
					if (input.type == 'RADIO'&&inputIndex == 0) {
						input.object.checked = true;
					};
					break;
				};
				input.object.style.backgroundColor = 'rgb(' + input.color[0]+','+input.color[1] + ',' + input.color[2]+')';
				input.object.style.font = 'bold ' + input.fontSize + 'px Times';
				var linebreak = document.createElement('BR');
				button.object.appendChild(linebreak);
				input.object.style.left = '0px';
				button.object.appendChild(input.object);
			});
			break;
		default: 
			var text = document.createTextNode(button.text);
			button.object.appendChild(text);				
			break;
		};
		document.getElementById("main").appendChild(button.object)
	});
};
function createCamera(pitch,yaw,roll,x,y,z,rotateSpeed,movementSpeed) {
	this.pitch = pitch;
	this.yaw = yaw;
	this.roll = roll;
	this.x = x;
	this.y = y;
	this.z = z;
	this.rotateSpeed = rotateSpeed;
	this.movementSpeed = movementSpeed;
	this.cancelSelection = function () {
		var self = this;
		// change colour of first point
		if (self.stage == 1) {
			var colorSample = [
				[1.0, 1.0, 1.0, 1.0], // Front face
				[0.9, 0.9, 0.9, 1.0], // Back face
				[0.8, 0.8, 0.8, 1.0], // Top face
				[0.7, 0.7, 0.7, 1.0], // Bottom face
				[0.6, 0.6, 0.6, 1.0], // Right face
				[0.5, 0.5, 0.5, 1.0]  // Left face
			];
			var colors = [];
			colorSample.forEach(function (color) {
				for (var i = 0; i < 4; i++) {
					colors = colors.concat(color);
				};
			});
			var pointIndex = getIndex(self.firstSelection.x,self.firstSelection.y,self.firstSelection.z);
			game.colors.splice.apply(game.colors, [pointIndex*96, 96].concat(colors));
			game.updateBuffer('color');
			self.stage = 0;
		};
	}
	this.selectTest = function () {
		var self = this;
		var select = { pitch: camera.pitch, yaw: camera.yaw, roll: camera.roll, x: camera.x, y: camera.y, z: camera.z };
		var testDepth = 8;
		var radius = 0.25;
		for (var test = 0; test < testDepth/radius; test++) {
			// move the test forward
			select.x -= (Math.sin(select.yaw) * Math.cos(select.pitch)) * radius;
			select.y += Math.sin(select.pitch) * radius;
			select.z -= (Math.cos(select.yaw) * Math.cos(select.pitch)) * radius;
			// test for valid testing space (inside the grid)
			if (select.x > -0.125 && select.x < game.width-0.875
					&& select.y > -0.125 && select.y < game.height-0.875
					&& select.z > -0.125 && select.z < game.length-0.875) {
				// test for nearby point
				if (Math.sqrt(Math.pow(select.x-Math.round(select.x),2)+Math.pow(select.y-Math.round(select.y),2)+Math.pow(select.z-Math.round(select.z),2))<=radius) {
					// select the point
					var pointIndex = getIndex(select.x,select.y,select.z);
					if (self.stage == 0||(self.stage==1
								&&(Math.sqrt(Math.pow(self.firstSelection.x-Math.round(select.x),2)+Math.pow(self.firstSelection.y-Math.round(select.y),2)+Math.pow(self.firstSelection.z-Math.round(select.z),2))==1)&&(!self.checkSegments({x:Math.round(select.x),y:Math.round(select.y),z:Math.round(select.z)})))) {
						// change colour of first point
						if (self.stage == 0) {
							var colorSample = [
							[0.5, 1.0, 0.5, 1.0], // Front face
							[0.4, 1, 0.4, 1.0], // Back face
							[0.3, 1, 0.3, 1.0], // Top face
							[0.2, 1, 0.2, 1.0], // Bottom face
							[0.1, 1, 0.1, 1.0], // Right face
							[0.0, 1, 0.0, 1.0]  // Left face	
							];
							var colors = [];
							colorSample.forEach(function (color) {
								for (var i = 0; i < 4; i++) {
									colors = colors.concat(color);
								};
							});
							game.colors.splice.apply(game.colors, [pointIndex*96, 96].concat(colors));
							game.updateBuffer('color');
						};
						// update selections
						if (self.stage == 0) {
							self.firstSelection = {x:Math.round(select.x),y:Math.round(select.y),z:Math.round(select.z)};
							self.stage = 1;
						} else if (self.stage == 1) {
							self.secondSelection = {x:Math.round(select.x),y:Math.round(select.y),z:Math.round(select.z)};
							//var confirm = window.confirm("Is this the segment that you want to make?");
							var confirm = true;
							if (confirm) {
								game.pushSegment(self.firstSelection,self.secondSelection);
								// change colour of first point
								var colorSample = [
								[1.0, 1.0, 1.0, 1.0], // Front face
								[0.9, 0.9, 0.9, 1.0], // Back face
								[0.8, 0.8, 0.8, 1.0], // Top face
								[0.7, 0.7, 0.7, 1.0], // Bottom face
								[0.6, 0.6, 0.6, 1.0], // Right face
								[0.5, 0.5, 0.5, 1.0]  // Left face
								];
								var colors = [];
								colorSample.forEach(function (color) {
									for (var i = 0; i < 4; i++) {
										colors = colors.concat(color);
									};
								});
								game.colors.splice.apply(game.colors, [getIndex(self.firstSelection.x,self.firstSelection.y,self.firstSelection.z)*96, 96].concat(colors));
								game.updateBuffer('color');
								// check for plane
								game.planeTest();
							};
							self.stage = 0;
						};
						break;
					};
				};
			};
		};
	};
	this.checkSegments = function (secondSelection) {
		var self = this;
		var search = false;
		game.segments.some(function (segment) {
			if (game.segTest(self.firstSelection,secondSelection)) {
				search = true;
				return true;
			};
		});
		return search;
	};
	this.stage = 0;
	this.firstSelection = undefined;
	this.secondSelection = undefined;	
}
function createGame(width, length, height, gamemode) {
	this.score = {blue:0,red:0};
	this.updateScore = function () {
		var self = this;
		var blueCounter = document.getElementById('blueCounter');
		var redCounter = document.getElementById('redCounter');
		switch (self.turn) {
			case 0: 
				self.score.blue++;
				blueCounter.childNodes[0].nodeValue = 'Blue: '+self.score.blue; break;
			case 1: 
				self.score.red++;
				redCounter.childNodes[0].nodeValue = 'Red: '+self.score.red; break;
		};
	}
	this.gamemode = gamemode;
	this.length = length;
	this.width = width;
	this.height = height
	this.points = [];
	this.segments = [];
	this.planes = [];
	this.verticies = [];
	this.colors = [];
	this.vertexIndices = [];
	this.turn = 0;
	this.planeTest = function (segmentIndex) {
		var self = this;
		var segmentIndex = self.segments.length-1;
		var point1 = self.segments[segmentIndex][0];
		var point2 = self.segments[segmentIndex][1];
		var vector = {x:point2.x-point1.x,y:point2.y-point1.y,z:point2.z-point1.z};
		var search = false;
		if (vector.x != 0) {
			if (this.segTest(point1,{x:point1.x,y:point1.y-1,z:point1.z})&&this.segTest(point2,{x:point2.x,y:point2.y-1,z:point2.z})&&this.segTest({x:point1.x,y:point1.y-1,z:point1.z},{x:point2.x,y:point2.y-1,z:point2.z})) {
				self.pushPlane(point1,point2,{x:point1.x,y:point1.y-1,z:point1.z},{x:point2.x,y:point2.y-1,z:point2.z});
				search = true;
				self.updateScore();
			};
			if (this.segTest(point1,{x:point1.x,y:point1.y+1,z:point1.z})&&this.segTest(point2,{x:point2.x,y:point2.y+1,z:point2.z})&&this.segTest({x:point1.x,y:point1.y+1,z:point1.z},{x:point2.x,y:point2.y+1,z:point2.z})) {
				self.pushPlane(point1,point2,{x:point1.x,y:point1.y+1,z:point1.z},{x:point2.x,y:point2.y+1,z:point2.z});
				search = true;
				self.updateScore();
			};
			if (this.segTest(point1,{x:point1.x,y:point1.y,z:point1.z-1})&&this.segTest(point2,{x:point2.x,y:point2.y,z:point2.z-1})&&this.segTest({x:point1.x,y:point1.y,z:point1.z-1},{x:point2.x,y:point2.y,z:point2.z-1})) {
				self.pushPlane(point1,point2,{x:point1.x,y:point1.y,z:point1.z-1},{x:point2.x,y:point2.y,z:point2.z-1});
				search = true;
				self.updateScore();
			};
			if (this.segTest(point1,{x:point1.x,y:point1.y,z:point1.z+1})&&this.segTest(point2,{x:point2.x,y:point2.y,z:point2.z+1})&&this.segTest({x:point1.x,y:point1.y,z:point1.z+1},{x:point2.x,y:point2.y,z:point2.z+1})) {
				self.pushPlane(point1,point2,{x:point1.x,y:point1.y,z:point1.z+1},{x:point2.x,y:point2.y,z:point2.z+1});
				search = true;
				self.updateScore();
			};			
		} else if (vector.y != 0) {
			if (this.segTest(point1,{x:point1.x-1,y:point1.y,z:point1.z})&&this.segTest(point2,{x:point2.x-1,y:point2.y,z:point2.z})&&this.segTest({x:point1.x-1,y:point1.y,z:point1.z},{x:point2.x-1,y:point2.y,z:point2.z})) {
				self.pushPlane(point1,point2,{x:point1.x-1,y:point1.y,z:point1.z},{x:point2.x-1,y:point2.y,z:point2.z});
				search = true;
				self.updateScore();
			};
			if (this.segTest(point1,{x:point1.x+1,y:point1.y,z:point1.z})&&this.segTest(point2,{x:point2.x+1,y:point2.y,z:point2.z})&&this.segTest({x:point1.x+1,y:point1.y,z:point1.z},{x:point2.x+1,y:point2.y,z:point2.z})) {
				self.pushPlane(point1,point2,{x:point1.x+1,y:point1.y,z:point1.z},{x:point2.x+1,y:point2.y,z:point2.z});
				search = true;
				self.updateScore();
			};
			if (this.segTest(point1,{x:point1.x,y:point1.y,z:point1.z-1})&&this.segTest(point2,{x:point2.x,y:point2.y,z:point2.z-1})&&this.segTest({x:point1.x,y:point1.y,z:point1.z-1},{x:point2.x,y:point2.y,z:point2.z-1})) {
				self.pushPlane(point1,point2,{x:point1.x,y:point1.y,z:point1.z-1},{x:point2.x,y:point2.y,z:point2.z-1});
				search = true;
				self.updateScore();
			};
			if (this.segTest(point1,{x:point1.x,y:point1.y,z:point1.z+1})&&this.segTest(point2,{x:point2.x,y:point2.y,z:point2.z+1})&&this.segTest({x:point1.x,y:point1.y,z:point1.z+1},{x:point2.x,y:point2.y,z:point2.z+1})) {
				self.pushPlane(point1,point2,{x:point1.x,y:point1.y,z:point1.z+1},{x:point2.x,y:point2.y,z:point2.z+1});
				search = true;
				self.updateScore();
			};			
		} else if (vector.z != 0) {
			if (this.segTest(point1,{x:point1.x,y:point1.y-1,z:point1.z})&&this.segTest(point2,{x:point2.x,y:point2.y-1,z:point2.z})&&this.segTest({x:point1.x,y:point1.y-1,z:point1.z},{x:point2.x,y:point2.y-1,z:point2.z})) {
				self.pushPlane(point1,point2,{x:point1.x,y:point1.y-1,z:point1.z},{x:point2.x,y:point2.y-1,z:point2.z});
				search = true;
				self.updateScore();
			};
			if (this.segTest(point1,{x:point1.x,y:point1.y+1,z:point1.z})&&this.segTest(point2,{x:point2.x,y:point2.y+1,z:point2.z})&&this.segTest({x:point1.x,y:point1.y+1,z:point1.z},{x:point2.x,y:point2.y+1,z:point2.z})) {
				self.pushPlane(point1,point2,{x:point1.x,y:point1.y+1,z:point1.z},{x:point2.x,y:point2.y+1,z:point2.z});
				search = true;
				self.updateScore();
			};
			if (this.segTest(point1,{x:point1.x-1,y:point1.y,z:point1.z})&&this.segTest(point2,{x:point2.x-1,y:point2.y,z:point2.z})&&this.segTest({x:point1.x-1,y:point1.y,z:point1.z},{x:point2.x-1,y:point2.y,z:point2.z})) {
				self.pushPlane(point1,point2,{x:point1.x-1,y:point1.y,z:point1.z},{x:point2.x-1,y:point2.y,z:point2.z});
				search = true;
				self.updateScore();
			};
			if (this.segTest(point1,{x:point1.x+1,y:point1.y,z:point1.z})&&this.segTest(point2,{x:point2.x+1,y:point2.y,z:point2.z})&&this.segTest({x:point1.x+1,y:point1.y,z:point1.z},{x:point2.x+1,y:point2.y,z:point2.z})) {
				self.pushPlane(point1,point2,{x:point1.x+1,y:point1.y,z:point1.z},{x:point2.x+1,y:point2.y,z:point2.z});
				search = true;
				self.updateScore();
			};			
		};
		if (!search) {
			if (self.turn == 0) {
				self.turn = 1;
				document.getElementById('redCounter').style.border = '8px groove rgb(64,255,64)';
				document.getElementById('blueCounter').style.border = '8px groove rgb(64,64,64)';
			} else if (self.turn ==1) {
				self.turn = 0;
				document.getElementById('blueCounter').style.border = '8px groove rgb(64,255,64)';
				document.getElementById('redCounter').style.border = '8px groove rgb(64,64,64)';
			};
		};
	};
	this.segTest = function(point1,point2) {
		var self = this;
		var search = false;
		self.segments.some(function (segment,index) {
			if ((JSON.stringify(segment[0]) == JSON.stringify(point1)||JSON.stringify(segment[1]) == JSON.stringify(point1))&&(JSON.stringify(segment[0]) == JSON.stringify(point2)||JSON.stringify(segment[1]) == JSON.stringify(point2))) {
				search = true;
				return true;
			};
		});
		return search;
	}
	this.pushPlane = function (point1,point2,point3,point4) {
		var self = this;
		self.planes.push([point1,point2,point3,point4]);
		// vertices
		self.verticies = self.verticies.concat([point1.x,point1.y,point1.z,point2.x,point2.y,point2.z,point4.x,point4.y,point4.z,point3.x,point3.y,point3.z]);
		// colours
		var colorSample;
		switch (self.turn) {
		case 0: colorSample = [0.25, 0.25, 0.5, 1]; break;
		case 1: colorSample = [0.5,0.25,0.25,1]; break;
		};		
		var colors = [];
		for (var i = 0; i < 4; i++) {
			colors = colors.concat(colorSample);
		};
		self.colors = self.colors.concat(colors);
		// indices
		var index = self.vertexIndices[self.vertexIndices.length-1]+1;
		self.vertexIndices = self.vertexIndices.concat([index,index+1,index+2,index,index+2,index+3]);
		// buffer Update
		self.updateBuffer('vertex');
		self.updateBuffer('color');
		self.updateBuffer('vertexIndex');
	}
	this.init = function () {
		var self = this;
		// creating the points
		for (var x = 0; x < self.width; x++) {
			for (var z = 0; z < self.length; z++) {
				for (var y = 0; y < self.height; y++) {
					self.points.push([x, y, z])
				};
			};
		};

		// creating the verticies
		vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		var numItems = 0;
		self.points.forEach(function (point) {
			for (var vertex = 0; vertex < pointVerticies.length; vertex += 3) {
				for (var coord = 0; coord < 3; coord++) {
					self.verticies.push((pointVerticies[vertex + coord] * 0.5) + point[coord]);
				};
				numItems++;
			};
		});
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(self.verticies), gl.STATIC_DRAW);
		vertexBuffer.itemSize = 3;
		vertexBuffer.numItems = numItems;

		// creating the colors
		colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		var colorSample = [
		[1.0, 1.0, 1.0, 1.0], // Front face
		[0.9, 0.9, 0.9, 1.0], // Back face
		[0.8, 0.8, 0.8, 1.0], // Top face
		[0.7, 0.7, 0.7, 1.0], // Bottom face
		[0.6, 0.6, 0.6, 1.0], // Right face
		[0.5, 0.5, 0.5, 1.0]  // Left face
		];
		var colors = [];
		for (var c = 0; c < vertexBuffer.numItems / 24; c++) {
			for (var i = 0; i < 6; i++) {
				colors.push(colorSample[i]);
			};
		};
		colors.forEach(function (color) {
			for (var i = 0; i < 4; i++) {
				self.colors = self.colors.concat(color);
			};
		});
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(self.colors), gl.STATIC_DRAW);
		colorBuffer.itemSize = 4;
		colorBuffer.numItems = vertexBuffer.numItems;

		// creating the triangles
		vertexIndexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
		numItems = 0;
		for (var rectangle = 0; rectangle < vertexBuffer.numItems; rectangle += 4) {
			self.vertexIndices.push(rectangle);
			self.vertexIndices.push(rectangle + 1);
			self.vertexIndices.push(rectangle + 2);
			self.vertexIndices.push(rectangle);
			self.vertexIndices.push(rectangle + 2);
			self.vertexIndices.push(rectangle + 3);
			numItems += 6;
		};
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(self.vertexIndices), gl.STATIC_DRAW);
		vertexIndexBuffer.itemSize = 1;
		vertexIndexBuffer.numItems = numItems;
	};
	this.updateBuffer = function (buffer) {
		var self = this;
		switch (buffer) {
		case 'vertex': 
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(self.verticies), gl.STATIC_DRAW); break;
		case 'color':
			gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(self.colors), gl.STATIC_DRAW); break;
		case 'vertexIndex': 
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(self.vertexIndices), gl.STATIC_DRAW); break;
		};
	};
	this.pushSegment = function (firstSelection,secondSelection) {        
		var self = this;
		self.segments.push([camera.firstSelection,camera.secondSelection]);
		// find the vertex positions of the segment (rectangular prism)
		var vector = {x:camera.secondSelection.x-camera.firstSelection.x,y:camera.secondSelection.y-camera.firstSelection.y,z:camera.secondSelection.z-camera.firstSelection.z};
		var firstSquare;
		var secondSquare;
		if (vector.x != 0) {
			firstSquare = segSquare(camera.firstSelection.z,camera.firstSelection.y,camera.firstSelection.x,[2,1,0]);
			secondSquare = segSquare(camera.secondSelection.z,camera.secondSelection.y,camera.secondSelection.x,[2,1,0]);
		} else if (vector.y!= 0) {
			firstSquare = segSquare(camera.firstSelection.x,camera.firstSelection.z,camera.firstSelection.y,[0,2,1]);
			secondSquare = segSquare(camera.secondSelection.x,camera.secondSelection.z,camera.secondSelection.y,[0,2,1]);
		} else if (vector.z!=0) {
			firstSquare = segSquare(camera.firstSelection.x,camera.firstSelection.y,camera.firstSelection.z,[0,1,2]);
			secondSquare = segSquare(camera.secondSelection.x,camera.secondSelection.y,camera.secondSelection.z,[0,1,2]);
		};
		// create the vertices
		firstSquare.forEach(function (point,index) {
			self.verticies = self.verticies.concat(firstSquare[index]);
			if (index <3) {
				self.verticies = self.verticies.concat(firstSquare[index+1]);
				self.verticies = self.verticies.concat(secondSquare[index+1]);
			} else if (index == 3) {
				self.verticies = self.verticies.concat(firstSquare[0]);
				self.verticies = self.verticies.concat(secondSquare[0]);
			}
			self.verticies = self.verticies.concat(secondSquare[index]);
		});
		
		// create the colors
		var colorSample = [
		[1.0, 1.0, 1.0, 1.0], // Front face
		[0.9, 0.9, 0.9, 1.0], // Back face
		[0.8, 0.8, 0.8, 1.0], // Top face
		[0.7, 0.7, 0.7, 1.0]  // Bottom face	
		];
		var colors = [];
		colorSample.forEach(function (color) {
			for (var i = 0; i < 4; i++) {
				colors = colors.concat(color);
			};
		});
		self.colors = self.colors.concat(colors);
		
		// creating the triangles
		for (var rectangle = (self.verticies.length/3)-16; rectangle < (self.verticies.length/3); rectangle += 4) {
			self.vertexIndices.push(rectangle);
			self.vertexIndices.push(rectangle + 1);
			self.vertexIndices.push(rectangle + 2);
			self.vertexIndices.push(rectangle);
			self.vertexIndices.push(rectangle + 2);
			self.vertexIndices.push(rectangle + 3);	
		};
		// update buffers
		self.updateBuffer('vertex');
		self.updateBuffer('color');
		self.updateBuffer('vertexIndex');
	};	
}
function newFilledArray(len, val) {
	var ar = Array(len);
	while (--len >= 0) {
		ar[len] = val;
	};
	return ar;
};
function getIndex(x,y,z) {
	return Math.round(y) + ((Math.round(z)  + (Math.round(x) * game.length))*game.height);
}
function getCoords(index) {
	return {
x:Math.floor(index/(game.length*game.height)),
y:Math.floor(index/(game.length*game.width)),
z:Math.floor(index/(game.width*game.height))
	};
}
function segSquare(x,y,z,order) {
	var radius = 0.0625;
	var template = [
	[x+radius,y+radius,z],
	[x-radius,y+radius,z],
	[x-radius,y-radius,z],
	[x+radius,y-radius,z]
	];
	template.forEach(function (point, pointIndex) {
		var tempPoint = [0,0,0];
		order.forEach(function (number, indexOrder) {			
			tempPoint.splice(indexOrder,1,point[number]);
		});
		template[pointIndex] = tempPoint;
	});
	return template;
}
var keyMap = newFilledArray(100, false);

//================
// Event Listeners
//================

function moveCallback(e) {
	if (camera !== undefined) {
		var movementX =
		e.movementX ||
		e.mozMovementX ||
		e.webkitMovementX ||
		0;
		var movementY =
		e.movementY ||
		e.mozMovementY ||
		e.webkitMovementY ||
		0;
		camera.yaw -= movementX * camera.rotateSpeed;   
		if (camera.pitch >= Math.PI / 2) {
			if (movementY > 0) {
				camera.pitch -= movementY * camera.rotateSpeed;
			} else {
				camera.pitch = Math.PI / 2;
			};
		} else if (camera.pitch <= -Math.PI / 2) {
			if (movementY < 0) {
				camera.pitch -= movementY * camera.rotateSpeed;
			} else {
				camera.pitch = -Math.PI / 2;
			};
		} else {
			camera.pitch -= movementY * camera.rotateSpeed;
		};
	};                   
}
document.addEventListener("mousemove", this.moveCallback, false);
document.addEventListener("DOMContentLoaded", function (evt) {
	loadMenu(menu);
});
