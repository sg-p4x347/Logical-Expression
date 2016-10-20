// Script: Logic Gate Simulator
// Developer: Gage Coates
// Date: August, 2016
var application = new Application();

// gets called once the html is loaded
function initialize() {
	application.Initialize();
	Animation();
}

function Application () {
	// canvas
	this.ctx;
	// animation variables
	this.animationRequest;
	this.scale = 64;
	this.camera = new Vec2(0,0);
	this.lastCamera = new Vec2(0,0);
	this.mouse =  {
		left: false,
		middle: false,
		right: false,
		last: true,
		position: new Vec2(0,0),
		lastPosition: new Vec2(0,0),
	}
	// application
	this.textures = {};
	this.gate;
	this.selectedGate = null;
	this.selectedOutput = null;
	this.selectedInput = null;
	this.nodeSize = new Vec2(0.5,0.25);
	
	this.gates = [];
	this.gateSelection = [];
	this.Import = function (data) {
		var self = this;
		self.gates = [];
		data.gates.forEach(function (gateData) {
			if (gateData) {
				var gate = new window[gateData.type];
				gate.Import(gateData);
				self.gates.push(gate);
			} else {
				self.gates.push(null);
			}
		});
	}
	this.Export = function () {
		var self = this;
		var obj = {name: document.getElementById('Name').value,gates:[]};
		self.gates.forEach(function (gate) {
			obj.gates.push(JSON.parse(JSON.stringify(gate)));
		});
		return obj;
	}
	this.UpdateLoadList = function () {
		var self = this;
		var load = document.getElementById('Load');
		while (load.firstChild) {
			load.childNodes[0].remove();
		}
		for (var name in JSON.parse(localStorage.logicGateSim)) {
			var option = document.createElement('OPTION');
			option.innerHTML = name;
			option.value = name;
			load.appendChild(option);
		}
	}
	this.DefaultStyle = function () {
		this.ctx.globalAlpha = 1.0
		this.ctx.setLineDash([]);
		this.ctx.lineWidth = this.scale/16;
		this.ctx.lineCap = 'round';
		this.ctx.strokeStyle = 'black';
	}
	this.RenderBoundingBox = function(gamePos,gameSize,margin) {
		var self = this;
		var screenPos = self.WorldToScreen(gamePos);
		var screenSize = new Vec2(gameSize.x * self.scale,gameSize.y * self.scale);
		margin = margin ? margin * self.scale : 0;
		
		self.ctx.setLineDash([1,6]);
		self.ctx.beginPath();
		self.ctx.rect(screenPos.x-screenSize.x/2-margin,screenPos.y-screenSize.y/2-margin,screenSize.x + margin * 2,screenSize.y + margin*2);
		self.ctx.fillStyle = 'rgba(255,255,255,0.5)';
		//self.ctx.fill();
		self.ctx.lineWidth = self.scale/32;
		self.ctx.strokeStyle = 'blue';
		self.ctx.stroke();
		
		self.DefaultStyle();
	}
	this.RenderGate = function (gate,transparency) {
		var self = this;
		var coord = self.WorldToScreen(gate.position);
		if (transparency) {
			self.ctx.globalAlpha=transparency;
		}
		if (!gate.texture) {
			var topLeft = new Vec2(coord.x-gate.size.x/2*self.scale,coord.y-gate.size.y/2*self.scale);
			self.ctx.beginPath();
			self.ctx.rect(topLeft.x,topLeft.y,gate.size.x*self.scale,gate.size.y*self.scale);
			self.ctx.lineWidth = self.scale/8;
			self.ctx.lineCap = 'square';
			if (gate instanceof Comment) {
				self.ctx.setLineDash([8,16]);
			}
			self.ctx.stroke();
			self.ctx.fillStyle = 'white';
			self.ctx.fill();
			
			if (gate instanceof Screen) {
				// Screen pixel display
				gate.state.forEach(function (row,y) {
					var width = gate.state.length;
					for (var x = 0; x < width; x++) {
						var state = (row >>> x) & 1;
						if (state) {
							self.ctx.fillStyle = 'blue';
							self.ctx.fillRect(topLeft.x + (x/width) * gate.size.x * self.scale,topLeft.y + (y/width) * gate.size.y * self.scale,1/width * gate.size.x *self.scale,1/width * gate.size.y * self.scale);
						}
					}
				});
			} else if (gate instanceof ROM) {
				gate.state.forEach(function (line,lineIndex) {
					line.forEach(function (bit,bitIndex) {
						if (bit) {
							self.ctx.fillStyle = 'blue';
							self.ctx.fillRect(topLeft.x + (lineIndex/gate.state.length) * gate.size.x * self.scale,topLeft.y + (bitIndex/gate.state[0].length) * gate.size.y * self.scale,(1/gate.state.length) * gate.size.x * self.scale,(1/gate.state[0].length) * gate.size.y * self.scale);
						}
					});
				});
			} else {
				// name
				self.ctx.font = 'bold ' + 0.5 * self.scale + 'px arial';
				self.ctx.textAlign = 'center';
				self.ctx.fillStyle = 'black';
				gate.size.x = self.ctx.measureText(gate.name).width/self.scale + 0.5;
				self.ctx.fillText(gate.name,coord.x,coord.y + 0.125*self.scale);
			}
			self.DefaultStyle();
		} else {
			// Gate texture
			self.ctx.drawImage(self.textures[gate.texture],0,0,self.textures[gate.texture].width,self.textures[gate.texture].height,coord.x-(0.5*gate.size.x)*self.scale,coord.y-(0.5*gate.size.y)*self.scale,gate.size.x * self.scale,gate.size.y * self.scale);
			if (gate.hasOwnProperty('name')) {
				self.ctx.font = 'bold ' + 0.5 * self.scale + 'px arial';
				self.ctx.textAlign = 'center';
				self.ctx.fillStyle = 'grey';
				self.ctx.fillText(gate.name,coord.x,coord.y + 0.125*self.scale);
			}
		}
	}
	this.Update = function () {
		var self = this;
		// clear
		var canvas = document.getElementById('canvas');
		self.DefaultStyle();
		self.ctx.fillStyle = 'rgb(192,192,255)';
		self.ctx.fillRect(0,0,canvas.width,canvas.height);

		self.DefaultStyle();
		var mousePos = self.ScreenToGame(self.mouse.position);
		self.gates.forEach(function (gate,gateIndex) {
			if (gate) {
				// compute
				gate.Logic();
				
				// inputs
				gate.inputs.forEach(function (input,index) {
					var inputPos = new Vec2();
					inputPos.x = gate.position.x-(gate.size.x/2)-(self.nodeSize.x/2);
					inputPos.y = (gate.position.y-(gate.size.y/2) + (index/gate.inputs.length) * gate.size.y) + (1/gate.inputs.length)*gate.size.y/2;
					if ((gateIndex === self.selectedGate && index === self.selectedInput) || Math.abs(self.ScreenToGame(self.mouse.position).x - inputPos.x) <= self.nodeSize.x/2 && Math.abs(self.ScreenToGame(self.mouse.position).y - inputPos.y) <= self.nodeSize.y/2) {
						self.RenderBoundingBox(inputPos,self.nodeSize);
						if (input.hasOwnProperty('name')) {
							self.ctx.font = 'bold ' + 0.5 * self.scale + 'px arial';
							self.ctx.textAlign = 'right';
							self.ctx.fillStyle = 'black';
							self.ctx.fillText(input.name,self.WorldToScreen(inputPos).x,self.WorldToScreen(inputPos).y + 0.125*self.scale);
							self.DefaultStyle();
						}
					}
					inputPos = self.WorldToScreen(inputPos);
					self.ctx.beginPath();
					self.ctx.moveTo(inputPos.x,inputPos.y);
					self.ctx.lineTo(inputPos.x+(self.scale/2)*gate.size.x,inputPos.y);
					self.ctx.stroke();
				});
				// outputs
				gate.outputs.forEach(function (output,index) {
					var outputPos = new Vec2();
					outputPos.x = gate.position.x+gate.size.x/2+0.25;
					outputPos.y = (gate.position.y-(gate.size.y/2) + (index/gate.outputs.length)*gate.size.y) + (1/gate.outputs.length)/2*gate.size.y;
					if ((gateIndex === self.selectedGate && index === self.selectedOutput) || Math.abs(self.ScreenToGame(self.mouse.position).x - outputPos.x) <= self.nodeSize.x/2 && Math.abs(self.ScreenToGame(self.mouse.position).y - outputPos.y) <= self.nodeSize.y/2) {
						self.RenderBoundingBox(outputPos,self.nodeSize);
						if (output.hasOwnProperty('name')) {
							self.ctx.font = 'bold ' + 0.5 * self.scale + 'px arial';
							self.ctx.textAlign = 'left';
							self.ctx.fillStyle = 'black';
							self.ctx.fillText(output.name,self.WorldToScreen(outputPos).x,self.WorldToScreen(outputPos).y + 0.125*self.scale);
							self.DefaultStyle();
						}
					}
					outputPos = self.WorldToScreen(outputPos);
					self.ctx.beginPath();
					self.ctx.moveTo(outputPos.x-self.scale/4,outputPos.y);
					self.ctx.lineTo(outputPos.x,outputPos.y);
					// if dragging a link
					if (self.mouse.left && self.selectedGate === gateIndex && self.selectedOutput === index) {
						self.ctx.lineTo(self.mouse.position.x,self.mouse.position.y);
					}
					self.ctx.stroke();
					output.links.forEach(function (link) {
						// set next gate's input
						if (link && self.gates[link.gate] && self.gates[link.gate].inputs[link.input]) {
							self.gates[link.gate].inputs[link.input].state = output.state;
							// render
							var inputPos = new Vec2();
							inputPos.x = self.gates[link.gate].position.x-(self.gates[link.gate].size.x/2)-0.25;
							inputPos.y = (self.gates[link.gate].position.y-(self.gates[link.gate].size.y/2) + (link.input/self.gates[link.gate].inputs.length)*self.gates[link.gate].size.y) + (1/self.gates[link.gate].inputs.length)/2*self.gates[link.gate].size.y;
							inputPos = self.WorldToScreen(inputPos);
							self.ctx.beginPath();
							self.ctx.moveTo(outputPos.x,outputPos.y);
							self.ctx.lineTo(inputPos.x,inputPos.y);
							self.ctx.stroke();
						} else {
							link = null;
						}
					});
				});
				self.RenderGate(gate);
				// highlight I/O gates
				if (gate instanceof UserInput ) {
					if (gate.state) {
						gate.texture = 'In Active';
					} else {
						gate.texture = 'In';
					}
				} else if (gate instanceof UserOutput ) {
					if (gate.state) {
						gate.texture = 'Out Active';
					} else {
						gate.texture = 'Out';
					}
				} else if (gate instanceof ROM) {
					if (Math.abs(mousePos.x - gate.position.x) < gate.size.x/2 && Math.abs(mousePos.y - gate.position.y) < gate.size.y/2) {
						var buttonSize = gate.size.x/gate.state.length;
						var bitIndex = Math.floor((mousePos.y - (gate.position.y- gate.size.y/2))/buttonSize);
						var lineIndex = Math.floor((mousePos.x - (gate.position.x- gate.size.x/2))/buttonSize);
						if (self.mouse.last && self.mouse.left) {
							gate.state[lineIndex][bitIndex] = !gate.state[lineIndex][bitIndex];
							self.mouse.last = false;
						}
						// highlight
						var pos = new Vec2(gate.position.x-gate.size.x/2 + lineIndex * buttonSize,gate.position.y-gate.size.y/2 + bitIndex * buttonSize);
						pos = self.WorldToScreen(pos);
						self.ctx.beginPath();
						self.ctx.rect(pos.x,pos.y,buttonSize*self.scale,buttonSize*self.scale);
						self.ctx.strokeStyle = "lightblue";
						self.ctx.stroke();
						self.DefaultStyle();
					}
				}
			}
		});
		// highlight selected gate
		document.getElementById('AddLine').className = 'hidden';
			document.getElementById('RemoveLine').className = 'hidden';
		if (self.selectedGate !== null) {
			self.RenderBoundingBox(self.gates[self.selectedGate].position,self.gates[self.selectedGate].size,0.125);
			// ROM controls
			if (self.gates[self.selectedGate] instanceof ROM) {
				document.getElementById('AddLine').className = 'tool tooltip';
				document.getElementById('RemoveLine').className = 'tool tooltip';
			}
		}
		// ghost gate
		if (self.gate) {
			self.gate.position = self.ScreenToGame(self.mouse.position);
			self.gate.position.Round();
			self.RenderGate(self.gate,0.5);
		}
		
	}
	this.WorldToScreen = function (coord) {
		var canvas = document.getElementById('canvas');
		return new Vec2((coord.x - this.camera.x) * this.scale + canvas.width/2 - 4, (coord.y - this.camera.y) * this.scale + canvas.height/2 - 4);
	}
	this.ScreenToGame = function (screen) {
		var canvas = document.getElementById('canvas');
		return new Vec2(
			((screen.x - canvas.width/2) / this.scale) + this.camera.x,
			((screen.y - canvas.height/2) / this.scale) + this.camera.y
		);
	}
	this.Resize = function () {
		var canvas = document.getElementById('canvas');
		canvas.width = document.getElementById('body').getBoundingClientRect().right - 8;
		canvas.height = document.getElementById('body').getBoundingClientRect().bottom - document.getElementById('gates').getBoundingClientRect().bottom - 16;
	}
	this.Initialize = function () {
		var self = this;
		var canvas = document.getElementById('canvas');
		this.ctx = canvas.getContext('2d');
		// image interpolation off for IE, Chrome, Firefox
		this.ctx.msImageSmoothingEnabled = false;
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.mozImageSmoothingEnabled = false;
		//  setup requestAnimFrame
		window.requestAnimFrame = (function () {
			return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 1000/60);
			};
		})();
		// set up localStorage
		if (!localStorage.logicGateSim) {
			localStorage.logicGateSim = "{}";
		}
		// mouse updates
		canvas.addEventListener('mousedown',function (event) {
			event.preventDefault();
			switch (event.which) {
				case 1: self.mouse.left = true;
				// find selections
				var lastGate = self.selectedGate
				self.selectedGate = null;
				self.selectedOutput = null;
				self.gates.some(function (gate,gateIndex) {
					if (gate) {
						var mouse = self.ScreenToGame(self.mouse.position);
						if (Math.abs(mouse.x-gate.position.x) <= gate.size.x/2 && Math.abs(mouse.y-gate.position.y) <= gate.size.y/2) {
							if (lastGate !== gateIndex) {
								self.mouse.last = false;
							}
							self.selectedGate = gateIndex;
							self.gate = null;
							if (gate instanceof UserInput){
								// toggle inputs
								gate.state = gate.state ? 0 : 1;
							}
							return true;
						}
						// check for output selection
						gate.outputs.some(function (output,index) {
							var outputPos = new Vec2();
							outputPos.x = gate.position.x+gate.size.x/2+0.25;
							outputPos.y = (gate.position.y-(gate.size.y/2) + (index/gate.outputs.length)*gate.size.y) + (1/gate.outputs.length)/2*gate.size.y;
							if (Math.abs(mouse.x-outputPos.x) <= self.nodeSize.x/2 && Math.abs(mouse.y-outputPos.y) <= self.nodeSize.y/2) {
								self.selectedGate = gateIndex;
								self.selectedOutput = index;
								self.selectedInput = null;
								self.gate = null;
								return true;
							}
						});
						// check for input selection
						gate.inputs.some(function (input,index) {
							var inputPos = new Vec2();
							inputPos.x = gate.position.x-gate.size.x/2-0.25;
							inputPos.y = (gate.position.y-(gate.size.y/2) + (index/gate.inputs.length)*gate.size.y) + (1/gate.inputs.length)/2*gate.size.y;
							if (Math.abs(mouse.x-inputPos.x) <= self.nodeSize.x/2 && Math.abs(mouse.y-inputPos.y) <= self.nodeSize.y/2) {
								self.selectedGate = gateIndex;
								self.selectedInput = index;
								self.selectedOutput = null;
								self.gate = null;
								return true;
							}
						});
					}
				});
				// camera delta
				self.lastCamera.x = self.camera.x;
				self.lastCamera.y = self.camera.y;
				// mouse delta
				self.mouse.lastPosition.x = self.mouse.position.x;
				self.mouse.lastPosition.y = self.mouse.position.y;
				break;
				case 2: self.mouse.middle = true; break;
				case 3: self.mouse.right = true; break;
			}
		})
		canvas.addEventListener('mouseup',function (event) {
			event.preventDefault();
			switch (event.which) {
				case 1: self.mouse.left = false; 
				// connect gates with links
				if (self.selectedGate != null && self.selectedOutput != null) {
					self.gates.some(function (gate,gateIndex) {
						if (gate) {
							var mouse = self.ScreenToGame(self.mouse.position);
							gate.inputs.some(function (input,index) {
								var inputPos = new Vec2();
								inputPos.x = gate.position.x-gate.size.x/2-0.25;
								inputPos.y = (gate.position.y-(gate.size.y/2) + (index/gate.inputs.length)*gate.size.y) + (1/gate.inputs.length)/2*gate.size.y;
								if (Math.abs(mouse.x-inputPos.x) <= self.nodeSize.x/2 && Math.abs(mouse.y-inputPos.y) <= self.nodeSize.y/2) {
									// connect output to input
									self.gates[self.selectedGate].outputs[self.selectedOutput].links.push(new Link(gateIndex,index));
									return true;
								}
							});
						}
					});
				} else {
					// gate placement
					if (self.gate && self.lastCamera.x == self.camera.x && self.lastCamera.y == self.camera.y) {
						var gate = new window[self.gate.type];
						gate.Import(self.gate.Export());
						gate.position = self.ScreenToGame(self.mouse.position);
						gate.position.Round();
						self.gates.push(gate);
					}
				}
				break;
				case 2: self.mouse.middle = false; break;
				case 3: self.mouse.right = false; break;
			}
			self.mouse.last = true;
		})
		canvas.addEventListener('mousemove',function (event) {
			var rect = canvas.getBoundingClientRect();
			var current = new Vec2(event.clientX - rect.left,event.clientY - rect.top);
			var delta = new Vec2(current.x-self.mouse.position.x,current.y-self.mouse.position.y);
			self.mouse.position = current;
			if (self.mouse.left) {
				if (self.selectedOutput == null) {
					if (self.selectedGate == null) {
						// move camera
						self.camera.x -= delta.x/self.scale;
						self.camera.y -= delta.y/self.scale;
					} else {
						// move gate
						var deltaMove = new Vec2(((self.mouse.position.x-self.mouse.lastPosition.x)/self.scale),((self.mouse.position.y-self.mouse.lastPosition.y)/self.scale));
						if (deltaMove.x < 0) {
							deltaMove.x = Math.ceil(deltaMove.x);
						} else {
							deltaMove.x = Math.floor(deltaMove.x);
						}
						if (deltaMove.y < 0) {
							deltaMove.y = Math.ceil(deltaMove.y);
						} else {
							deltaMove.y = Math.floor(deltaMove.y);
						}
						if (Math.abs(deltaMove.x) > 0) {
							self.gates[self.selectedGate].position.x += deltaMove.x;
							self.mouse.lastPosition.x = self.mouse.position.x;
						}
						if (Math.abs(deltaMove.y) > 0) {
							self.gates[self.selectedGate].position.y += deltaMove.y;
							self.mouse.lastPosition.y = self.mouse.position.y;
						}
						self.gates[self.selectedGate].position.Round();
					}
				}
			}
		});
		window.addEventListener('keydown', function (event) {
			var code = event.keyCode;
			switch(event.keyCode) {
				case 46: 
				if (self.selectedGate != null) {
					self.gates[self.selectedGate] = null;
					self.selectedGate = null;
				}
				break;
			}
		});
		// tools
		document.getElementById('Clear').onclick = function () {
			self.gates = [];
			self.selectedGate = null;
			self.selectedOutput = null;
		}
		document.getElementById('Save').onclick = function () {
			if (!localStorage.logicGateSim) {
				localStorage.logicGateSim = "{}";
			}
			var local = JSON.parse(localStorage.logicGateSim);
			var name = document.getElementById('Name').value;
			name = name ? name : "Circuit 1"
			local[name] = self.Export();
			localStorage.logicGateSim = JSON.stringify(local);
			self.UpdateLoadList();
		}
		self.UpdateLoadList();
		document.getElementById('Load').oninput = function () {
			document.getElementById('Name').value = this.value;
			document.getElementById('LoadIC').onclick();
		}
		// load as circuit
		document.getElementById('LoadCircuit').onclick = function () {
			var name = document.getElementById('Load').value;
			if (name) {
				self.Import(JSON.parse(localStorage.logicGateSim)[name]);
			}
		}
		// load as IC
		document.getElementById('LoadIC').onclick = function () {
			var name = document.getElementById('Load').value;
			if (name) {
				self.gate = new IC();
				self.gate.Initialize(name,JSON.parse(localStorage.logicGateSim)[name].gates);
			}
		}
		// Add/Remove nodes
		document.getElementById('AddInput').onclick = function () {
			if (self.selectedGate !== null) {
				var gate = self.gates[self.selectedGate];
				if (gate instanceof AND || gate instanceof NAND || gate instanceof OR || gate instanceof NOR || gate instanceof BusTransmitter || gate instanceof Screen) {
					gate.inputs.push(new Input());
				} else if (gate instanceof BusReceiver || gate instanceof Decoder) {
					gate.outputs.push(new Output());
				} else if (gate instanceof ROM) {
					gate.AddBit();
				}
				gate.Resize(true);
			}
		}
		document.getElementById('RemoveInput').onclick = function () {
			if (self.selectedGate !== null) {
				var gate = self.gates[self.selectedGate];
				if ((gate instanceof AND || gate instanceof NAND || gate instanceof OR || gate instanceof NOR || gate instanceof BusTransmitter || gate instanceof Screen) && gate.inputs.length > 2) {
					gate.inputs.pop();
					if (gate instanceof Screen) {
						gate.state.pop();
					}
				} else if (gate instanceof BusReceiver || gate instanceof Decoder) {
					gate.outputs.pop();
				} else if (gate instanceof ROM){
					gate.RemoveBit();
				}
				gate.Resize(true);
			}
		}
		// Copy/Paste
		document.getElementById('Copy').onclick = function () {
			if (self.selectedGate != null) {
				self.gate = new window[self.gates[self.selectedGate].type];
				self.gate.Import(self.gates[self.selectedGate].Export());
			}
		}
		// Name node
		document.getElementById('NameNode').onclick = function () {
			if (self.selectedGate !== null) {
				self.gates[self.selectedGate].name = window.prompt('Name:');
			}
		}
		// Add/Remove Line
		document.getElementById('AddLine').onclick = function () {
			self.gates[self.selectedGate].AddLine();
		}
		document.getElementById('RemoveLine').onclick = function () {
			self.gates[self.selectedGate].RemoveLine();
		}
		// Zoom
		document.getElementById('Zoom').oninput = function () {
			self.scale = document.getElementById('Zoom').value;
		}
		// load textures
		var names = [
			'AND',
			'OR',
			'NOT',
			'XOR',
			'NAND',
			'NOR',
			'XNOR',
			'In',
			'In Active',
			'Out',
			'Out Active',
			'BusTransmitter',
			'BusReceiver',
			'Screen',
			'Comment',
			'Clock',
		];
		var loaded = 0;
		names.forEach(function (name) {
			var texture = new Image();
			texture.onload = function () {
				loaded++;
				if (loaded >= names.length) {
					
				}
			}
			texture.src = 'textures/' + name + '.png';
			self.textures[name] = texture;
		});
		// HTML
		var gateNames = [
			'UserInput',
			'UserOutput',
			'AND',
			'OR',
			'NOT',
			'XOR',
			'NAND',
			'NOR',
			'XNOR',
			'BusTransmitter',
			'BusReceiver',
			'Screen',
			'Comment',
			'Clock',
			'ROM',
			'Decoder',
			'Display',
		];
		var gates = document.getElementById('gates');
		gateNames.forEach(function (gate) {
			var img = document.createElement('img');
			var gateObj = new window[gate];
			img.className = 'gate';
			img.src = 'textures/' + (gateObj.texture ? gateObj.texture : gate) + '.png';
			img.ondragstart = function() { return false; };
			img.onmousedown = function () {
				self.gate = new window[gate];
				self.gate.Resize();
			}
			gates.appendChild(img);
		});
		window.onresize = function () {
			self.Resize();
		}
		self.Resize();
	}
}
function Animation() {
	application.Update();
	application.animationRequest = window.requestAnimFrame(Animation);
}
function Input () {
	this.state = 0;
}
function Output () {
	this.state = 0;
	this.links = [];
}

function Link (gate, input) {
	this.gate = gate; // index of connecting gate
	this.input = input; // index of connecting input
}

function Vec2 (x,y) {
	this.x = x;
	this.y = y;
	this.Round = function () {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
	}
}

function Gate (inputs,outputs) {
	inputs = inputs ? inputs : 0;
	outputs = outputs ? outputs : 0;
	this.type;
	this.texture;
	this.size = new Vec2();
	this.position = new Vec2();
	this.inputs = [];
	for (var i = 0; i < inputs; i++) {
		this.inputs.push(new Input());
	}
	this.outputs = [];
	for (var i = 0; i < outputs; i++) {
		this.outputs.push(new Output());
	}
	this.Logic = function () {}
	this.Resize = function (proportional) {
		// make sure that there is no less than 0.25 units between inputs/outputs
		var ratio = this.size.y/this.size.x;
		this.size.y = Math.max(1,Math.max(this.inputs.length,this.outputs.length) * 0.25);
		if (proportional) {
			this.size.x = this.size.y/ratio;
		}
	}
}
Gate.prototype.Import = function (gate) {
	this.type = gate.type;
	if (gate.name) {this.name = gate.name}
	this.texture = gate.texture;
	this.size = new Vec2(gate.size.x,gate.size.y);
	this.position = new Vec2(gate.position.x,gate.position.y);
	this.inputs = gate.inputs;
	this.outputs = gate.outputs;
	this.Resize();
}
Gate.prototype.Export = function () {
	return JSON.parse(JSON.stringify(this));
}
function IC () {
	Gate.call(this);
	this.type = 'IC';
	this.name = 'Circuit 1';
	this.gates = [];
	this.size = new Vec2(1,1);
	this.Logic = function () {
		var self = this;
		// set internal UserInput
		self.inputs.forEach( function (input) {
			self.gates[input.gate].state = input.state;
			input.state = 0;
		});
		// execute internal gate logic
		self.gates.forEach(function (gate) {
			if (gate) {
				gate.Logic();
				gate.outputs.forEach(function (output) {
					if (output) {
						output.links.forEach(function (link) {
							if (link && self.gates[link.gate] && self.gates[link.gate].inputs[link.input]) {
								self.gates[link.gate].inputs[link.input].state = output.state;
							}
						});
					}
				});
			}
		});
		// set outputs
		self.outputs.forEach(function (output) {
			output.state = self.gates[output.gate].state;
		});
	}
	this.Initialize = function (name,gates) {
		var self = this;
		self.name = name;
		gates.forEach(function (gateData) {
			if (gateData !== null) {
				var gate = new window[gateData.type];
				gate.Import(gateData);
				self.gates.push(gate);
			} else {
				self.gates.push(null);
			}
		});
		// create an input and output for each UserInput and UserOutput
		self.gates.forEach(function (gate,gateIndex) {
			if (gate instanceof UserInput) {
				var input = new Input();
				input.gate = gateIndex;
				if (gate.hasOwnProperty('name')) {input.name = gate.name;}
				self.inputs.push(input);
			} else if (gate instanceof UserOutput) {
				var output = new Output();
				output.gate = gateIndex;
				if (gate.hasOwnProperty('name')) { output.name = gate.name;}
				self.outputs.push(output);
			}
		});
		self.Resize();
	}
}
IC.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
	this.name = data.name;
	var self = this;
	data.gates.forEach(function (gateData) {
		if (gateData !== null) {
			var gate = new window[gateData.type];
			gate.Import(gateData);
			self.gates.push(gate);
		} else {
			self.gates.push(null);
		}
	});
}
IC.prototype.Export = function () {
	var self = this;
	var obj = Gate.prototype.Export.call(this);
	obj.name = this.name;
	obj.gates = [];
	self.gates.forEach(function (gate) {
			obj.gates.push( gate ? gate.Export() : null);
	});
	return obj;
}
function AND () {
	Gate.call(this,2,1);
	this.type = 'AND';
	this.texture = 'AND';
	this.size = new Vec2(0.75,1);
	this.Logic = function () {
		var self = this;
		self.outputs[0].state = 1;
		self.inputs.forEach( function (input) {
			if (!input.state) {
				self.outputs[0].state = 0;
			}
			input.state = 0;
		});
	}
}
AND.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
AND.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function OR () {
	Gate.call(this,2,1);
	this.type = 'OR';
	this.texture = 'OR';
	this.size = new Vec2(1.15625,1);
	this.Logic = function () {
		var self = this;
		self.outputs[0].state = 0;
		self.inputs.some( function (input) {
			if (input.state) {
				self.outputs[0].state = 1;
				return true;
			}
			input.state = 0;
		});
	}
}
OR.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
OR.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function NOT () {
	Gate.call(this,1,1);
	this.type = 'NOT';
	this.texture = 'NOT';
	this.size = new Vec2(1,1);
	this.Logic = function () {
		this.outputs[0].state = this.inputs[0].state ? 0 : 1;
		this.inputs[0].state = 0;
	}
}
NOT.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
NOT.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function XOR () {
	Gate.call(this,2,1);
	this.type = 'XOR';
	this.texture = 'XOR';
	this.size = new Vec2(1.388,1);
	this.Logic = function () {
		this.outputs[0].state = ((this.inputs[0].state && ! this.inputs[1].state) || (!this.inputs[0].state && this.inputs[1].state)) ? 1 : 0;
		this.inputs[0].state = 0;
		this.inputs[1].state = 0;
	}
}
XOR.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
XOR.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function NAND () {
	Gate.call(this,2,1);
	this.type = 'NAND';
	this.texture = 'NAND';
	this.size = new Vec2(1,1);
	this.Logic = function () {
		var self = this;
		self.outputs[0].state = 0;
		self.inputs.forEach( function (input) {
			if (!input.state) {
				self.outputs[0].state = 1;
			}
			input.state = 0;
		});
	}
}
NAND.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
NAND.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function NOR () {
	Gate.call(this,2,1);
	this.type = 'NOR';
	this.texture = 'NOR';
	this.size = new Vec2(80/54,1);
	this.Logic = function () {
		var self = this;
		self.outputs[0].state = 1;
		self.inputs.some( function (input) {
			if (input.state) {
				self.outputs[0].state = 0;
				return true;
			}
			input.state = 0;
		});
	}
}
NOR.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
NOR.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function XNOR () {
	Gate.call(this,2,1);
	this.type = 'XNOR';
	this.texture = 'XNOR';
	this.size = new Vec2(88/54,1);
	this.Logic = function () {
		this.outputs[0].state = ((this.inputs[0].state && ! this.inputs[1].state) || (!this.inputs[0].state && this.inputs[1].state)) ? 0 : 1;
		this.inputs[0].state = 0;
		this.inputs[1].state = 0;
	}
}
XNOR.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
XNOR.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function UserInput () {
	Gate.call(this,0,1);
	this.state = 0;
	this.type = 'UserInput';
	this.texture = 'In';
	this.size = new Vec2(1,1);
	this.Logic = function () {
		this.outputs[0].state = this.state;
	}
}
UserInput.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
	this.state = data.state;
}
UserInput.prototype.Export = function () {
	var data = Gate.prototype.Export.call(this);
	data.state = this.state;
	return JSON.parse(JSON.stringify(data));
}
function UserOutput() {
	Gate.call(this,1,0);
	this.state = 0;
	this.type = 'UserOutput';
	this.texture = 'Out';
	this.size = new Vec2(1,1);
	this.Logic = function () {
		this.state = this.inputs[0].state;
	}
}
UserOutput.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
	this.state = data.state;
}
UserOutput.prototype.Export = function () {
	var data = Gate.prototype.Export.call(this);
	data.state = this.state;
	return JSON.parse(JSON.stringify(data));
}
function BusTransmitter () {
	Gate.call(this,8,1);
	this.type = 'BusTransmitter';
	this.texture = 'BusTransmitter';
	this.size = new Vec2(1,1);
	this.Logic = function () {
		var self = this;
		self.outputs[0].state = 0;
		self.inputs.forEach(function (input,index) {
			if (input.state) {
				self.outputs[0].state += Math.pow(2,index);
				input.state = 0;
			}
		});
	}
}
BusTransmitter.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
BusTransmitter.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function BusReceiver () {
	Gate.call(this,1,8);
	this.type = 'BusReceiver';
	this.texture = 'BusReceiver';
	this.size = new Vec2(1,1);
	this.Logic = function () {
		var self = this;
		self.outputs.forEach(function (output,index) {
			output.state = (self.inputs[0].state >>> index) & 1;
		});
		self.inputs[0].state = 0;
	}
}
BusReceiver.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
BusReceiver.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function Screen () {
	Gate.call(this,16,0);
	this.type = 'Screen';
	this.size = new Vec2(1,1);
	this.state = [];
	for (var y = 0; y < this.inputs.length;y++) {
		this.state.push(0);
	}
	this.Logic = function () {
		var self = this;
		self.inputs.forEach(function (input,index) {
			self.state[index] = input.state;
			input.state = 0;
		});
	}
	this.Resize(true);
}
Screen.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
	this.state = data.state;
}
Screen.prototype.Export = function () {
	var data = Gate.prototype.Export.call(this);
	data.state = this.state;
	return data;
}
function Comment () {
	Gate.call(this,0,0);
	this.type = 'Comment';
	this.name = 'Comment';
	this.size = new Vec2(1,1);
}
Comment.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
Comment.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function Clock () {
	Gate.call(this,0,1);
	this.type = 'Clock';
	this.texture = 'Clock';
	this.state = 0;
	this.size = new Vec2(1,1);
	this.Logic = function () {
		var self = this;
		self.state++
		self.outputs[0].state = 0;
		if (self.state <= 30) {
			self.outputs[0].state = 1;
		} if (self.state >= 60) {
			self.state = 0;
		}
	}
}
Clock.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
Clock.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function ROM () {
	Gate.call(this,1,1);
	this.type = 'ROM';
	this.state = [[0]]; // line -> bit
	this.size = new Vec2(0.5,1);
	this.Logic = function () {
		var self = this;
		// clear outputs
		self.outputs.forEach(function (output) {
			output.state = 0;
		})
		var address = self.inputs[0].state;
		if (address < self.state.length) {
			self.state[address].forEach(function (state,index) {
				self.outputs[index].state = state ? 1 : 0;
			});
		}
		self.inputs[0].state = 0;
	}
	this.AddBit = function () {
		this.state.forEach(function (line) {
			line.push(0);
		});
		this.outputs.push(new Output());
	}
	this.RemoveBit = function () {
		if (this.state[0].length > 1) {
			this.state.forEach(function (line) {
				line.pop();
			});
			this.outputs.pop();
		}
	}
	this.AddLine = function () {
		var line = [];
		for (var bit = 0; bit < this.state.length; bit++) {
			line.push(0);
		}
		this.state.push(line);
		this.Resize();
	}
	this.RemoveLine = function () {
		if (this.state.length > 1) {
			this.state.pop();
			this.Resize();
		}
	}
	this.Resize = function () {
		var buttonSize = 0.5;
		this.size.x = buttonSize * this.state.length;
		this.size.y = buttonSize * this.state[0].length;
	}
}
ROM.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
	this.state = data.state;
	this.Resize();
}
ROM.prototype.Export = function () {
	var data = Gate.prototype.Export.call(this);
	data.state = this.state;
	return JSON.parse(JSON.stringify(data));
}
function Decoder () {
	Gate.call(this,1,8);
	this.type = 'Decoder';
	this.name = 'Decoder';
	this.size = new Vec2(1,1);
	this.Logic = function () {
		var self = this;
		self.outputs.forEach(function (output,index) {
			if (index == self.inputs[0].state) {
				output.state = 1;
			} else {
				output.state = 0;
			}
		});
		self.inputs[0].state = 0;
	}
}
Decoder.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
Decoder.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}
function Display () {
	Gate.call(this,1,0);
	this.type = 'Display';
	this.name = 'Decimal';
	this.size = new Vec2(1,1);
	this.Logic = function () {
		var self = this;
		self.name = self.inputs[0].state;
		self.inputs[0].state = 0;
	}
}
Display.prototype.Import = function (data) {
	Gate.prototype.Import.call(this,data);
}
Display.prototype.Export = function () {
	return Gate.prototype.Export.call(this);
}