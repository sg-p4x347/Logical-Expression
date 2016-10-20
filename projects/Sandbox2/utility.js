'use strict';
//========
// Classes
//========

// create a game
function World(name,roughness) {
	this.name = name;
	this.roughness = roughness;
	this.time = 8;
	this.entities = [];
	this.sectors = [];
	this.players = [];
	this.updates = [];
}
// create a sector
function sector(x) {
	this.width = 256;
	this.height = 256;
	this.x = x;
	var surface = terrain(this.width,this.height,this.height/4);
	this.surface = surface;
	var layers = generator();
	this.layers = layers;
	function terrain(width, height, displace) {
		var roughness = world.roughness;
		var points = [];		
		// set the side points
		var left = false;
		var right = false;
		world.sectors.some(function (sector) {
			if (sector.x + 1 == x) {
				points[0] = sector.surface[width-1];
				left = true;
			}
			if (sector.x - 1 == x) {
				points[width] = sector.surface[0];
				right = true;
			}
			if (left && right) {
				return true;
			}
		});
		if (!left) {
			points[0] = height/2 + (Math.random()*displace*2) - displace;
		}
		if (!right) {
			points[width] = height/2 + (Math.random()*displace*2) - displace;
		}
		displace *= roughness;
		// increase the number of segments
		for(var i = 1; i < width; i *= 2) {
			// iterate through each segment calculating the centre point
			for(var j = (width/i)/2; j < width; j+= width/i){
				points[j] = ((points[j - (width / i) / 2] + points[j + (width / i) / 2]) / 2);
				points[j] += (Math.random()*displace*2) - displace;
			}
			// reduce the random range
			displace *= roughness;
		}
		points.forEach(function (point, index) {
			points[index] = Math.round(point);
		});
		points.pop();
		return points;
	}
	function generator() {
		var layers = [newFilledArray(65536,{data:0}),newFilledArray(65536,{data:0})];	
		//=================
		// fill the terrain
		//=================
		for (var x = 0; x < 256; x++) {
			var y = surface[x];
			var topSoil = y <= assets.water ? 3 : 2;
			// grass layer
			layers[0][getIndex(x,y)] = {data:topSoil};
			layers[1][getIndex(x,y)] = {data:topSoil};
			// dirt layer
			for (var dirt = 1; dirt < randWithin(4,7); dirt++ ) {
				layers[0][getIndex(x,y+dirt)] = {data:2};
				layers[1][getIndex(x,y+dirt)] = {data:2};
			}			
			// stone layer
			y += dirt;
			while (y < 255) {
				layers[0][getIndex(x,y)] = {data:1};
				layers[1][getIndex(x,y)] = {data:1};
				y++;
			}
			// mantle layer
			for (y = 255; y >= 255-randWithin(0,5); y--) {
				layers[0][getIndex(x,y)] = {data:42};
				layers[1][getIndex(x,y)] = {data:42};
			}
		}
		// water
		surface.forEach(function (y,x) {
			if (y >= assets.water) {
				var water = assets.water;
				while (layers[0][getIndex(x,water)].data == 0) {
					layers[0][getIndex(x,water)] = {data:22};
					water++;
				}
			}
		})
		//======
		// Veins
		//======
		assets.veins.forEach(function (vein) {
			// how many veins
			for (var veins = 0; veins < randWithin(vein.minVeins,vein.maxVeins); veins++) {
				ellipse(Math.random() * 256, randWithin(vein.minY,vein.maxY),vein.width,vein.height).forEach(function (point) {
					if (getProperties(vein.data,['type']).type === getProperties(layers[0][getIndex(absToRel(point.x).x,point.y)],['type']).type) {
						if (Math.round(absToRel(point.x).x) > 0 && Math.round(absToRel(point.x).x) < 256 && Math.round(point.y) >0 && Math.round(point.y) < 256) {
							layers[0][getIndex(absToRel(point.x).x,point.y)] = JSON.parse(JSON.stringify(vein.data));
						}
					}
				})
			}
		})
		//======
		// Caves
		//======
		for (var seed = randWithin(assets.caveData.minCaves,assets.caveData.maxCaves); seed > 0; seed--) {
			var randX = Math.round(Math.random() * 256);
			var pointOne = { x: randX, y: Math.round(surface[randX]-assets.caveData.segmentLength) };
			var pointTwo = { x: randX, y: Math.round(surface[randX])};
			var angle;
			var opposite;
			var adjacent;
			for (var segment = randWithin(assets.caveData.minLength,assets.caveData.maxLength)/assets.caveData.segmentLength; segment > 0; segment--) {
				var radius = randWithin(assets.caveData.minRadius,assets.caveData.maxRadius);
				opposite = pointTwo.y - pointOne.y;
				adjacent = pointTwo.x - pointOne.x;
				angle = Math.atan(opposite / adjacent);
				if (adjacent == 0) {
					if (opposite < 0) {
						angle = -(Math.PI / 2);
					} else if (opposite > 0) {
						angle = Math.PI / 2;
					};
				} else if (adjacent < 0) {
					if (opposite < 0) {
						angle = -((((Math.PI / 2) - Math.abs(angle)) * 2) + Math.abs(angle));
					} else if (opposite > 0) {
						angle = ((((Math.PI / 2) - Math.abs(angle)) * 2) + Math.abs(angle));
					} else {
						angle = Math.PI;
					};
				};
				angle = angle + (Math.random() * assets.caveData.maxDeflection) - (assets.caveData.maxDeflection / 2);
				// switch and move points for the new segment
				pointOne.x = pointTwo.x;
				pointOne.y = pointTwo.y;
				pointTwo.x = Math.round((Math.cos(angle) * assets.caveData.segmentLength)+pointOne.x);
				pointTwo.y = Math.round((Math.sin(angle) * assets.caveData.segmentLength)+pointOne.y);
				// fill in segment by graphing circles on the line
				for (var circleTest = 0; circleTest < assets.caveData.segmentLength; circleTest++) {
					var testX = Math.round((Math.cos(angle) * circleTest)+pointOne.x);
					var testY = Math.round((Math.sin(angle) * circleTest)+pointOne.y);
					for (var iY = Math.round(testY - radius); iY < testY + radius; iY++) {
						if (iY >= 0 && iY < 256) {
							for (var iX = Math.round(testX - radius); iX < testX + radius; iX++) {
								if (iX >= 0 && iX < 256) {
									var width = iX - testX;
									var height = iY - testY;
									if (((width * width) + (height * height)) <= (radius * radius)) {
										var block = getIndex(iX, iY);
										if (['liquid','mantle'].indexOf(getProperties(layers[0][block],['type']).type) == -1) {
											if (Math.round(iY) >= 192) {
												layers[0][block] = {data:22};
											} else {
												layers[0][block] = {data:0};
											}
										}
									}
								}
							}
						}
					}					
				}
			}
		}
		//======
		// Trees
		//======
		assets.trees.forEach(function (tree) {
			for (var x = randWithin(3,8); Math.round(x) <  256; x+=randWithin(3,8)) {	
				if (surface[Math.round(x)] >= tree.minY && surface[Math.round(x)] <= tree.maxY) {	
					growTree(x,surface[Math.round(x)],tree,layers)
				}
			}
		});
		//===========
		// Structures
		//===========
		if (probability(assets.structures.labyrinth.spawnProbability)) {
			var seedX = 128;
			var seedY = Math.round(surface[seedX] +(256-surface[seedX])/2);
			var rooms = [];
			var prob = assets.structures.labyrinth.roomProbability;
			var dims = assets.structures.labyrinth.rooms;
			// push seed room
			rooms.push(new Room(prob,randWithin(dims.minWidth,dims.maxWidth,true),randWithin(dims.minHeight,dims.maxHeight,true),0,0,'seed'));
			// cycle through rooms
			for (prob; prob >= -10; prob-=10) {
				rooms.forEach(function (room,index) {
					if (!room.created) {
						if (room.left && checkOccupied(rooms,room.x-1,room.y)) {
							rooms.push(new Room(prob,randWithin(dims.minWidth,dims.maxWidth,true),randWithin(dims.minHeight,dims.maxHeight,true),room.x-1,room.y,'right'));
						} else if (room.source != 'left') {rooms[index].left = false;}
						if (room.right && checkOccupied(rooms,room.x+1,room.y)) {
							rooms.push(new Room(prob,randWithin(dims.minWidth,dims.maxWidth,true),randWithin(dims.minHeight,dims.maxHeight,true),room.x+1,room.y,'left'));
						} else if (room.source != 'right') {rooms[index].right = false;}
						if (room.up && checkOccupied(rooms,room.x,room.y-1)) {
							rooms.push(new Room(prob,randWithin(dims.minWidth,dims.maxWidth,true),randWithin(dims.minHeight,dims.maxHeight,true),room.x,room.y-1,'down'));
						} else if (room.source != 'up') {rooms[index].up = false;}
						if (room.down && checkOccupied(rooms,room.x,room.y+1)) {
							rooms.push(new Room(prob,randWithin(dims.minWidth,dims.maxWidth,true),randWithin(dims.minHeight,dims.maxHeight,true),room.x,room.y+1,'up'));
						} else if (room.source != 'down') {rooms[index].down = false;}
						// create the room with blocks
						var roomX = Math.round((assets.structures.labyrinth.gridWidth*room.x));
						var roomY = Math.round((assets.structures.labyrinth.gridHeight*room.y));
						var roomLeft = Math.round(roomX-Math.floor(room.width/2));
						var roomRight = Math.round(roomX+Math.floor(room.width/2));
						var roomTop = roomY - room.height;
						var roomBottom = roomY;
						for (var x = Math.ceil(roomX-assets.structures.labyrinth.gridWidth/2); x <= Math.floor(roomX+assets.structures.labyrinth.gridWidth/2); x++) {
							for (var y = roomY-assets.structures.labyrinth.gridHeight+1; y <= roomBottom; y++) {
								if (x >= roomLeft && x <= roomRight && y >= roomTop && y <= roomBottom) {
									// clear the room
									layers[0][getIndex(x+seedX,y+seedY)] = {data:0}
									// back layer
									layers[1][getIndex(x+seedX,y+seedY)] = {data:dims.backLayer}
									// floors
									if (y == roomTop || y == roomBottom) {
										layers[0][getIndex(x+seedX,y+seedY)] = {data:dims.wall}
									}
									// walls
									if (x == roomLeft || x == roomRight) {
										if (layers[0][getIndex(x+seedX,y+seedY)].data == dims.wall) {
											layers[0][getIndex(x+seedX,y+seedY)] = {data:dims.corner};
										} else {
											layers[0][getIndex(x+seedX,y+seedY)] = {data:dims.wall,rotation:1/2}
										}
									}
								}
								// horizontal passageways
								if (room.left && x <= roomLeft && y <= roomBottom && y >= roomBottom-3) {
									// back layer
									layers[1][getIndex(x+seedX,y+seedY)] = {data:dims.backLayer}
									// floors
									if (y == roomBottom || y == roomBottom - 3) {
										if (layers[0][getIndex(x+seedX,y+seedY)].data == dims.wall) {
											layers[0][getIndex(x+seedX,y+seedY)] = {data:dims.corner};
										} else {
											layers[0][getIndex(x+seedX,y+seedY)] = {data:dims.wall}
										}
									} else {
										// clear the way
										layers[0][getIndex(x+seedX,y+seedY)] = {data:0}
									}
								}
								if (room.right && x >= roomRight && y <= roomBottom && y >= roomBottom-3) {
									// back layer
									layers[1][getIndex(x+seedX,y+seedY)] = {data:dims.backLayer}
									// floors
									if (y == roomBottom || y == roomBottom - 3) {
										if (layers[0][getIndex(x+seedX,y+seedY)].data == dims.wall) {
											layers[0][getIndex(x+seedX,y+seedY)] = {data:dims.corner};
										} else {
											layers[0][getIndex(x+seedX,y+seedY)] = {data:dims.wall}
										}
									} else {
										// clear the way
										layers[0][getIndex(x+seedX,y+seedY)] = {data:0}
									}
								}
								// vertical passageways
								if (room.up && x >= roomX-1 && x <= roomX+1 && y <= roomBottom-1) {
									// back layer
									layers[1][getIndex(x+seedX,y+seedY)] = {data:dims.backLayer}
									// side walls
									if ((x == roomX-1 || x == roomX+1) && y <= roomTop) {
										if (layers[0][getIndex(x+seedX,y+seedY)].data == dims.wall) {
											layers[0][getIndex(x+seedX,y+seedY)] = {data:dims.corner};
										} else {
											layers[0][getIndex(x+seedX,y+seedY)] = {data:dims.wall,rotation:1/2}
										}
									} else if (x == roomX) {
										layers[0][getIndex(x+seedX,y+seedY)] = {data:35}
									}
								}
								if (room.down && x >= roomX-1 && x <= roomX+1 && y >= roomBottom-1) {
									// back layer
									layers[1][getIndex(x+seedX,y+seedY)] = {data:dims.backLayer}
									if (x == roomX) {
										layers[0][getIndex(x+seedX,y+seedY)] = {data:35}
									}
									if ((x == roomX-1 || x == roomX+1) && y == roomBottom) {
										layers[0][getIndex(x+seedX,y+seedY)] = {data:dims.corner};
									}
								}
							}
						}
						// spawn mobs
						world.entities.push(new entity(relToAbs(world.sectors.length,seedX+roomLeft+1),seedY+roomBottom-1.5,0,0,0,assets.gravity,'mob',{type:probability(50)?'zombie':'skeleton'},'player'));
						// spawn chests
						if (room.source === 'seed' || probability(20)) {
							layers[0][getIndex(roomLeft+1+seedX,roomBottom-1+seedY)] = {data:10,storage:JSON.parse(JSON.stringify(assets.storage['chest']))};
							chestLoot(layers[0][getIndex(roomLeft+1+seedX,roomBottom-1+seedY)].storage);
						}
						rooms[index].created = true;
					}
				})
			}
		}
		return layers;
	}
	function chestLoot(storage) {
		assets.chestLoot.forEach(function (loot) {
			var lootItem = new item(loot.type,loot.data,randWithin(loot.min,loot.max,true));
			if (probability(loot.probability) && lootItem.count > 0) {
				storage.body.slots[randWithin(0,storage.body.slots.length-1,true)] = lootItem;	
			}	
		})
	}
	function checkOccupied(array,x,y) {
		var search = true;
		array.forEach(function (element) {
			if (element.x == x && element.y == y) {
				search = false;
			}
		})
		return search;
	}
	function Room(prob,width,height,x,y,source) {
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.probability = prob;
		this.source = source;
		this.up = source === 'up'? true: probability(prob);
		this.down = source === 'down'? true: probability(prob);
		this.left = source === 'left'? true: probability(prob);
		this.right = source === 'right'? true: probability(prob);
		this.created = false;
	}
}
function growTree(x,baseY,tree,layers) {
	var height = randWithin(tree.minHeight,tree.maxHeight);
	// test to see if there is space
	for (var testY = baseY-1; testY>= baseY- height; testY--) {
		if (['air','liquid'].indexOf(getProperties(layers[1][getIndex(x,testY)],['type']).type) == -1) {
			return false;
		}
	}
	for (var y = baseY-1; y >= baseY-height; y--) {
		if (['air','liquid'].indexOf(getProperties(layers[1][getIndex(x,y)],['type']).type) != -1) {
			layers[1][getIndex(x,y)] = JSON.parse(JSON.stringify(tree.log));
		}
	}	
	ellipse(x,y+((tree.leafRatio*height)/2)-1,tree.widthRatio*height,tree.leafRatio*height).forEach(function (point) {
		if (['air','liquid'].indexOf(getProperties(layers[0][getIndex(absToRel(point.x).x,point.y)],['type']).type) != -1) {
			if (Math.round(absToRel(point.x).x) > 0 && Math.round(absToRel(point.x).x) < 256 && Math.round(point.y) >0 && Math.round(point.y) < 256) {
				layers[0][getIndex(absToRel(point.x).x,point.y)] = JSON.parse(JSON.stringify(tree.leaves));
			}
		}
	})
	return true;
}
// parent class of all entities
function entity(x,y,xVel,yVel,xAcc,yAcc,type,data,collision) {
	if (typeof x == 'object') {
		for (var property in x) {
			this[property] = x[property];
		}
	} else {
		this.type = type;
		this.data = data
		this.x = x;
		this.y = y;
		this.xVel = xVel;
		this.yVel = yVel;
		this.xAcc = xAcc;
		this.yAcc = yAcc;
		if (type === 'mob') {
			this.direction = 'right';
			this.sprite = 0;
			this.armRotation = 0;
			this.deltaX = 0;
			this.deltaY = 0;
			var aiSettings;
			var status
			switch (data.type) {
			case 'zombie':
				aiSettings = {
minRange: 0.5,
maxRange: 16,
attack: 'melee',
damage: 10
				}
				status = {oxygen:100,health:200};
				break;
			case 'skeleton':
				aiSettings = {
minRange: 0.5,
maxRange: 16,
attack: 'melee',
damage: 8
				}
				status = {oxygen:100,health:100};
				break;
			case 'jaffa':
				aiSettings = {
minRange: 8,
maxRange: 16,
attack: 'ranged',
damage: 8
				}
				status = {oxygen:100,health:250};
				break;
			}
			this.aiSettings = aiSettings;
			this.actions = {left:false,right:false,jump:false};
			this.status = status;
		}
		this.collision = collision;
		this.lifeTime = type === 'item'? 300:null;
	}
}
entity.prototype.update = function (time) {
	var self = this;
	// Collision
	var bounciness = 0;
	switch (self.type) {
	case 'item': bounciness = 0.2; break;
	}
	var collisions = handleCollision(self,self.type ==='mob',bounciness);
	//===
	// X
	//===
	if (self.hasOwnProperty('actions') && self.actions.left) {
		self.xAcc = -10;
	} else if (self.hasOwnProperty('actions') && self.actions.right) {
		self.xAcc = 10;
	}
	if (collisions.x != 0 && collisions.x == sign(self.xAcc)) {
		self.xVel = 0;
		self.sprite = self.sprite <16?0:self.sprite;
	} else {
		if (Math.abs(self.xVel) <= 0.1) {
			self.xVel = 0;
			self.sprite = self.sprite <16?0:self.sprite;
		}
		if (Math.abs(self.xVel) >= 2) {
			if (self.hasOwnProperty('actions') && self.actions.left) {
				self.xVel = -2;
			} else if (self.hasOwnProperty('actions') && self.actions.right) {
				self.xVel = 2;
			} 
		}
		self.xVel = self.xVel + (self.xAcc*time);
		var deltaX = self.xVel*time;
		self.x += deltaX;
		self.deltaX += Math.abs(deltaX);
	}
	//===
	// Y
	//===
	if (Math.abs(self.yVel) <= assets.terminalVel) {
		self.yVel = self.yVel + (self.yAcc*time);
	}
	if (collisions.y == sign(self.yVel)) {
		self.yVel = 0;
	}
	if (collisions.y == 1 && self.hasOwnProperty('actions') && self.actions.jump) {
		self.yVel = -Math.sqrt(2*assets.gravity);
		self.actions.jump = false;
	}
	var deltaY = self.yVel*time;
	self.y += deltaY;
	self.deltaY += Math.abs(deltaY);		
};	
entity.prototype.render = function (currentLeft,currentTop) {
	var self = this;
	var xCoord = Math.round(((self.x - currentLeft) * client.xScale))
	var yCoord = Math.round(((self.y - currentTop) * client.yScale))
	var width = client.xScale * assets.collision[self.collision][0].width;
	var height = client.yScale * assets.collision[self.collision][0].height;
	switch (self.type) {
	case 'item':
		renderSprite(self.data,xCoord,yCoord,width,height);
		break;
	case 'block':
		renderSprite(self.data,xCoord,yCoord,width,height);
		break;
	case 'mob':
		ctx.save();
		// body
		if (self.sprite < 16 && self.deltaX >= 0.35) {
			if (self.sprite < 3) {
				self.sprite++;
			} else {
				self.sprite = 0;
			}
			self.deltaX = 0;
		} else if (self.sprite >= 16 && self.sprite < 32 && self.deltaY >= 0.25) {
			if (self.sprite < 19) {
				self.sprite++;
			} else {
				self.sprite = 16;
			}
			self.deltaY = 0;
		}
		var sy = Math.floor(self.sprite / 16);
		var sx = self.sprite - (sy * 16);
		ctx.translate(xCoord,0);
		if (self.direction == 'right') {
			ctx.scale(-1,1);
		}
		ctx.drawImage(assets.sprites[self.data.type], sx * 32, sy * 64,32,64,-client.half_xScale,yCoord-client.yScale,client.xScale,client.yScale*2);
		// arm
		if (self.armRotation != 0) {
			ctx.translate(xCoord, yCoord - (7/32)*client.yScale);
			ctx.rotate(self.armRotation);
			ctx.drawImage(assets.sprites[self.data.type], (sx+4) * 32, sy * 64,32,64,-client.half_xScale,-client.yScale+ (7/32)*client.yScale,client.xScale,client.yScale*2);
		} else {
			var bobbingOffset = self.sprite >= 1 && self.sprite <=2? 1/32:0;
			ctx.drawImage(assets.sprites[self.data.type], (sx+4) * 32, sy * 64,32,64,-client.half_xScale,yCoord-client.yScale,client.xScale,client.yScale*2);
		}
		ctx.restore();
		break;
	}
}
entity.prototype.tick = function (index,time) {
	var self = this;
	// item expiration
	if (typeof self.lifeTime === 'number') {
		self.lifeTime -= time*6;
		if (self.lifeTime <= 0) {
			world.entities.splice(index,1);
		}
	}
	// type specific updates
	if (self.type == 'mob') {
		// Mobs
		self.ai(time);
		// health
		if (self.status.health <= 0) {
			world.entities.splice(index,1);
		}
	} else if (self.type == 'block' && self.data.type == 'block' && self.yVel == 0) {
		var block = world.sectors[sectorIndex(absToRel(Math.round(self.x)).sectorX)].layers[0][getIndex(absToRel(Math.round(self.x)).x,Math.round(self.y))];
		if (block != undefined && (block.data == 0|| getProperties(block,['type']).type == 'liquid')) {
			placeBlock(self.x,self.y,0,self.data.data);
		}
		world.entities.splice(index,1);
	}
}
entity.prototype.ai = function (time) {
	var self = this;
	// find target
	world.players.some(function (player,playerIndex) {
		var direction = sign(player.x-self.x);
		if (Math.abs(player.x-self.x) <= self.aiSettings.maxRange) {
			self.direction = direction == 1? 'right':'left';
		}
		if (Math.abs(player.x-self.x) <= self.aiSettings.maxRange && Math.abs(player.x-self.x) >= self.aiSettings.minRange
				&& Math.abs(player.y-self.y) <= self.aiSettings.maxRange) {
			if (
					// block in path
					(self.actions.left||self.actions.right) && (
						((getProperties(world.sectors[sectorIndex(absToRel(self.x).sectorX)].layers[0][getIndex(absToRel(self.x).x+direction,self.y+0.5)],['collision']).collision == 'full'
								|| (getProperties(world.sectors[sectorIndex(absToRel(self.x).sectorX)].layers[0][getIndex(absToRel(self.x).x+direction,self.y+0.5)],['collision']).collision != 'none' && self.xVel == 0)) 
							&& self.yVel == 0
							&& validJump(self.x+direction,self.y+0.5))
						)) {
				self.actions.jump = true;
			} else if (
					// hole in path
					getProperties(world.sectors[sectorIndex(absToRel(self.x).sectorX)].layers[0][getIndex(absToRel(self.x).x+0.5*direction,self.y+1.5)],['collision']).collision == 'none'
					&& ((getProperties(world.sectors[sectorIndex(absToRel(self.x).sectorX)].layers[0][getIndex(absToRel(self.x).x+1.5*direction,self.y+1.5)],['collision']).collision != 'none' && validJump(self.x+1.5*direction,self.y+1.5))
						|| (getProperties(world.sectors[sectorIndex(absToRel(self.x).sectorX)].layers[0][getIndex(absToRel(self.x).x+1.5*direction,self.y+0.5)],['collision']).collision != 'none' && validJump(self.x+1.5*direction,self.y+0.5))
						)) {
				self.actions.jump = true;
			} else {
				self.actions.jump = false;
			}
			self.actions[direction == 1? 'right':'left'] = true;
			self.actions[direction == -1? 'right':'left'] = false;
		} else {
			if (self.aiSettings.attack == 'melee' && Math.abs(player.x-self.x) <= self.aiSettings.minRange && Math.abs(player.y-self.y) <= self.aiSettings.minRange) {
				world.players[playerIndex].status.health -= time*6*self.aiSettings.damage;
			}
			self.actions.left = false;
			self.actions.right = false;
			self.actions.jump = false;
			self.xVel = 0;
			self.xAcc = 0;
			self.sprite = self.sprite <16?0:self.sprite;
			if (Math.abs(player.x-self.x) <= 0.5 && Math.abs(player.y-self.y) <= 1) {
				world.players[playerIndex].health -= 0.01
			}
		}
	})
}
function validJump(x,y) {
	return getProperties(world.sectors[sectorIndex(absToRel(x).sectorX)].layers[0][getIndex(absToRel(x).x,y-1)],['collision']).collision == 'none'
	&& getProperties(world.sectors[sectorIndex(absToRel(x).sectorX)].layers[0][getIndex(absToRel(x).x,y-2)],['collision']).collision == 'none';
}
// create an item
function item(type,data,count) {
	this.type = type;
	this.data = data;
	this.count = count;
}
// create a player
function player(x,y,xVel,yVel,xAcc,yAcc,name) {
	if (typeof x == 'object') {
		for (var property in x) {
			this[property] = x[property];
		}
	} else {
		this.type = 'player';
		this.connected = true;
		this.name = name;
		this.collision = 'player';
		this.invCrafting = JSON.parse(JSON.stringify(assets.storage['invCrafting']));
		this.inventory = JSON.parse(JSON.stringify(assets.storage['inventory']));
		this.hotbar = JSON.parse(JSON.stringify(assets.storage['hotbar']));
		this.inStorageGUI = false;
		this.dragItem = null;
		this.activeGUI = null;
		this.helpTab = 'craftingRecipes';
		this.hotbarIndex = 0;
		this.skills = {
woodcutting: 0,
mining: 0,
construction: 0,
crafting: 0,
smithing: 0,
farming: 0,
cooking: 0,
hunting: 0
		};
		this.status = {
oxygen: 100,
fatigue: 100,
hunger: 100,
thirst: 100,
health: 100		
		};
		this.x = x;
		this.y = y;
		this.xVel = xVel;
		this.yVel = yVel;
		this.xAcc = xAcc;
		this.yAcc = yAcc;
		this.direction = 'right';
		this.state = 'walk';
		this.sprite = 0;
		this.armRotation = 0;
		this.deltaX = 0;
		this.deltaY = 0;
		this.miningPercent = 0;
		this.lastMiningIndex = 0;
		this.gameMode = 'survival';
		this.fly = false;
		this.terminalVel = 54;
	} 
	this.render = function () {
		var self = this;
		// fill the sky
		var time = world.time
		if (time >= 8 && time <= 20) {
			// day
			ctx.fillStyle = 'rgb(160,206,204)';
		} else if (time >7 && time <8) {
			// dawn
			ctx.fillStyle = 'rgb(' + Math.round(160*(time-7)) + ',' + Math.round(206*(time-7)) + ',' + Math.round(204*(time-7)) + ')'
		} else if (time >20 && time < 21) {
			// dusk
			ctx.fillStyle = 'rgb(' + Math.round(160*(1-(time-20))) + ',' + Math.round(206*(1-(time-20))) + ',' + Math.round(204*(1-(time-20))) + ')'
		} else {
			// night
			ctx.fillStyle = 'rgb(32,32,32)';
		}
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		// the sun
		if (time >= 8 && time <= 20) {
			var angle = 3*Math.PI/8;
			var sunX = Math.cos((((time-7)/12)*angle)+ (Math.PI-angle)/2) * canvas.width;
			var sunY = Math.sin((((time-7)/12)*angle)+ (Math.PI-angle)/2) * canvas.height;
			ctx.drawImage(assets.sun,0,0,64,64,client.half_cWidth + sunX-128,canvas.height-sunY,256,256);
		}
		// the view
		var currentLeft = self.x - client.half_vWidth;
		var currentTop = self.y - client.half_vHeight;
		// parallax
		ctx.drawImage(assets.parallax,currentLeft,currentTop/2,client.view.width*8,client.view.height*8,0,0,canvas.width,canvas.height);
		for (var y = Math.round(currentTop) ; y < Math.round(currentTop) + client.view.height + 1 ; y++) {		
			for (var x = Math.round(currentLeft) ; x < Math.round(currentLeft) + client.view.width + 1; x++) {
				var sectorX = absToRel(x).sectorX;
				var currentSector = sectorIndex(sectorX)
				if (currentSector === undefined) {
					world.sectors.push(new sector(sectorX));
					currentSector = sectorIndex(sectorX);
				}
				var xCoord = Math.round((x - currentLeft) * client.xScale);
				var yCoord = Math.round((y - currentTop) * client.yScale);
				var block = [];
				if (y >= 0 && y < 256) {				
					block[0] = JSON.parse(JSON.stringify(world.sectors[currentSector].layers[0][getIndex(absToRel(x).x, y)]));
					if (block[0].data != 0) {
						block[0] = getProperties(block[0],['transparent','collision','model','rotation','mirrored']);
					}
					if (block[0].data == 0 || block[0].transparent || (['full','collision'].indexOf(block[0].model) == -1 || (block[0].model == 'collision' && block[0].collision != 'full'))) {
						block[1] = JSON.parse(JSON.stringify(world.sectors[currentSector].layers[1][getIndex(absToRel(x).x, y)]));
						if (block[1].data != 0) {
							block[1] = getProperties(block[1],['model','rotation','mirrored','name']);
							var darkness = 0.5;
							if (block[1].name.search('Log') != -1) {
								darkness = 0.25;
							}
							//renderBlock(block[1],xCoord,yCoord,darkness);
							renderSprite({type:'block',data:block[1]},xCoord,yCoord,client.xScale,client.yScale,darkness)
						}
					}
				} else if (y >= 256) {
					block[0] = getProperties({data:42},['transparent','collision','model','rotation','mirrored']);
				}
				if (y >= 0 && block[0].data != 0) {
					//renderBlock(block[0],xCoord,yCoord);
					renderSprite({type:'block',data:block[0]},xCoord,yCoord,client.xScale,client.yScale)
				}
			}
		}
		// block cracks
		if (self.miningPercent > 0 && self.miningPercent <= 1) {
			var width = Math.ceil(self.miningPercent/0.25)*2;
			ctx.drawImage(assets.gui,16+Math.round((8-width)/2),0+Math.round((8-width)/2),width,width,Math.round(((Math.round(client.gameX()) - currentLeft) * client.xScale) - (width/8*client.xScale)/2),Math.round(((Math.round(client.gameY()) - currentTop) * client.yScale) - (width/8*client.yScale)/2),(width/8)*client.xScale,(width/8)*client.yScale)
		}
		// entities
		world.entities.forEach(function (entity) {
			if (entity.x >= Math.round(currentLeft)-1 && entity.x <= Math.round(currentLeft) + client.view.width + 1 && entity.y >= Math.round(currentTop)-1 && entity.y <= Math.round(currentTop) + client.view.height + 1) {				
				entity.render(currentLeft,currentTop);
			}
		})
		// player
		world.players.forEach(function (player) {
			if (player.x >= Math.round(currentLeft)-1 && player.x <= Math.round(currentLeft) + client.view.width + 1 && player.y >= Math.round(currentTop)-1 && player.y <= Math.round(currentTop) + client.view.height + 1) {
				ctx.save();
				/* if (player.direction == 'right') {
					ctx.translate(canvas.width,0);
					ctx.scale(-1,1);
				} */
				if (player.state != 'climb' && player.deltaX >= 0.5) {
					if (player.sprite < 3) {
						player.sprite++;
						if (player.sprite == 2 && ['air','liquid'].indexOf(getProperties(world.sectors[sectorIndex(absToRel(player.x).sectorX)].layers[0][getIndex(player.x,player.y+1.5)],['type']).type) == -1) {
							audio('step_stone');
						}
					} else {
						player.sprite = 0;
						
					}
					player.deltaX = 0;
				} else if (player.state == 'climb' && player.deltaY >= 0.25) {
					if (player.sprite < 19) {
						player.sprite++;
					} else {
						player.sprite = 16;
					}
					player.deltaY = 0;
				}
				var xCoord = Math.round(((player.x - currentLeft) * client.xScale))
				var yCoord = Math.round(((player.y - currentTop) * client.yScale))
				var sy = Math.floor(player.sprite / 16);
				var sx = player.sprite - (sy * 16);
				ctx.translate(xCoord,0);
				if (player.direction == 'right') {
					ctx.scale(-1,1);
				}
				ctx.drawImage(assets.sprites.player, sx * 32, sy * 64,32,64,-client.half_xScale,yCoord-client.yScale,client.xScale,client.yScale*2);
				var equippedItem = null;
				if (player.hotbar.body.slots[player.hotbarIndex] != null) {
					var equippedItem = player.hotbar.body.slots[player.hotbarIndex];
					var width = client.xScale * assets.collision['drop'][0].width;
					var height = client.yScale * assets.collision['drop'][0].height;
				}
				ctx.restore();
				// the arm
				ctx.save();
				if (player.armRotation != 0) {
					ctx.translate(xCoord, yCoord - (7/32)*client.yScale);
					if (player.direction == 'right') {
						ctx.scale(-1,1);
					}
					ctx.rotate(player.armRotation);
					if (equippedItem != null) {
						renderSprite(equippedItem,0,(15/32) * client.yScale,width,height)
					}
					ctx.drawImage(assets.sprites.player, (sx+4) * 32, sy * 64,32,64,-client.half_xScale,-client.yScale+ (7/32)*client.yScale,client.xScale,client.yScale*2);
				} else {
					ctx.translate(xCoord, yCoord);
					if (player.direction == 'right') {
						ctx.scale(-1,1);
					}
					var bobbingOffset = player.sprite >= 1 && player.sprite <=2? 1/32:0;
					if (equippedItem != null) {
						renderSprite(equippedItem,client.half_cWidth-(bobbingOffset*client.xScale),client.half_cHeight + ((8/32) - bobbingOffset)* client.yScale,width,height);
					}
					ctx.drawImage(assets.sprites.player, (sx+4) * 32, sy * 64,32,64,Math.round(-client.half_xScale),Math.round(-client.yScale),client.xScale,client.yScale*2);
				}
				ctx.restore();
			}
		});
		// overlays
		if (time <= 7 || time >= 21) {
			// night
			ctx.fillStyle = 'rgba(0,0,0,0.8)';
			ctx.fillRect(0,0,canvas.width,canvas.height)
		} else if (time >7 && time <8) {
			// dawn
			ctx.fillStyle = 'rgba(0,0,0,' + (0.8*(1-(time-7))) + ')';
			ctx.fillRect(0,0,canvas.width,canvas.height)
		} else if (time >20 && time < 21) {
			// dusk
			ctx.fillStyle = 'rgba(0,0,0,' + (0.8*(time-20)) + ')';
			ctx.fillRect(0,0,canvas.width,canvas.height)
		}
		// water
		if (getProperties(world.sectors[sectorIndex(absToRel(self.x).sectorX)].layers[0][getIndex(absToRel(self.x).x,self.y-0.5)],['type']).type == 'liquid') {
			ctx.drawImage(assets.screenSheet,384,0,128,128,0,0,canvas.width,canvas.height);
			ctx.fillStyle = 'rgba(0,0,128,0.2)'
			ctx.fillRect(0,0,canvas.width,canvas.height)
		}
		// blood
		if (self.status.health <= 70) {
			ctx.drawImage(assets.screenSheet,384,0,128,128,0,0,canvas.width,canvas.height);
			ctx.fillStyle = 'rgba(128,0,0,' + 0.7*(70-self.status.health)/100 + ')'
			ctx.fillRect(0,0,canvas.width,canvas.height)
		}
		// storage GUIs
		if (self.inStorageGUI) {
			// active GUI
			if (self.activeGUI !== null) {
				itemUI(self.activeGUI);
			}
			itemUI(self.inventory);
		} else {
			// transparent hotbar
			ctx.save();
			ctx.globalAlpha = 0.5;
			ctx.drawImage(assets.gui, 0, 92, 80, 16, client.half_cWidth-client.guiScale*40, client.half_cHeight+client.guiScale*48, client.guiScale*80, client.guiScale*16);
			ctx.restore();
		}
		// display player stats
		ctx.save();
		ctx.globalAlpha = 0.75;
		var statIndex = 0;
		for (var stat in self.status) {
			ctx.drawImage(assets.gui,0,307,30,6,0,canvas.height-((statIndex*6+6)*client.guiScale),30*client.guiScale,6*client.guiScale);
			var width = Math.round((self.status[stat]/100) * 28);
			ctx.drawImage(assets.gui,0,313+(statIndex*4),width,4,client.guiScale,canvas.height-((statIndex*6+5)*client.guiScale),width*client.guiScale,4*client.guiScale);
			statIndex++;
		}
		ctx.restore();
		// hotbarIndex indicator
		ctx.drawImage(assets.gui, 8,0,8,8,Math.round((((4+self.hotbarIndex )* (client.guiScale*8)) + (canvas.width-canvas.height)/2))-client.guiScale*4,Math.round((15* (client.guiScale*8)))-client.guiScale*4,client.guiScale*8,client.guiScale*8);
		itemUI(self.hotbar);
		if (self.inStorageGUI && self.dragItem != null) {
			renderSprite(self.dragItem,client.canvasX,client.canvasY,client.guiScale*5,client.guiScale*5);
			if (self.dragItem.type == 'item' && getProperties(self.dragItem.data,['type'],self.dragItem.type).type != 'item') {
				var tool = getProperties(self.dragItem.data,['durability'],self.dragItem.type);
				if (tool.durability > 0 ) {
					var width = Math.round(32*tool.durability);
					ctx.drawImage(assets.gui,0,275,width,32,client.canvasX-client.guiScale*2.5,client.canvasY-client.guiScale*2.5,(client.guiScale*5)*(width/32),(client.guiScale*5));
				} else {
					ctx.drawImage(assets.gui,32,275,32,32,client.canvasX-client.guiScale*2.5,client.canvasY-client.guiScale*2.5,client.guiScale*5,client.guiScale*5);
				}
			}
			// count
			if (self.dragItem.count > 1) {
				text(self.dragItem.count.toString(),client.canvasX-client.guiScale*3,client.canvasY,client.guiScale*3);
			}
		}
		// chat
		if (client.inChat) {
			ctx.fillStyle = 'rgba(255,255,255,0.25)';
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.fillStyle = 'rgba(255,255,255,0.75)';
			var height = client.chat != ''?client.guiScale*6*(13/12)*getCoords(client.chat.length-1,Math.floor((canvas.width)/((client.guiScale*6 / 2)*(7 / 6)))).y:0;
			ctx.fillRect(0,0,canvas.width,client.guiScale*6+height)
			text(client.chat,0,0,client.guiScale*6);
			
		}
	};
	this.update = function () {
		var self = this;
		// Collision
		var collisions = handleCollision(self,true);
		//===
		// X
		//===
		var xFriction = 10;
		// calculate new acceleration
		if (!client.pause) {
			if (!client.keyMap[client.keyBinds.left]&&!client.keyMap[client.keyBinds.right]) {
				self.xVel = 0;
				self.xAcc = 0;	
				self.sprite = self.sprite <16?0:self.sprite;
			} else if (client.keyMap[client.keyBinds.left]&&client.keyMap[client.keyBinds.right]) {
				self.xVel = 0;
				self.xAcc = 0;
				self.sprite = self.sprite <16?0:self.sprite;
				client.keyLastMap[client.keyBinds.left] = false;
				client.keyLastMap[client.keyBinds.right] = false;
			} else if (!client.keyLastMap[client.keyBinds.left] && client.keyMap[client.keyBinds.left]) {
				self.direction = 'left';
				if (collisions.x != -1) {
				// start moving left
					self.xVel = -3;
					self.xAcc = -xFriction;
					self.deltaX = 0;
					client.keyLastMap[client.keyBinds.left] = true;
				}
			} else if (!client.keyLastMap[client.keyBinds.right] && client.keyMap[client.keyBinds.right]) {
				self.direction = 'right';
				if (collisions.x != 1) {
					// start moving right
					self.xVel = 3;
					self.xAcc = xFriction;
					self.deltaX = 0;
					client.keyLastMap[client.keyBinds.right] = true;
				}
			}
		} else {
			self.xVel = 0;
			self.xAcc = 0;	
			self.sprite = self.sprite <16?0:self.sprite;
		}
		if (Math.abs(self.xVel) >= 7) {
			if (client.keyMap[client.keyBinds.left]) {
				self.xVel = -7;
			} else if (client.keyMap[client.keyBinds.right]) {
				self.xVel = 7;
			}
		}
		// calculate new velocity
		if (collisions.x != sign(self.xAcc)) {
			self.xVel = self.xVel + (self.xAcc*client.time);
		} else {
			self.deltaX = 0;
			self.sprite = self.sprite <16?0:self.sprite;
		}
		// calculate displacement
		if (collisions.x == 0 || collisions.x != sign(self.xVel)) {
			var deltaX = self.xVel*client.time;
			self.x += deltaX;
			self.deltaX += Math.abs(deltaX);
		}
		//===
		// Y 
		//===
		// calculate new acceleration
		if (getProperties(world.sectors[sectorIndex(absToRel(self.x).sectorX)].layers[0][getIndex(absToRel(self.x).x,self.y)],['type']).type === 'liquid') {
			self.terminalVel = 3;
			if (!client.pause && (client.keyMap[client.keyBinds.jump] || client.keyMap[client.keyBinds.forward])) {
				self.yAcc = -assets.gravity/2;
			} else {
				self.yAcc = assets.gravity/4;
			}
		} else {
			self.terminalVel = 54;
			self.yAcc = assets.gravity;
		}
		// calculate new velocity
		if (!client.pause && client.keyMap[client.keyBinds.jump] && collisions.y == 1) {
			self.yVel = -Math.sqrt(2*assets.gravity);
		} else if (getProperties(world.sectors[sectorIndex(absToRel(self.x).sectorX)].layers[0][getIndex(absToRel(self.x).x,self.y+0.5)],['name']).name.search('Ladder') != -1 || self.fly) {
			if (getProperties(world.sectors[sectorIndex(absToRel(self.x).sectorX)].layers[0][getIndex(absToRel(self.x).x,self.y)],['name']).name.search('Ladder') == -1 && !self.fly) {
				self.yVel = 0;
			} else  {
				self.state = 'climb';
				self.armRotation = 0;
				if (!client.pause && (client.keyMap[client.keyBinds.forward] || client.keyMap[client.keyBinds.jump])) {
					if (self.state == 'climb') {
						self.yVel = -Math.sqrt(2*assets.gravity)/2;
					}
					if (self.fly) {
						self.yVel = -Math.sqrt(2*assets.gravity);
					}
				} 
			}
			if (!client.pause && client.keyMap[client.keyBinds.back]) {
				self.yVel = Math.sqrt(2*assets.gravity);
			}
			if (!client.keyMap[client.keyBinds.forward] && !client.keyMap[client.keyBinds.back]){
				self.yVel = 0;
			}
			if (self.sprite < 16) {
				self.sprite = 16;
			}
		} else {
			self.state = 'walk';
			if (self.state == 'climb') {
				self.sprite = 0
			} else if ((collisions.y == 0 || collisions.y != sign(self.yAcc))&& Math.abs(self.yVel) <= self.terminalVel) {
				self.yVel = self.yVel + (self.yAcc*client.time);
			} else if (Math.abs(self.yVel) > self.terminalVel) {
				self.yVel = self.terminalVel*sign(self.yVel);
			}
		}
		// calculate displacement
		if (collisions.y != sign(self.yVel)) {
			var deltaY = self.yVel*client.time;
			self.y += deltaY;
			self.deltaY += Math.abs(deltaY);
		}
		// display coordinates
		var infoBar = document.getElementById("infoBar");
		infoBar.innerHTML = 'Coords: ('+ self.x.toFixed(1)+', '+self.y.toFixed(1) + ') Velocity: (' + world.players[client.playerIndex].xVel.toFixed(1) + ', ' + world.players[client.playerIndex].yVel.toFixed(1) + ')';
		//===================
		// Mining and Placing
		//===================
		if (!client.pause) {
			var a = Math.abs(client.canvasX-client.half_cWidth)/client.xScale;
			var b = Math.abs(client.canvasY-client.half_cHeight)/client.yScale;
			if (Math.sqrt((a*a)+(b*b)) <= 5 && isBetween(0,Math.round(client.gameY()),256)) {
				var coordinate = {x: absToRel(client.gameX()).x, y: client.gameY()};
				var layer = client.keyMap[client.keyBinds.shift]?1:0;
				var block = world.sectors[sectorIndex(absToRel(client.gameX()).sectorX)].layers[layer][getIndex(coordinate.x,coordinate.y)];
				var equippedItem = self.hotbar.body.slots[self.hotbarIndex];
				var equippedTool = null;
				if (equippedItem != null && equippedItem.type == 'item') {
					equippedTool = getProperties(equippedItem.data,['tier','type'],'item');
				}
				if (!client.mouseLastMap[client.mouseBinds.place] && client.mouseMap[client.mouseBinds.place]) {
					//============ 
					// Right click
					//============
					
					if (equippedItem != null) {
						for (var index = self.inventory.body.slots.length-1; index >= 0; index--) {
							if (self.inventory.body.slots[index] != null && compareTDC(self.inventory.body.slots[index],equippedItem)) {
								var block = world.sectors[sectorIndex(absToRel(client.gameX()).sectorX)].layers[layer][getIndex(coordinate.x,coordinate.y)]
								// special cases
								if (equippedTool != null && equippedTool.type != 'item' && equippedTool.durability > 0) {
									for (var layer = 0; layer <= 1; layer++) {
										var block = world.sectors[sectorIndex(absToRel(client.gameX()).sectorX)].layers[layer][getIndex(coordinate.x,coordinate.y)]
										var blockName = getProperties(block,['name']).name;
										if (equippedTool.type == 'hammer' && ['air','liquid'].indexOf(getProperties(block,['type']).type) == -1 && (!block.hasOwnProperty('network')||block.network.type != 'wire')) {
											// Hammer tool
											if ((client.keyMap[client.keyBinds.shift]&& blockName.search('Bed') == -1 && blockName.search('Door') == -1)||block.hasOwnProperty('network')) {
												// rotate block by PI/2
												block.rotation = block.hasOwnProperty('rotation')?block.rotation + 0.5:0.5;
												if (block.rotation >= 2) {
													block.rotation = 0;
												}
												if (block.hasOwnProperty('network')) {
													block.network.ports = networkRotation(block.network.ports,0.5);
												}
											} else {
												// mirror block
												block.mirrored = !block.hasOwnProperty('mirrored') || !block.mirrored? true:false;
											}
											self.inventory.body.slots[index].data.durability -= 0.001;
											if (self.inventory.body.slots[index].data.durability < 0) {
												self.inventory.body.slots[index].data.durability = 0;
											}
											equippedItem.data.durability = self.inventory.body.slots[index].data.durability;
											client.mouseLastMap[client.mouseBinds.place] = true;
											break;
										} else if (equippedTool.type == 'brush' && ['air','liquid'].indexOf(getProperties(block,['type']).type) == -1) {
											// Paint Brush
											if (client.keyMap[client.keyBinds.shift]) {
												delete block.color;
											} else if (!block.hasOwnProperty('color') || block.color == null) {
												block.color = 0;
											} else if (block.color == 15) {
												delete block.color
											} else {
												block.color++;
											}
											self.inventory.body.slots[index].data.durability -= 0.001;
											if (self.inventory.body.slots[index].data.durability < 0) {
												self.inventory.body.slots[index].data.durability = 0;
											}
											equippedItem.data.durability = self.inventory.body.slots[index].data.durability;
											client.mouseLastMap[client.mouseBinds.place] = true;
											break;
										}
									}
								} else if (equippedItem.type == 'item' && equippedItem.data.hasOwnProperty('blocks')) {
									// Multi-blocks
									equippedItem.data.blocks.data.forEach(function (subBlock,subBlockIndex) {
										if (subBlock != null) {
											world.sectors[sectorIndex(absToRel(client.gameX()).sectorX)].layers[layer][getIndex(coordinate.x+getCoords(subBlockIndex,equippedItem.data.blocks.width).x,coordinate.y+getCoords(subBlockIndex,equippedItem.data.blocks.width).y)] = JSON.parse(JSON.stringify(subBlock));
										}
									})
									client.mouseLastMap[client.mouseBinds.place] = true;
									self.inventory.body.slots[index].count--;
									if (self.inventory.body.slots[index].count == 0) {
										self.inventory.body.slots[index] = null;
									}
								} else if (equippedItem.type == 'block' && ['liquid','air'].indexOf(getProperties(block,['type']).type) != -1) {
									placeBlock(coordinate.x,coordinate.y,layer,equippedItem.data);
									client.mouseLastMap[client.mouseBinds.place] = true;
									self.inventory.body.slots[index].count--;
									if (self.inventory.body.slots[index].count == 0) {
										self.inventory.body.slots[index] = null;
									}
								}
							} 
						}
					}
					if (block.hasOwnProperty('storage')) {
						// Open storage object
							self.activeGUI = block.storage;
							self.inStorageGUI = true;
							client.mouseLastMap[client.mouseBinds.place] = true;
							client.pause = true;
					} else if ([68,69].indexOf(block.data) != -1) {
						if (block.data == 68) {
							world.sectors[sectorIndex(absToRel(client.gameX()).sectorX)].layers[layer][getIndex(coordinate.x,coordinate.y)].data = 69;
						} else {
							world.sectors[sectorIndex(absToRel(client.gameX()).sectorX)].layers[layer][getIndex(coordinate.x,coordinate.y)].data = 68;
						}
						client.mouseLastMap[client.mouseBinds.place] = true;
					}
				} else if (client.mouseMap[client.mouseBinds.mine]) {
					//===========
					// Left Click
					//===========
					
					// fighting
					var damage = client.time * 100;
					var range = 1;
					if (equippedTool != null) {
						for (var index = self.inventory.body.slots.length-1; index >= 0; index--) {
							if (self.inventory.body.slots[index] != null && compareTDC(self.inventory.body.slots[index],equippedItem)) {
								// special cases
								if (equippedTool.type == 'sword' && equippedTool.durability > 0) {
									// sword damage
									damage *= equippedTool.tier
									// increase range
									range += equippedTool.tier/3;
									// deplete durability
									self.inventory.body.slots[index].data.durability -= 0.00018/equippedTool.tier;
									if (equippedTool.durability < 0) {
										self.hotbar.body.slots[self.hotbarIndex].durability = 0;
									}
									self.hotbar.body.slots[self.hotbarIndex].data.durability = self.inventory.body.slots[index].data.durability;
								}
							}
						}
					}
					var fight = false;
					world.entities.some(function (entity,index) {
						// cursor on entity
						//client.gameX() >= entity.x-assets.collision[entity.collision][0].width/2 && client.gameX() <= entity.x+assets.collision[entity.collision][0].width/2 && client.gameY() >= entity.y-assets.collision[entity.collision][0].height/2 && client.gameY() <= entity.y+assets.collision[entity.collision][0].height/2
						if (entity.type == 'mob' && ((self.direction == 'left' && self.x-entity.x < range)||(self.direction == 'right' && entity.x-self.x < range)) && Math.abs(self.y-entity.y) < range) {
							world.entities[index].status.health -= damage;
							self.miningPercent = 0;
							// rotate arm
							if (self.state != 'climb') {
								if (self.armRotation <= 0) {
									self.armRotation = 3;
									// sound //
								} else {
									self.armRotation -= 0.1;
								}
							}
							fight = true;
							return true;
						}
					})
					if (!fight) {
						// mining
						var miningIndex = getIndex(coordinate.x,coordinate.y);
						if (miningIndex != self.lastMiningIndex) {
							self.miningPercent = 0;
							self.lastMiningIndex = miningIndex;
						}
						for (var layer = 0; layer <= 1; layer++) {
							var block = getProperties(world.sectors[sectorIndex(absToRel(client.gameX()).sectorX)].layers[layer][miningIndex],['type','durability','tier','drop']);
							if (['mantle','air','liquid'].indexOf(getProperties(block,['type']).type) == -1) {
 								var equippedItem = self.hotbar.body.slots[self.hotbarIndex];
								var equippedTool = null;
								if (equippedItem != null && equippedItem.type == 'item') {
									equippedTool = getProperties(equippedItem.data,['tier','type'],'item');
								}
								var validTool = false;
								var tierMultiplier = 1;
								// deplete tool
								if (equippedTool != null && equippedTool.type != 'item') {
									for (var index = self.inventory.body.slots.length-1; index >= 0; index--) {
										if (self.inventory.body.slots[index] != null && self.inventory.body.slots[index].type == equippedItem.type && self.inventory.body.slots[index].data.data == equippedTool.data && self.inventory.body.slots[index].data.durability > 0) {
											if (equippedTool.tier >= block.tier && (equippedTool.type == 'pickaxe' && block.type == 'stone')||(equippedTool.type == 'axe' && block.type == 'wood')||(equippedTool.type == 'shovel' && block.type == 'dirt')) {
												validTool = true;
												tierMultiplier = equippedTool.tier*2;
											}
											self.inventory.body.slots[index].data.durability -= 0.00018/equippedTool.tier;
											if (equippedTool.durability < 0) {
												self.hotbar.body.slots[self.hotbarIndex].durability = 0;
											}
											self.hotbar.body.slots[self.hotbarIndex].data.durability = self.inventory.body.slots[index].data.durability;
										}
									}
								}
								if (equippedItem != null && equippedItem.type === 'item' && getProperties(equippedItem.data,['name'],'item').name === 'World Destroyer') {
									validTool = true;
									self.miningPercent = 1;
								} else {
									self.miningPercent += (client.time/block.durability)* tierMultiplier;
								}
								// rotate arm
								if (self.sprite <16) {
									if (self.armRotation <= 0) {
										self.armRotation = 3;
										if (['wood','stone','dirt'].indexOf(block.type) != -1) {
											audio('mining_'+block.type);
										}
									} else {
										self.armRotation -= 0.1;
									}
								}
								// break the block
								if (self.miningPercent >= 1) {				
									breakBlock(client.gameX(),client.gameY(),layer,validTool)
									self.miningPercent = 0;
								}
								break;
							} else if (layer == 1) {
								self.armRotation = 0;
							}
						}
					}
				} else {
					self.miningPercent = 0;
					self.armRotation = 0;
				}
			} else {
				self.miningPercent = 0;
				self.armRotation = 0;
			}
		}
		//==========
		// Keyboard Input
		//==========
		if (!client.inMenu) {
			if (client.inChat) {
				if (!client.keyLastMap[13] && client.keyMap[13]) {
					var command = client.chat.toLowerCase().split(' ');
					if (command[0].charAt(0) == '/') {
						switch (command[0]) {
						case '/spawn':
							var hackStack;
							if (command.length == 2) {
								hackStack = JSON.parse(command[1])
							} else if (command.length > 2) {
								hackStack = new item('item',{data:0},Number(command[1]));
								var name = '';
							for(index = 2; index < command.length; index++) {
								name += command[index];
								if (index < command.length-1) {
									name += ' ';
								}
							}
							// search for name
							assets.itemData.some(function (item,index) {
								if (item.name.toLowerCase() == name) {
									hackStack.type = 'item';
									hackStack.data = JSON.parse(JSON.stringify(assets.itemData[index]));
									if (getProperties(hackStack.data,['type'],'item').type != 'item') {
										hackStack.data.durability = 1;
									}
									return true;
								}
							})
							assets.blockData.some(function (block,index) {
								if (block.name.toLowerCase() == name) {
									hackStack.type = 'block';
									hackStack.data = JSON.parse(JSON.stringify(assets.blockData[index]));
									return true;
								}
							})
							switch (name) {
							case 'elm chest': hackStack.data.storage = JSON.parse(JSON.stringify(assets.storage['chest'])); break;
							case 'mud furnace': hackStack.data.storage = JSON.parse(JSON.stringify(assets.storage['furnace'])); break;
							case 'hammering bench': hackStack.data.storage = JSON.parse(JSON.stringify(assets.storage['hammering'])); break;
							case 'crafting table': hackStack.data.storage = JSON.parse(JSON.stringify(assets.storage['crafting'])); break;
							}
							}
							// create entity
							if (hackStack.hasOwnProperty('type') && typeof hackStack.type == 'string'&& hackStack.hasOwnProperty('data') && typeof hackStack.data == 'object' && hackStack.hasOwnProperty('count') && typeof hackStack.count == 'number') {
								world.entities.push(new entity(self.x,self.y,self.xVel,self.yVel,0,0,'item',hackStack,'drop'));
							}
							break;
						case '/gravity':
							assets.gravity = command[1] != undefined?Number(command[1]):20;
							break;
						case '/debuff':
							for (var stat in world.players[client.playerIndex].status) {
								self.status[stat] = 0;
							}
							break;
						case '/buff':
							for(var stat in world.players[client.playerIndex].status) {
								self.status[stat] = 100;
							}
							break;
						case '/gamemode':
							if (['creative','survival'].indexOf(command[1]) != -1) {
								self.gameMode = command[1];
							}
							break;
						case '/fly':
							self.fly = !self.fly;
							break;
						case '/entity':
							for (var i = 0; i < command[1];i++) {
								world.entities.push(new entity(client.gameX(),client.gameY(),0,0,0,assets.gravity,command[2],JSON.parse(command[3]),command[4]));
							}
							break;
						case '/player':
							world.players.push(new player(client.gameX(),client.gameY(),0,0,0,assets.gravity,'dummy'));
							break;
						case '/remove':
							var type = null;
							switch (command[1]) {
							case 'mobs': type = 'mob'; break;
							case 'items':type = 'item'; break;
							case 'blocks': type = 'block'; break;
							}
							for (var index = world.entities.length-1; index >= 0; index--) {
								if (type === null || world.entities[index].type === type) {
									world.entities.splice(index,1);
								}
							}
							break;
						case '/kill':
							self.status.health = -1;
							break;
						case '/explode':
							var layer = command[3] !== undefined?Number(command[3]):0;
							ellipse(absToRel(Math.round(self.x)).x,Math.round(self.y),command[1] === undefined?7:Number(command[1]),command[2] === undefined?7:Number(command[2])).forEach(function (point) {
								breakBlock(point.x,point.y,layer);
							})
							break;
						case '/time':
							if (Number(command[1]) != NaN) {
								world.time = Number(command[1]);
							}
							break;
						case '/view':
							if (command[1] != undefined && command[2] == undefined) {
								client.view.height = Number(command[1]);
								client.updateView();
							}
							break;
						case '/tp':
							if (command[1] != undefined) {
								self.x = Number(command[1]);
								self.y = command[2] != undefined?self.y = Number(command[2]):self.y = world.sectors[sectorIndex(absToRel(self.x).sectorX)].surface[Math.round(absToRel(self.x).x)]-1.5;
							}
							break;
						case '/eval':
							eval(command[1]);
							break;
						}
					}
					client.lastChat = client.chat;
					client.chat = '';
					client.keyLastMap[13] = true;
					client.inChat = false;
					client.pause = false;
				}
				// process text
				if (!client.keyLastMap[client.keyBinds.escape] && client.keyMap[client.keyBinds.escape]) {
					client.chat = '';
					client.keyLastMap[client.keyBinds.escape] = true;
				}
				client.chat = getCharacter(client.chat);
				
			}
		}
	};
	this.tick = function (time) {
		var self = this;
		// create new sectors
		for (var x = self.x-32;x<self.x+32;x+=64) {
			var sectorX = absToRel(x).sectorX;
			var currentSector = sectorIndex(sectorX)
			if (currentSector === undefined) {
				world.sectors.push(new sector(sectorX));
				currentSector = sectorIndex(sectorX);
			}
		}
		// update player
		for (var stat in self.status) {
			if (['thirst','hunger','fatigue'].indexOf(stat) != -1) {
				if (self.status[stat] > 0) {
					self.status[stat] -= 0.007;
				} else {
					self.status[stat] = 0;
				}
			}
			
			if (self.status.health < 100 && self.status[stat] >= 50 && self.status.oxygen > 0) {
				self.status.health += time * 3;
				if (self.status.health > 100) {
					self.status.health = 100;
				}
			}
		}
		// oxygen
		var block = getProperties(world.sectors[sectorIndex(absToRel(self.x).sectorX)].layers[0][getIndex(absToRel(self.x).x,self.y-0.5)],['type','collision']);
		if (block.type == 'air' || (block.type != 'liquid' && block.collision != 'full')) {
			if (self.status['oxygen'] < 100) {
				self.status['oxygen'] += 0.5;
			}
		} else {
			if (self.status['oxygen'] > 0) {
				self.status['oxygen'] -= 0.5;
			} else {
				self.status.health -= 0.2;
			}
		}
		// health
		if (self.status.health < 0) {
			self.status.health = 0;
			client.menu = JSON.parse(JSON.stringify(assets.menu['dead']));
			client.inMenu = true;
			self.inStorageGUI = false;
			self.activeGUI = null;
			client.pause = true;
		} 
		// pause the game
		client.pause = self.inStorageGUI || client.inMenu || client.inChat? true: false;
	}
}
// create an update marker
function update(x,y,layer,type) {
	this.x = x;
	this.y = y;
	this.layer = layer;
	this.sectorIndex = sectorIndex(absToRel(x).sectorX);
	this.index = getIndex(absToRel(x).x,y);
	this.type = type;
}
// create a UI element
function UIelement(text,position,reference,x,y,sx,sy,width,height,data,onhover,active) {
	var params = ['text','position','reference','x','y','sx','sy','width','height','data','onhover','active'];
	for (var index in arguments) {
		if (arguments[index] != null && arguments[index] != undefined) {
			if (typeof arguments[index] == 'function') {
				this[params[index]] = arguments[index]();
			} else {
				this[params[index]] = arguments[index];
			}
		}
	}
}
UIelement.prototype.onclick = function () {
	var self = this;
	// save the game
	if (self.hasOwnProperty('text') && self.text.search('Save') != -1) {
		saveWorld(world.name)
	}
	// stop the single-player server on exit
	if (self.hasOwnProperty('text') && self.text.toLowerCase().search('exit') != -1) {
		clearTimeout(server.timeout);
	}
	switch (self.data.type) {
	case 'transfer':
		client.menu = JSON.parse(JSON.stringify(assets.menu[self.data.data]));	
		if (self.data.data == 'singleplayer') {
			// dynamically create game buttons
			var index = 0;
			for (var prop in JSON.parse(localStorage.games)) {
				client.menu.data.push(new UIelement(prop,'proportional','center',0.5,(index*0.125)+0.25,0,172,80,16,{type:'spSave',name:prop}));
				client.menu.data.push(new UIelement(null,'proportional','center',0.875,(index*0.125)+0.25,112,172,16,16,{type:'spDelete',name:prop}));
				index++;
			}
		} else if (self.data.data == 'controls') {
			// update control keybinds
			client.menu.data.forEach(function (element,index) {
				if (element.hasOwnProperty('data') && element.data.type == 'control') {
					client.menu.data[index].text = client.menu.data[index].text.split(': ')[0] + ': ' + getCharacter(client.keyBinds[element.data.data]);
				}
			})
		}
		// dynamically create scroll bar if necessary
		var maxY = 0;
		var height = 0;
		client.menu.data.forEach(function (element) {
			if (element.position != 'absolute') {
				if (element.position == 'relative' && element.y > maxY) {
					maxY = element.y;
					height = element.height;
				} else if (element.position == 'proportional' && element.y*canvas.height > maxY) {
					maxY = element.y*canvas.height;
					height = element.height;
				}
			}
		})
		if (maxY > canvas.height) {
			client.menu.data.push(new UIelement(null,'absolute','topLeft',canvas.width-(8*client.guiScale),0,504,0,8,128))
			client.menu.data.push(new UIelement(null,'absolute','center',canvas.width-(4*client.guiScale),10*client.guiScale,508,128,4,16,{type:'scrollbar',data:{position:0,height:(maxY-canvas.height+ height*client.guiScale)/canvas.height}},null,false))
		}
		client.gameIndex = undefined;
		client.playerIndex = undefined;
		break;
	case 'helpTab':
		world.players[client.playerIndex].helpTab = self.data.data;
		fillHelpPage(world.players[client.playerIndex].activeGUI);
		break;
	case 'help':
		world.players[client.playerIndex].activeGUI = JSON.parse(JSON.stringify(assets.storage['help']));
		fillHelpPage(world.players[client.playerIndex].activeGUI);
		break;
	case 'generate':
		world = new World(client.menu.data[5].text,((Number(client.menu.data[0].text.split(': ')[1])/10)*0.5));
		world.sectors.push(new sector(0));
		world.players.push(new player(128,world.sectors[0].surface[128]-2,0,0,0,assets.gravity,'test'));
		client.playerIndex = world.players.length -1;
		client.inMenu = false;
		client.menu = JSON.parse(JSON.stringify(assets.menu['game']));
		server.serverUpdate();
		break;
	case 'hammerArrow':
		var storage = world.players[client.playerIndex].activeGUI;
		storage.hammering.hammeringRecipe += self.data.data;
		if (storage.hammering.hammeringRecipe < 0) {
			storage.hammering.hammeringRecipe = assets.hammeringRecipes.length-1;
		} else if (storage.hammering.hammeringRecipe > assets.hammeringRecipes.length-1) {
			storage.hammering.hammeringRecipe = 0;
		}
		storage.elements[2].text = assets.hammeringRecipes[storage.hammering.hammeringRecipe].name;
		checkHammering(storage,false);
		break;
	case 'respawn':
		for(var stat in world.players[client.playerIndex].status) {
			world.players[client.playerIndex].status[stat] = 100;
		}
		client.inMenu = false; 
		client.pause = false;
		break;
	case 'resume':
		client.inMenu = false;
		client.pause = false;
		break;
	case 'roughnessArrow':
		var data = client.menu.data[0].text.split(': ');
		if (Number(data[1]) < 9 && self.data.data == 1) {
			data[1] = Number(data[1]) + 1;
		} else if (Number(data[1]) >0 && self.data.data == -1) {
			data[1] = Number(data[1]) - 1;
		}
		client.menu.data[0].text = data[0] + ': ' + data[1];
		break;
	case 'textBox':
		self.active = self.active? false: true;
		if (self.active) {
			self.text = '';
		}
		break;
	case 'scrollbar':
		self.active = true;
		break;
	case 'spSave':
		client.gameIndex = 0;
		world = loadWorld(JSON.parse(localStorage.games)[self.text]);
		client.playerIndex = 0;
		client.inChat = false;
		client.inMenu = false;
		client.pause = false;
		client.menu = JSON.parse(JSON.stringify(assets.menu['game']));
		server.serverUpdate();
		break;
	case 'spDelete':
		var parsedGames = JSON.parse(localStorage.games);
		delete parsedGames[self.data.name];
		localStorage.games = JSON.stringify(parsedGames);
		// refresh buttons
		client.menu = JSON.parse(JSON.stringify(assets.menu['singleplayer']));	
		var index = 0;
		for (var prop in JSON.parse(localStorage.games)) {
			client.menu.data.push(new UIelement(prop,'proportional','center',0.5,(index*0.125)+0.25,0,172,80,16,{type:'spSave',name:prop}));
			client.menu.data.push(new UIelement(null,'proportional','center',0.875,(index*0.125)+0.25,112,172,16,16,{type:'spDelete',name:prop}));
			index++;
		}
		break;
	case 'control':
		self.active = self.active? false: true;
		if (self.active) {
			self.text = self.text.split(': ')[0] + ': '
		}
		break;
	}
}

//========
// Utility
//========

function handleCollision(self,stepUp,bounciness) {
	var collisions = {x:0,y:0} 
	var margin = 0.0625;
	var entityComponent = assets.collision[self.collision][0];
	var box1 = {x:self.x+entityComponent.x-margin,y:self.y+entityComponent.y-margin,width:entityComponent.width+margin*2,height:entityComponent.height+margin*2};
	var boxes = [];
	// find all possible block collision boxes
	for (var iY = Math.round(self.y - 1.5); iY <= Math.round(self.y + 1.5) && iY >=0 && iY < 256; iY++ ){
		for (var iX = Math.round(self.x - 0.5); iX <= Math.round(self.x + 0.5); iX++ ){
			var block = getProperties(world.sectors[sectorIndex(absToRel(iX).sectorX)].layers[0][getIndex(absToRel(iX).x,iY)], ['collision','mirrored','rotation','type']);
			if (block == undefined || (self.type == 'block' && block.collision == 'none' && block.data != 0 && block.type != 'liquid')) {block = {collision:'full',mirrored:false,rotation:0}}
			if (block.collision != 'none') {
				assets.collision[block.collision].forEach(function (component) {
					var blockComponent = transform(component,block.mirrored,block.rotation);
					boxes.push({x:iX+blockComponent.x,y:iY+blockComponent.y,width:blockComponent.width,height:blockComponent.height});	
				})
			}
		}
	}
	// find all possible entity collision boxes
	world.entities.forEach(function (entity) {
		if (entity.type != 'item' && entity.x >= self.x-2 && entity.x <= self.x+2 && entity.y >= self.y-2 && entity.y <= self.y + 2 && !(entity.x == self.x && entity.y == self.y)) {
			boxes.push({x:entity.x+assets.collision[entity.collision][0].x,y:entity.y+assets.collision[entity.collision][0].y,width:assets.collision[entity.collision][0].width,height:assets.collision[entity.collision][0].height})
		}
	})
	// analyze all possible collisions
	boxes.forEach(function (box2) {
		var analysis = analyzeCollision(box1,box2);	
					if (analysis === false) {return true};
					if (Math.abs(analysis.interferance[analysis.detect]) > margin) {
						// displace the entity so it is not colliding any more
						self[analysis.detect] -= (Math.abs(analysis.interferance[analysis.detect])-margin) * sign(analysis.interferance[analysis.detect]);
						box1 = {x:self.x+entityComponent.x-margin,y:self.y+entityComponent.y-margin,width:entityComponent.width+margin*2,height:entityComponent.height+margin*2};
						// analyze horizontal collisions for possible Step-up
						if (stepUp && analysis.detect == 'x' && (box1.y+box1.height)-box2.y <= margin+ 0.4) {
							self.y -= analysis.interferance.y - margin;
						} else {
							if (self.hasOwnProperty('status') && Math.abs(self[analysis.detect + 'Vel']) >= 13) {
								self.status.health -= 2.7 * (Math.abs(self[analysis.detect + 'Vel'])-13);
								audio('falling');
							}
							if (typeof bounciness === 'number') {
								self[analysis.detect + 'Vel'] = Math.sqrt(bounciness * (self[analysis.detect + 'Vel']*self[analysis.detect + 'Vel'])) * sign(-self[analysis.detect + 'Vel']);
							} else {
								self[analysis.detect + 'Vel'] = 0;
							}
							collisions[analysis.detect] = sign(analysis.interferance[analysis.detect]);
							analysis.interferance[analysis.detect] = margin*sign(analysis.interferance[analysis.detect]);
						}
					} 
					if (Math.abs(analysis.interferance[analysis.detect]) == margin) {
						if (collisions[analysis.detect] == 0) {
							collisions[analysis.detect] = sign(analysis.interferance[analysis.detect]);	
						}
						if (collisions[analysis.detect] == sign(self[analysis.detect + 'Vel'])) {
							self[analysis.detect + 'Vel'] = 0;
						}
					}
	})
	return collisions;
}
function newFilledArray(len, val) {
	var ar = Array(len);
	while (--len >= 0) {
		ar[len] = val;
	};
	return ar;
}
// index value of block in sector
function getIndex(x, y,width) {
	return typeof width != 'number' ? Math.round(x) + (Math.round(y) * 256) : Math.round(x) + (Math.round(y) * width)
}
function getCoords(index,width) {
	var y = Math.floor(index / width);
	var x = index - (y * width);
	return {x:x,y:y};
}
// convert Relative sector coordinate to an absolute global coordinate
function relToAbs(secX, x) {
	return x + (secX * 256);
};
// convert Absolute global coordinate to a position coordinate within the sector
function absToRel(absX) {
	var sectorX = Math.floor(Math.round(absX)/256);
	return {
sectorX: sectorX,
x: absX - (sectorX * 256)
	};
};
// random number within a range
function randWithin(minimum,maximum,round) {
	return round ? Math.round(Math.random()*(maximum-minimum) + minimum) : Math.random()*(maximum-minimum) + minimum
}
function probability(percent) {
	return Math.random() <= percent/100 ? true : false
};
function getProperties(object, properties,type) {
	var returnObject = JSON.parse(JSON.stringify(object));
	var data = type === 'item' ? assets.itemData : assets.blockData
	var defaultData = type === 'item' ? assets.defaultItem : assets.defaultBlock
	properties.forEach(function (property) {
		if (object.hasOwnProperty(property)) {
			return true;
		} else if (data[object.data].hasOwnProperty(property)) {
			returnObject[property] = data[object.data][property];
			return true;
		} else if (defaultData.hasOwnProperty(property)) {
			returnObject[property] = defaultData[property];
			return true;
		}
	});
	return returnObject;
}
function isBetween(min,num,max) {
	if (num >= min && num <= max) {
		return true;
	} else {
		return false;
	}
}
function ellipse(x,y,width,height) {
	var a = width/2;
	var b = height/2;
	var indices = []
	var aSqrd = a*a;
	var bSqrd = b*b;
	for (var iY = Math.round(y - b); iY < y + b ; iY++) {
		if (iY >= 0&& iY < 256) {
			for (var iX = Math.round(x - a); iX < x + a ; iX++) {
				if (iX >= 0 && iX < 256 && ((((iX - x) * (iX - x)) / aSqrd) + (((iY - y) * (iY - y)) / bSqrd)) <= 1) {
					indices.push({x:iX,y:iY});
				};
			};
		}
	};
	return indices;
}
function analyzeCollision(box1,box2) {
	var interferance = {x:0,y:0};
	var box1Right = box1.x+box1.width;
	var box1Bottom = box1.y+box1.height;
	var box2Right = box2.x+box2.width
	var box2Bottom = box2.y+box2.height;
	if (box2.x < box1Right && box2Right > box1.x
			&& box2.y < box1Bottom && box2Bottom > box1.y) {
		if (box1.x + (box1.width / 2) >= box2.x + (box2.width / 2)) {
			// left collision
			interferance.x = box1.x - box2Right;
		} else if (box1.x + (box1.width / 2) < box2.x + (box2.width / 2)) {
			// right collision
			interferance.x = box1Right - box2.x;
		}
		if (box1.y + (box1.height / 2) < box2.y + (box2.height / 2)) {
			// bottom collision
			interferance.y = box1Bottom - box2.y;			
		} else if (box1.y + (box1.height / 2) >= box2.y + (box2.height / 2)) {
			// top collision
			interferance.y = box1.y - box2Bottom;
		}			
		if (Math.abs(interferance.x) > Math.abs(interferance.y)) {
			return {detect: 'y', interferance: interferance}
		} else if (Math.abs(interferance.x) < Math.abs(interferance.y)){
			return {detect: 'x', interferance: interferance}
		} else {
			return false;
		}
	} else {
		return false;
	}
}
function sign(x) {
	return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
}
function sectorIndex(sectorX) {
	var sectorIndex;
	var search = false;
	world.sectors.forEach(function (sector, index) {
		if (sectorX == sector.x) {
			sectorIndex = index;
			search = true;
			return true;
		}
	});
	if (search) {
		return sectorIndex;
	} else {
		return undefined;
	}
};
function renderSprite(item,xCoord,yCoord,width,height,darkness) {
	var sy = Math.floor(item.data.data / 32);
	var sx = item.data.data - (sy * 32);
	var data = item.type == 'block' ? getProperties(item.data,['collision','model','mirrored','rotation','color','active'],'block'):item.data;
	switch (item.type) {
	case 'item':
		ctx.drawImage(assets.itemSheet, sx * 32, sy * 32, 32, 32, xCoord-width/2, yCoord-height/2, width, height);
		break;
	case 'block':
		var model = typeof data.model == 'string'? assets.collision[data.model == 'collision'? data.collision:data.model]:data.model;
		model.forEach(function (element,index) {
			ctx.save();
			ctx.translate(xCoord,yCoord);
			if (data.mirrored) {
				ctx.scale(-1,1);
			}
			if (data.rotation != 0) {
				ctx.rotate(data.rotation*Math.PI)
			}
			// render each fragment (rectangle) of a block model
			ctx.drawImage(assets.blockSheet, sx * 8 + Math.round(8*(element.x+0.5)), sy * 8 + Math.round(8*(element.y+0.5)), Math.round(8*element.width), Math.round(8*element.height), width*element.x, height*element.y, element.width*width, element.height*height);
			// apply colour
			if (data.color != null) {
				ctx.fillStyle = 'rgba(' + assets.colors[data.color].r+',' +assets.colors[data.color].g+',' +assets.colors[data.color].b +',' +assets.colors[data.color].a + ')'
				ctx.fillRect(width*element.x, height*element.y, element.width*width, element.height*height);
			}
			// active blocks appear lighter
			if (data.active && data.data != 71 && data.data != 70 && (!data.hasOwnProperty('color') || data.color == null)) {
				ctx.fillStyle = 'rgba(255,128,128,0.5)';
				if (data.data == 56) {
					var bridge = getProperties(item.data,['network'])
				}
				if (data.data != 56 || (bridge.network.ports[1].active&&[0,1,2].indexOf(index) != -1) || (bridge.network.ports[0].active&&[3,4].indexOf(index) != -1)) {
					ctx.fillRect(width*element.x, height*element.y, element.width*width, element.height*height);
				}
			}
			if (darkness != undefined) {
				ctx.fillStyle = 'rgba(0,0,0,'+darkness+')';
				ctx.fillRect(width*element.x, height*element.y, element.width*width, element.height*height);
			}
			ctx.restore();
		})
		break;
	}
}
// text in Sandbox 1 font
function text(string, x, y, size) {
	if (x <0) {x=0}
	var charWidth = (size / 2)*(7 / 6);
	var charHeight = size*(13/12);
	var width = Math.floor((canvas.width-x)/charWidth);
	for (var index = 0; index < string.length; index++) {
		var element = assets.fontIndex.indexOf(string.toLowerCase().charAt(index));
		if (element == -1) { element = 45 };
		var sy = Math.floor(element / 85);
		var sx = element - (sy * 85);
		ctx.drawImage(assets.font, sx * 6, sy * 12, 6, 12, x+(charWidth*getCoords(index,width).x), y+(charHeight*getCoords(index,width).y), size / 2, size);
	};
};	
function itemUI(storage) {
	var player = world.players[client.playerIndex];
	var x = client.slotX();
	var y = client.slotY();
	if (storage.type == 'inventory') {
		ctx.drawImage(assets.gui,storage.sx,storage.sy,storage.width,storage.height,client.half_cWidth-client.guiScale*(storage.width/2),client.half_cHeight,client.guiScale*storage.width,client.guiScale*storage.height)
	} else {
		ctx.drawImage(assets.gui,storage.sx,storage.sy,storage.width,storage.height,client.half_cWidth-client.guiScale*(storage.width/2),client.half_cHeight - client.guiScale*storage.height,client.guiScale*storage.width,client.guiScale*storage.height);
		// furnace fire
		if (storage.type == 'furnace' && storage.smelting.recipe != null) {
			ctx.drawImage(assets.gui,144,0,32,19,client.half_cWidth-client.guiScale*(storage.width/2-8),client.half_cHeight - client.guiScale*(storage.height-24),client.guiScale*32,client.guiScale*19);
			var width = Math.round(storage.smelting.progress*19);
			ctx.drawImage(assets.gui,176,5,width,14,client.half_cWidth-client.guiScale*(storage.width/2-40),client.half_cHeight - client.guiScale*(storage.height-29),client.guiScale*width,client.guiScale*14)
		}
	}
	for (var property in storage) {
		if (['type','tier','sx','sy','width','height','smelting','hammering','elements','readOnly','dragMap'].indexOf(property) == -1) {
			var element = storage[property];
			// render items
			element.slots.forEach(function (item, index) {	
				if (item != null) {
					var itemY = Math.floor(index / element.width);
					var itemX = index - (itemY * element.width);
					var xCoord = Math.round(((itemX + element.x + 1)* (client.guiScale*8)) + (canvas.width-canvas.height)/2);
					var yCoord = Math.round(((itemY + element.y + 1)* (client.guiScale*8)));
					renderSprite(item,xCoord,yCoord,client.guiScale*5,client.guiScale*5);
					if (item.type == 'item' && getProperties(item.data,['type'],item.type).type != 'item') {
						var tool = getProperties(item.data,['durability'],item.type);
						if (tool.durability > 0 ) {
							var width = Math.round(32*tool.durability);
							ctx.drawImage(assets.gui,0,275,width,32,xCoord-client.guiScale*2.5,yCoord-client.guiScale*2.5,(client.guiScale*5)*(width/32),(client.guiScale*5));
						} else {
							ctx.drawImage(assets.gui,32,275,32,32,xCoord-client.guiScale*2.5,yCoord-client.guiScale*2.5,client.guiScale*5,client.guiScale*5);
						}
					}
					// count
					if (item.count > 1) {
						text(item.count.toString(),xCoord-client.guiScale*3,yCoord,client.guiScale*3);
					}
				}
			})
			if (player.inStorageGUI && x>=element.x&&x<element.x+element.width&&y>=element.y&&y<element.y+element.height) {
				// slot highlight
				ctx.drawImage(assets.gui, 0,0,8,8,Math.round((((client.slotX()+1)* (client.guiScale*8)) + (canvas.width-canvas.height)/2))-client.guiScale*4,Math.round(((client.slotY()+1) * (client.guiScale*8)))-client.guiScale*4,client.guiScale*8,client.guiScale*8);
				var slotIndex = (x-element.x) + ((y-element.y)*element.width)
				var slot = element.slots[slotIndex];
				// item name
				if (slot != null && player.dragItem == null) {
					text(getProperties(slot.data,['name'],slot.type).name,client.canvasX,client.canvasY-client.guiScale*4,client.guiScale*4);
				}
				// drag and drop
				if ((client.mouseMap[client.mouseBinds.mine] || client.mouseMap[client.mouseBinds.place]) && (storage.readOnly == undefined)) {
					if (slot != null) {
						var stack = getProperties(slot.data,['stack'],slot.type).stack;
					}
					if (['output','slag'].indexOf(property) == -1) {
						switch (storage.type) {
						case 'hotbar': 
							storage[property].slots[slotIndex] = JSON.parse(JSON.stringify(player.dragItem));
							if (storage[property].slots[slotIndex] != null) {
								storage[property].slots[slotIndex].count = 1;
							}
							break;
						case 'help':
							if (slot != null && client.mouseMap[client.mouseBinds.mine]) {
								var player = player;
								var storageType;
								switch (player.helpTab) {
								case 'craftingRecipes': storageType = 'crafting'; break;
								case 'smeltingRecipes': storageType = 'furnace'; break;
								}
								player.activeGUI = JSON.parse(JSON.stringify(assets.storage[storageType]));
								player.activeGUI.readOnly = true;
								var recipe = assets[player.helpTab][slotIndex];
								for (var prop in recipe) {
									if (['tool','cast','input','output','slag'].indexOf(prop) != -1) {
										if (prop == 'input') {
											if (storageType == 'crafting' && recipe.type == 'shaped') {
												recipe[prop].forEach(function (recipeSlot,slotIndex) {
													var slotY = Math.floor(slotIndex / recipe.width);
													var slotX = slotIndex - (slotY * recipe.width);
													player.activeGUI[prop].slots[getIndex(slotX,slotY,player.activeGUI[prop].width)] = recipeSlot;
												})
											} else {
												recipe[prop].forEach(function (recipeSlot,slotIndex) {
													player.activeGUI[prop].slots[slotIndex] = recipeSlot;
												})
											}
										} else {
											var slotObject = recipe[prop];
											if (prop == 'tool' || prop == 'cast') {
												// search for lowest tier of the tool type
												assets.itemData.some(function (tool) {
													if (tool.hasOwnProperty('type') && tool.type == slotObject) {
														slotObject = new item('item',{data:tool.data,durability:1},1);
														return true;
													}
												})
											}
											player.activeGUI[prop].slots[0] = slotObject;
										}
									}
								}
								if (storageType == 'furnace') {
									player.activeGUI.fuel.slots[0] = new item('item',{data:44},2);
									checkSmelting(player.activeGUI);
								}
								client.mouseLastMap[client.mouseBinds.mine] = true;
							}
							break;
						default: 
							if (!client.mouseLastMap[client.mouseBinds.mine] && client.mouseMap[client.mouseBinds.mine]) {
								if (player.dragItem != null && slot != null && compareTDC(player.dragItem,slot) && slot.count<stack) {
									storage[property].slots[slotIndex].count += player.dragItem.count
									if (storage[property].slots[slotIndex].count > stack) {
										player.dragItem.count = storage[property].slots[slotIndex].count - stack;
										storage[property].slots[slotIndex].count = stack;
									} else {
										player.dragItem = null;
									}
								} else {
									var tempItem = player.dragItem;
									player.dragItem = slot;
									storage[property].slots[slotIndex] = tempItem;
								}
								client.mouseLastMap[client.mouseBinds.mine] = true;
							} else if (!client.mouseLastMap[client.mouseBinds.place] && client.mouseMap[client.mouseBinds.place]) {
								if (player.dragItem == null && slot != null) {
									player.dragItem = JSON.parse(JSON.stringify(slot));
									player.dragItem.count = Math.ceil(slot.count/2);
									storage[property].slots[slotIndex].count = Math.floor(slot.count/2);
									if (storage[property].slots[slotIndex].count <= 0) {
										storage[property].slots[slotIndex] = null;
									}
									client.mouseLastMap[client.mouseBinds.place] = true;
								} else if (player.dragItem != null && (!storage[property].hasOwnProperty('dragMap') || storage[property].dragMap.indexOf(slotIndex) == -1)) {
									if (slot == null) {
										storage[property].slots[slotIndex] = JSON.parse(JSON.stringify(player.dragItem));
										storage[property].slots[slotIndex].count = 1;
										player.dragItem.count--;
									} else if (compareTDC(player.dragItem,slot)&&slot.count<stack) {
										storage[property].slots[slotIndex].count++
										player.dragItem.count--;
									}
									if (!storage[property].hasOwnProperty('dragMap')) {
										storage[property].dragMap = [];
									}
									storage[property].dragMap.push(slotIndex);
									if (player.dragItem.count <= 0) {
										player.dragItem = null;
										client.mouseLastMap[client.mouseBinds.place] = true;
									}
								}
							}
							break;
						}
					} else if ((!client.mouseLastMap[client.mouseBinds.mine] || client.keyMap[client.keyBinds.shift]) && client.mouseMap[client.mouseBinds.mine]){
						if (player.dragItem == null) {
							player.dragItem = slot;
							storage[property].slots[slotIndex] = null;
						} else if (slot != null && compareTDC(player.dragItem,slot) && stack-player.dragItem.count>=slot.count) {
							player.dragItem.count += storage[property].slots[slotIndex].count
							if (player.dragItem.count > stack) {
								storage[property].slots[slotIndex].count = player.dragItem.count - stack;
								player.dragItem.count = stack;
							} else {
								storage[property].slots[slotIndex] = null;
							}
						}
						if (storage[property].slots[slotIndex] == null) {
							if (storage.type == 'crafting') {
								checkCrafting(storage,(!client.mouseLastMap[client.mouseBinds.mine] || client.keyMap[client.keyBinds.shift]) && property == 'output' && client.mouseMap[client.mouseBinds.mine] ? true : false);
							} else if (storage.type == 'hammering') {
								checkHammering(storage,(!client.mouseLastMap[client.mouseBinds.mine] || client.keyMap[client.keyBinds.shift]) && property == 'output' && client.mouseMap[client.mouseBinds.mine] ? true : false);
							}
						}
						client.mouseLastMap[client.mouseBinds.mine] = true;
					}
					if (storage.type == 'crafting') {
						checkCrafting(storage);
					} else if (storage.type == 'furnace') {
						checkSmelting(storage);
					} else if (storage.type == 'hammering') {
						checkHammering(storage);
					}
				} else if (storage[property].hasOwnProperty('dragMap') && !client.mouseMap[client.mouseBinds.place]) {
					delete storage[property].dragMap;
				}
			}
		}
	}
	if (storage.hasOwnProperty('elements')) {
		UIelements(storage.elements);
	}
}
function compareObjects(object1,object2) {
	var aProps = Object.getOwnPropertyNames(object1);
	var bProps = Object.getOwnPropertyNames(object2);
	if (aProps.length != bProps.length) {
		return false;
	}
	for (var i = 0; i < aProps.length; i++) {
		var propName = aProps[i];
		if (object1[propName] !== object2[propName]) {
			if (typeof object1[propName] == 'object' && typeof object2[propName] == 'object') {
				//if (!compareObjects(object1[propName],object2[propName])) {
				//return false;
				//}
			} else {
				return false;
			}
		}
	}
	return true;
}
// compare Type, Data, and Count for two items
function compareTDC (item1,item2) {
	return (item1 == null && item2 == null) || (item1 != null && item2 != null && (item1.type == item2.type && compareObjects(item1.data,item2.data) && JSON.stringify(item1.data.storage) === JSON.stringify(item2.data.storage))) ? true : false;
}
function transform (rectangle,mirrored,rotation) {
	var rectPrime = {x:rectangle.x,y:rectangle.y,width:rectangle.width,height:rectangle.height};
	var rectPrimeM = {x:rectangle.x,y:rectangle.y,width:rectangle.width,height:rectangle.height};
	var direction = 1;
	if (mirrored) {
		rectPrimeM.x *= -1;
		rectPrimeM.x -= rectangle.width;
		rectPrime = JSON.parse(JSON.stringify(rectPrimeM));
		direction = -1;
	}
	if (rotation != 0) {
		rectPrime.x = rectPrimeM.x*Math.cos(rotation*Math.PI*direction)-rectPrimeM.y*Math.sin(rotation*Math.PI*direction);
		rectPrime.y = rectPrimeM.x*Math.sin(rotation*Math.PI*direction)+rectPrimeM.y*Math.cos(rotation*Math.PI*direction);
		switch (rotation*direction) {
		case 0.5:
			rectPrime.x -= rectangle.height;
			rectPrime.width = rectangle.height;
			rectPrime.height = rectangle.width;
			break;
		case 1:
			rectPrime.x -= rectangle.width;
			rectPrime.y -= rectangle.height;
			break;
		case 1.5:
			rectPrime.y -= rectangle.width;
			rectPrime.width = rectangle.height;
			rectPrime.height = rectangle.width;
			break;
		case -0.5:
			rectPrime.y -= rectangle.width;
			rectPrime.width = rectangle.height;
			rectPrime.height = rectangle.width;
			break;
		case -1:
			rectPrime.x -= rectangle.width;
			rectPrime.y -= rectangle.height;
			break;
		case -1.5:
			rectPrime.x -= rectangle.height;
			rectPrime.width = rectangle.height;
			rectPrime.height = rectangle.width;
			break;
		}
	}
	return rectPrime;
}
function updateName (object) {
	var block = getProperties(object,['model','collision','name','mirrored']);
	if (block.model != 'full' && block.model != 'collision') {
		block.name += ' ' + block.model;
	} else if (block.model == 'collision' && (block.collision != 'full' && block.collision != 'none')) {
		block.name += ' ' + block.collision;
	}
	if (block.mirrored) {
		block.name = 'Mirrored '+ block.name;
	}
	return block.name;
}
function checkCrafting (table,craft) {
	// find the smallest rectangle that everything fits in (logically the same size as the recipe)
	var rectangle = {left:table.input.width-1,right:0,top:table.input.height-1,bottom:0};
	table.input.slots.forEach(function (slot,index) {
		var sy = Math.floor(index/table.input.width);
		var sx = index-(sy*table.input.width);
		if (slot != null) {
			if (sx < rectangle.left) {
				rectangle.left = sx;
			} else if (sx > rectangle.right) {
				rectangle.right = sx;
			}
			if (sy < rectangle.top) {
				rectangle.top = sy;
			} else if (sy > rectangle.bottom) {
				rectangle.bottom = sy;
			}
		}
	})
	// start the search for a matching shaped recipe
	var validRecipe = undefined;
	assets.craftingRecipes.some(function (recipe) {
		if (recipe.type == 'shaped' && ((recipe.tool == null && table.tool.slots[0] == null) || (recipe.tool != null && table.tool.slots[0] != null && recipe.tool == getProperties(table.tool.slots[0].data,['type'],table.tool.slots[0].type).type&& table.tool.slots[0].data.durability > 0))&& recipe.width == rectangle.right-rectangle.left+1 && recipe.height == rectangle.bottom-rectangle.top+1) {
			// check input slots against every recipe
			recipe.input.some(function (slot, index) {
				var sy = Math.floor(index/recipe.width);
				var sx = index-(sy*recipe.width);
				var inputIndex = getIndex(rectangle.left+sx,rectangle.top+sy,table.input.width);
				if ((slot == null && table.input.slots[inputIndex] == null) || (slot != null && table.input.slots[inputIndex] != null && slot.count <= table.input.slots[inputIndex].count && compareTDC(slot,table.input.slots[inputIndex]))) {
					if (index == recipe.input.length-1) {
						// valid recipe
						validRecipe = JSON.parse(JSON.stringify(recipe));
						return true;
					}
				} else {
					return true;
				}
			})
		}
		if (validRecipe != undefined) {
			return true;
		}
	})
	// start search for a matching shapeless recipe
	if (validRecipe == undefined) {
		assets.craftingRecipes.some(function (recipe) {
			if (recipe.type == 'shapeless' && ((recipe.tool == null && table.tool.slots[0] == null) || (recipe.tool != null && table.tool.slots[0] != null && recipe.tool == getProperties(table.tool.slots[0].data,['type'],table.tool.slots[0].type).type && table.tool.slots[0].data.durability > 0))) {
				var stackCount = 0;
				table.input.slots.forEach(function (input) {
					if (input != null) {
						stackCount++;
					}
				})
				recipe.input.some(function (slot,index) {
					var slotSearch = false;
					table.input.slots.forEach(function (input) {
						if (input != null && slot.count <= input.count && compareTDC(slot,input)) {
							slotSearch = true;
						}
					})
					if (!slotSearch) {
						return true;
					} else if (index == recipe.input.length-1 && stackCount == recipe.input.length) {
						// valid recipe
						validRecipe = JSON.parse(JSON.stringify(recipe));
						return true;
					}
				})
			}
			if (validRecipe != undefined) {
				return true;
			}
		})
	}
	// start search for a matching property recipe
	var output;
	if (validRecipe == undefined) {
		assets.craftingRecipes.some(function (recipe) {
			if (recipe.type == 'property' && ((recipe.tool == null && table.tool.slots[0] == null) || (recipe.tool != null && table.tool.slots[0] != null && recipe.tool == getProperties(table.tool.slots[0].data,['type'],table.tool.slots[0].type).type && table.tool.slots[0].data.durability > 0))) {
				var valid = true;
				var count = 0;
				table.input.slots.some(function (input,index) {
					if (input != null) {
						if (input.type == recipe.input && (output== undefined||compareTDC(input,output))) {
							count++;
							if (output == undefined) {
								output = JSON.parse(JSON.stringify(input));
							}
						} else {
							valid = false;
							return true;
						}
					}
				})
				if (count >0 && valid) {
					validRecipe = JSON.parse(JSON.stringify(recipe));
					return true;
				}
			}
			if (validRecipe != undefined) {
				return true;
			}
		})
	}
	if (validRecipe != undefined) {
		if (validRecipe.type == 'property') {
			switch (validRecipe.output) {
				case 'color':
				// Paint Brush
				if (!output.data.hasOwnProperty('color') || output.data.color == null) {
					output.data.color = 0;
				} else if (output.data.color == 15) {
					delete output.data.color
				} else {
					output.data.color++;
				}
				break;
			}
			table.output.slots[0] = output
		} else {
			table.output.slots[0] = validRecipe.output;
		}
		// craft recipe
		if (craft) {
			switch (validRecipe.type) {
			case 'shaped': 
				validRecipe.input.forEach(function (input,index) {
					if (input != null) {
						var sy = Math.floor(index/validRecipe.width);
						var sx = index-(sy*validRecipe.width);
						var tableIndex = getIndex(rectangle.left+sx,rectangle.top+sy,table.input.width);
						table.input.slots[tableIndex].count -= input.count;
						if (table.input.slots[tableIndex].count == 0) {
							table.input.slots[tableIndex] = null;
						}
					}
				});
				break;
			case 'shapeless':
				table.input.slots.forEach(function (tableInput,tableIndex) {
					if (tableInput != null) {
						validRecipe.input.some(function (input) {
							if (compareTDC(tableInput,input)) {
								table.input.slots[tableIndex].count -= input.count;
								if (table.input.slots[tableIndex].count == 0) {
									table.input.slots[tableIndex] = null;
								}
							}
						})
					}
				});
				break;
			case 'property':
				table.input.slots.some(function (tableInput,tableIndex) {
					if (tableInput != null) {
						table.input.slots[tableIndex].count -= output.count;
						if (table.input.slots[tableIndex].count == 0) {
							table.input.slots[tableIndex] = null;
						}
						return true;
					}
				})
			}
			if (validRecipe.tool != null) {
				table.tool.slots[0].data.durability -= (1/512)/getProperties(table.tool.slots[0].data,['tier'],table.tool.slots[0].type).tier;
				if (table.tool.slots[0].data.durability <= 0) {
					table.tool.slots[0].data.durability = 0;
				}
			}
			checkCrafting(table);
		}
	} else {
		table.output.slots[0] = null;
	}
	
}
function checkSmelting (furnace) {
	// search for valid recipe
	var validRecipe;
	assets.smeltingRecipes.some(function (recipe) {
		if ((recipe.cast == null && furnace.cast.slots[0] == null) || (recipe.cast != null && furnace.cast.slots[0] != null && recipe.cast == getProperties(furnace.cast.slots[0].data,['type'],furnace.cast.slots[0].type).type&& furnace.cast.slots[0].data.durability > 0)) {
			var inclusiveSearch = false;
			furnace.input.slots.some(function (input,index) {
				var search = false;
				if (input != null) {
					recipe.input.some(function (recipeInput) {
						if (compareTDC(input,recipeInput) && input.count >= recipeInput.count) {
							search = true;
							return true;
						}
					})
					if (!search) {
						return true;
					}
				}
				if (index == furnace.input.slots.length-1) {
					inclusiveSearch = true;
				}
			})
			if (inclusiveSearch) {
				recipe.input.some(function (recipeInput, index) {
					var search = false;
					furnace.input.slots.some(function (input) {
						if (input != null && compareTDC(input,recipeInput) && input.count >= recipeInput.count) {
							search = true;
						}
					})
					if (!search) {
						return true;
					}
					if (index == recipe.input.length-1) {
						validRecipe = recipe;
					}
				})
			}
			if (validRecipe != undefined) {
				return true;
			}
		}
	})
	// update recipe
	if (furnace.fuel.slots[0] != null && getProperties(furnace.fuel.slots[0].data,['fuel'],furnace.fuel.slots[0].type).fuel != 0 && validRecipe != undefined 
			&& (furnace.output.slots[0] == null || (compareTDC(validRecipe.output,furnace.output.slots[0]) && getProperties(validRecipe.output.data,['stack'],validRecipe.output.type).stack-furnace.output.slots[0].count >= validRecipe.output.count)) 
			&& (furnace.slag.slots[0] == null || (compareTDC(validRecipe.slag,furnace.slag.slots[0]) && getProperties(validRecipe.slag.data,['stack'],validRecipe.slag.type).stack-furnace.slag.slots[0].count >= validRecipe.slag.count))) {
		furnace.smelting.recipe = JSON.parse(JSON.stringify(validRecipe));
	} else {
		furnace.smelting.recipe = null;
		furnace.smelting.fuel = 0;
	}
}
function checkHammering (storage,hammer) {
	// make sure there is a hammer
	if (storage.tool.slots[0] != null && storage.tool.slots[0].data.durability > 0 && storage.input.slots[0] != null && getProperties(storage.tool.slots[0].data,['type'],storage.tool.slots[0].type).type == 'hammer' && storage.input.slots[0].type == 'block') {
		// make sure the block meets hammering criteria
		var block = getProperties(storage.input.slots[0].data,['collision','model','transparent']);
		if (!block.transparent && (block.collision == 'full' || block.model == 'full') && !storage.input.slots[0].data.hasOwnProperty('storage')) {
			// fill the output
			storage.output.slots[0] = new item('block',{data:storage.input.slots[0].data.data,collision:assets.hammeringRecipes[storage.hammering.hammeringRecipe].collision},assets.hammeringRecipes[storage.hammering.hammeringRecipe].count);
			// craft the block
			if (hammer) {
				// deplete input
				storage.input.slots[0].count--;
				if (storage.input.slots[0].count == 0) {
					storage.input.slots[0] = null;
				}
				// deplete hammer
				storage.tool.slots[0].data.durability -= (1/512)/getProperties(storage.tool.slots[0].data,['tier'],storage.tool.slots[0].type).tier;
				if (storage.tool.slots[0].data.durability <= 0) {
					storage.tool.slots[0].data.durability = 0;
				}
				checkHammering(storage);
			}
		} else {
			storage.output.slots[0] = null;
		}
	} else {
		storage.output.slots[0] = null;
	}
}
function fillHelpPage (storage) {
	var player = world.players[client.playerIndex];
	storage.body.slots.forEach(function (helpSlot,helpIndex, slots) {
		if (helpIndex < assets[player.helpTab].length && assets[player.helpTab][helpIndex].type != 'property') {
			slots[helpIndex] = JSON.parse(JSON.stringify(assets[player.helpTab][helpIndex].output));
		} else {
			slots[helpIndex] = null;
		}
	})
}
function UIelements(array) {
	array.forEach(function (element) {
		// calculate the drawImage coordinates
		var elementX = 0;
		var elementY = 0;
		if (element.hasOwnProperty('position') && element.position == 'relative') {
			elementX = element.x * client.guiScale + (canvas.width-canvas.height)/2;
			elementY = element.y * client.guiScale;
		} else if (element.hasOwnProperty('position') && element.position == 'proportional') {
			elementX = element.x * canvas.height + (canvas.width-canvas.height)/2;
			elementY = element.y * canvas.height;
		} else if (element.hasOwnProperty('position') && element.position == 'absolute') {
			elementY = element.y
			elementX = element.x
		}
		if (element.hasOwnProperty('reference') && element.reference == 'center') {
			elementX -= element.width/2*client.guiScale;
			elementY -= element.height/2*client.guiScale;
		} else if (element.hasOwnProperty('reference') && element.reference == 'bottomLeft') {
			elementY -= element.height*client.guiScale;
		}
		// if there is a scroll bar
		if (array[array.length-1].hasOwnProperty('data') && array[array.length-1].data.type == 'scrollbar' && element.position != 'absolute') {
			elementY -= array[array.length-1].data.data.position*canvas.height
		}
		// render the element
		if (element.hasOwnProperty('sx') && element.hasOwnProperty('sy')) {
			ctx.drawImage(assets.gui,element.sx,element.sy,element.width,element.height,elementX,elementY,element.width*client.guiScale,element.height*client.guiScale);
		}
		// text
		if (element.hasOwnProperty('text')) {
			text(element.text,(elementX+element.width/2*client.guiScale)-((((client.guiScale*element.height/2) / 2) * (element.text.length/2)) * (7 / 6)),(elementY+element.height/2*client.guiScale)-(client.guiScale*element.height/2)/2,client.guiScale*element.height/2);
		}
		// onHover
		if (element.hasOwnProperty('data') && client.canvasX >= elementX && client.canvasX <= elementX + client.guiScale*element.width && client.canvasY >= elementY && client.canvasY <= elementY + client.guiScale * element.height) {
			if (element.hasOwnProperty('onhover')) {
				ctx.drawImage(assets.gui,element.onhover.sx,element.onhover.sy,element.width,element.height,elementX,elementY,element.width*client.guiScale,element.height*client.guiScale);
			} else if (!element.active) {
				ctx.fillStyle = 'rgba(0,0,0,0.5)';
				ctx.fillRect(elementX,elementY,element.width*client.guiScale,element.height*client.guiScale);
			}
			// onclick 
			if (!client.mouseLastMap[client.mouseBinds.mine] && client.mouseMap[client.mouseBinds.mine]) {
				UIelement.prototype.onclick.call(element);
				client.mouseLastMap[client.mouseBinds.mine] = true;
			}
		}
		// active
		if (element.hasOwnProperty('active') && element.active) {
			ctx.fillStyle = 'rgba(0,0,0,0.5)';
			ctx.fillRect(elementX,elementY,element.width*client.guiScale,element.height*client.guiScale);
			if (element.data.type == 'textBox') {
				element.text = getCharacter(element.text);
			} else if (element.data.type == 'scrollbar') {
				if (!client.mouseMap[client.mouseBinds.mine]) {element.active = false;}
				if (client.canvasY <= (element.height/2+2)*client.guiScale) {
					element.y = (element.height/2+2)*client.guiScale
				} else if (client.canvasY >= canvas.height-(element.height/2+2)*client.guiScale) {
					element.y = canvas.height-(element.height/2+2)*client.guiScale
				} else {
					element.y = client.canvasY;
				}
				element.data.data.position = ((element.y-(element.height/2+2)*client.guiScale)/(canvas.height-(element.height/2+2)*client.guiScale*2))*element.data.data.height;
			} else if (element.data.type == 'control') {
				if (client.keyEvent != undefined) {
					element.text = element.text.split(': ')[0] + ': ' + getCharacter(client.keyEvent.keyCode,true);
					client.keyBinds[element.data.data] = client.keyEvent.keyCode;
					client.keyEvent = undefined;
					element.active = false;
					localStorage.client = JSON.stringify(client);
				}
			}
		}
	})
}
function getCharacter(string,reset) {
	var keyCode = (typeof string === 'string' && client.keyEvent != undefined)?client.keyEvent.keyCode:string
	if (keyCode != undefined && typeof keyCode != 'string') {
		var newChar = '';
		if ([13,16,17,18,19,20,27,91].indexOf(keyCode) == -1 || typeof string === 'number') {
			switch (keyCode) {
			case 8: string = string  = string.slice(0,string.length-1); break;
			case 9: newChar = typeof string ==='string'?client.keyMap[client.keyBinds.shift]? '':'    ':'tab'; break;
			case 16: newChar = 'shift'; break;
			case 32: newChar = typeof string ==='string'?' ':'space'; break;
			case 38: string = client.lastChat; break;
			case 39: break;//right arrow
			case 40: break;//down arrow;
			case 45: break;//insert
			case 46: string = string  = string.slice(0,string.length-1); break;
			case 48: newChar = client.keyMap[client.keyBinds.shift]? ')':'0'; break;
			case 49: newChar = client.keyMap[client.keyBinds.shift]? '!':'1'; break;
			case 50: newChar = client.keyMap[client.keyBinds.shift]? '@':'2'; break;
			case 51: newChar = client.keyMap[client.keyBinds.shift]? '#':'3'; break;
			case 52: newChar = client.keyMap[client.keyBinds.shift]? '$':'4'; break;
			case 53: newChar = client.keyMap[client.keyBinds.shift]? '%':'5'; break;
			case 54: newChar = client.keyMap[client.keyBinds.shift]? '^':'6'; break;
			case 55: newChar = client.keyMap[client.keyBinds.shift]? '&':'7'; break;
			case 56: newChar = client.keyMap[client.keyBinds.shift]? '*':'8'; break;
			case 57: newChar = client.keyMap[client.keyBinds.shift]? '(':'9'; break;
			case 186: newChar = client.keyMap[client.keyBinds.shift]? ':':';'; break;
			case 187: newChar = client.keyMap[client.keyBinds.shift]? '+':'='; break;
			case 188: newChar = client.keyMap[client.keyBinds.shift]? '<':','; break;
			case 189: newChar = client.keyMap[client.keyBinds.shift]? '_':'-'; break;
			case 190: newChar = client.keyMap[client.keyBinds.shift]? '>':'.'; break;
			case 191: newChar = client.keyMap[client.keyBinds.shift]? '?':'/'; break;
			case 192: newChar = client.keyMap[client.keyBinds.shift]? '~':'`'; break;
			case 219: newChar = client.keyMap[client.keyBinds.shift]? '{':'['; break;
			case 220: newChar = client.keyMap[client.keyBinds.shift]? '|':'\\'; break;
			case 221: newChar = client.keyMap[client.keyBinds.shift]? '}':']'; break;
			case 222: newChar = client.keyMap[client.keyBinds.shift]? '"':"'"; break;
			default: newChar = String.fromCharCode(keyCode); break;
			}
			if (typeof string === 'string') {
				string += newChar;
			} else {
				string = newChar;
			}
		}
		if (!reset) {client.keyEvent = undefined};
	}
	return string;
}
function loadWorld(parsedGame) {
	// decompression
	parsedGame.sectors.forEach(function (sect) {
		sect.layers.forEach(function (layer,layerIndex) {
			var uncompressed = [];
			layer.forEach(function (block,index) {
				if (Array.isArray(block)) {
					for (var count = 0; count < block[1];count++) {
						uncompressed.push({data:block[0]});
					}
				} else if (typeof block == 'object') {
					uncompressed.push(block);
				}
			})
			sect.layers[layerIndex] = uncompressed;
		})
	})
	var gameObject = new World(parsedGame.name,parsedGame.roughness);
	gameObject.sectors = parsedGame.sectors;
	parsedGame.players.forEach(function (plr) {
		gameObject.players.push(new player(plr));
	});
	parsedGame.entities.forEach(function (ent) {
		gameObject.entities.push(new entity(ent));
	})
	gameObject.updates = parsedGame.updates;
	gameObject.time = parsedGame.time
	return gameObject;
}
function saveWorld(name) {
	localStorage.client = JSON.stringify(client);
	var tempGames = JSON.parse(localStorage.games);
	// compression
	var compression = JSON.parse(JSON.stringify(world))
	compression.sectors.forEach(function (sect) {
		sect.layers.forEach(function (layer,layerIndex) {
			var count = 1;
			var compressed = [];
			layer.forEach(function (block,index) {
				if (Object.keys(block).length == 1) {
					layer[index] = block.data;
				}
				if (index != 0) {
					if (index != layer.length-1 && layer[index] == layer[index-1]) {
						count++;
					} else {
						if (index == layer.length-1) {
							count++;
						}
						if (typeof layer[index-1] == 'number'){
							compressed.push([layer[index-1],count]);
						} else {
							compressed.push(JSON.parse(JSON.stringify(layer[index-1])));
						}
						count = 1;
					}
				}
			})
			sect.layers[layerIndex] = compressed;
		})
	})
	tempGames[world.name] = compression
	localStorage.games = JSON.stringify(tempGames);
}
function breakBlock(x,y,layer,validTool) {	
	var block = world.sectors[sectorIndex(absToRel(x).sectorX,y)].layers[layer][getIndex(absToRel(x).x,y)];
	var blockProps = getProperties(block,['tier','drop'])
	// block drop
	if (validTool !== undefined && (blockProps.tier == 0 || validTool)) {
		blockProps.drop.forEach(function (drop) {
			var dropObject = new item(drop.type,{data:block.data},0);
			switch (typeof drop.data) {
			case 'string': 
				if (drop.data == 'self') {
					dropObject.data = JSON.parse(JSON.stringify(block));
				} else if (drop.data == 'data') {
					dropObject.data = JSON.parse(JSON.stringify(block));
					delete dropObject.data.rotation;
					delete dropObject.data.mirrored;
					delete dropObject.data.model;
					delete dropObject.data.collision;
					delete dropObject.data.color;
					delete dropObject.data.active;
					if (block.hasOwnProperty('network')) {
						dropObject.data.network = JSON.parse(JSON.stringify(assets.blockData[block.data].network))
					}
				}
				break;
			case 'object':
				dropObject.type = drop.type;
				dropObject.data = drop.data;
				break;
			}
			if (!drop.hasOwnProperty('probability') || probability(drop.probability)) {
				dropObject.count = randWithin(drop.min,drop.max,true);
				if (dropObject.count >0) {
					world.entities.push(new entity(Math.round(x)+randWithin(-0.25,0.25),Math.round(y)+randWithin(-0.25,0.25),0,-3,0,assets.gravity,'item',dropObject,'drop'));	
				}
			}	
		})
	}
	// remove update
	world.updates.some(function (update,index) {
		if (Math.round(update.x) == Math.round(absToRel(x).x) && Math.round(update.y) == Math.round(y) && update.layer == layer) {
			world.updates.splice(index,1);
		}
	})
	// replace block with air
	world.sectors[sectorIndex(absToRel(x).sectorX,y)].layers[layer][getIndex(absToRel(x).x,y)] = {data:0};

}
function placeBlock(x,y,layer,blockData) {
	// place block
	if (sectorIndex(absToRel(x).sectorX)<world.sectors.length) {
		world.sectors[sectorIndex(absToRel(x).sectorX)].layers[layer][getIndex(absToRel(x).x,y)] = JSON.parse(JSON.stringify(blockData));
		// create network update
		if (layer == 0 && blockData.hasOwnProperty('network')) {
			world.updates.push(new update(Math.round(x),Math.round(y),layer,blockData.network.type));
		}
	}
}
function networkRotation(ports,radians) {
	var altered = ports;
	for (var i = 0; i < Math.abs(radians*2); i++) {
		if (radians > 0) {
			// rotate clockwise
			altered.push(altered.shift());
		} else if (radians < 0) {
			// rotate counter-clockwise
			altered.unshift(altered.pop());
		} else {
			break;
		}
	}
	return altered;
}
function audio(name,index) {
	var sound = assets.audio[name][typeof index !== 'number'?randWithin(0,assets.audio[name].length-1,true):index];
	for (var a = 0; a < client.audiochannels.length; a++) {
		var thistime = new Date();
		if (client.audiochannels[a]['finished'] < thistime.getTime()) {
			client.audiochannels[a]['finished'] = thistime.getTime() + sound.duration * 1000;
			client.audiochannels[a]['channel'].src = sound.src;
			client.audiochannels[a]['channel'].load();
			client.audiochannels[a]['channel'].volume = 1;
			client.audiochannels[a]['channel'].play();
			break;
		}
	}
};