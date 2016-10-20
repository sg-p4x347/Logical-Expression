'use strict';
// Game:        Sandbox version 2 (server)
// Developer:   Gage Coates (sg_p4x347)
// Date:        July, 2015 - undefined
// Synopsis:    A sandbox based mining/crafting game written in JavaScript (an OOP update to the original "Sandbox 1.0")

//require('/utility.js')
//require('/assets.js')

function Server(name) {
	this.name = name;
	this.elapsed = 0;
	this.lastTime = Date.now();
	this.tickTimer = 0;
	this.timeout;
}
Server.prototype.serverUpdate = function () {
	// update the time updates
	server.elapsed = (Date.now() - server.lastTime)/1000;
	server.lastTime = Date.now();
	// world time (20 minute days)
	if (world.time <= 24) {
		world.time += 0.02*server.elapsed;
	} else {
		world.time = 0;
	}
	server.tickTimer = server.tickTimer < 6? server.tickTimer +1: 0;
	//========
	// Updates
	//========
	world.players.forEach(function (player,playerIndex) {
		if (player.connected) {	
			// update player tick
			if (server.tickTimer === 0) {
				player.tick(server.elapsed);
			}
		}
		if (server.tickTimer === 0) {
			//====================
			// Local block updates
			//====================
			var water = [];
			for (var y = Math.round(player.y - 32); y < player.y+32 && y >= 0 && y < 256;y++) {
				for (var x = Math.round(player.x -16); x<player.x+16;x++) {
					var block = world.sectors[sectorIndex(absToRel(x).sectorX)].layers[0][getIndex(absToRel(x).x,y)];
					var blockProps = getProperties(block,['type','fall','storage','network']);
					// Storage blocks
					if (block.hasOwnProperty('storage')) {
						switch (block.storage.type) {
						case 'furnace':
							if (block.storage.smelting.progress < 1) {
								if (block.storage.smelting.recipe != null) {
									block.storage.smelting.progress += (6*client.time)/block.storage.smelting.recipe.time;
									block.storage.smelting.fuel -= 6*client.time;
									if (block.storage.smelting.fuel <= 0) {
										block.storage.smelting.fuel = getProperties(block.storage.fuel.slots[0].data,['fuel'],block.storage.fuel.slots[0].type).fuel;
										block.storage.fuel.slots[0].count--;
										if (block.storage.fuel.slots[0].count <= 0) {
											block.storage.fuel.slots[0] = null;
										}
									}
								} else {
									block.storage.smelting.progress = 0;
								}
							} else {
								// deplete inputs
								block.storage.smelting.recipe.input.forEach(function (input) {
									for (var index = block.storage.input.slots.length-1;index>=0;index--) {
										if (compareTDC(block.storage.input.slots[index],input)) {
											block.storage.input.slots[index].count-= input.count;
											if (block.storage.input.slots[index].count <= 0) {
												block.storage.input.slots[index] = null;
												break;
											}
										}
									}
								})
								// deplete cast
								block.storage.cast.slots[0].data.durability -= (1/512)/getProperties(block.storage.cast.slots[0].data,['tier'],block.storage.cast.slots[0].type).tier;
								if (block.storage.cast.slots[0].data.durability < 0) {
									block.storage.cast.slors[0].data.durability = 0;
								}
								// output
								if (block.storage.output.slots[0] == null) {
									block.storage.output.slots[0] = JSON.parse(JSON.stringify(block.storage.smelting.recipe.output));
								} else if (compareTDC(block.storage.smelting.recipe.output,block.storage.output.slots[0])) {
									block.storage.output.slots[0].count += block.storage.smelting.recipe.output.count;
								}
								// slag
								if (block.storage.slag.slots[0] == null) {
									block.storage.slag.slots[0] = JSON.parse(JSON.stringify(block.storage.smelting.recipe.slag));
								} else if (compareTDC(block.storage.smelting.recipe.slag,block.storage.slag.slots[0])) {
									block.storage.slag.slots[0].count += block.storage.smelting.recipe.slag.count;
								}
								block.storage.smelting.progress = 0;
								checkSmelting(block.storage);
							}
							break;
						}
					}
					// Physics blocks
					if (blockProps.type === 'liquid') {
						// spread water
						if (world.sectors[sectorIndex(absToRel(x-1).sectorX)].layers[0][getIndex(absToRel(x-1).x,y)].data == 0) {
							water.push({x:x-1,y:y,block:block})
						}
						if (world.sectors[sectorIndex(absToRel(x+1).sectorX)].layers[0][getIndex(absToRel(x+1).x,y)].data == 0) {
							water.push({x:x+1,y:y,block:block})
						}
						if (world.sectors[sectorIndex(absToRel(x).sectorX)].layers[0][getIndex(absToRel(x).x,y+1)].data == 0) {
							water.push({x:x,y:y+1,block:block})
						}
					} else if (blockProps.fall && (world.sectors[sectorIndex(absToRel(x).sectorX)].layers[0][getIndex(absToRel(x).x,y+1)].data == 0 || getProperties(world.sectors[sectorIndex(absToRel(x).sectorX)].layers[0][getIndex(absToRel(x).x,y+1)],['type']).type == 'liquid')) {
						// falling blocks
						world.entities.push(new entity(x,y,0,0,0,assets.gravity,'block',new item('block',block,1),'full'));
						breakBlock(x,y,0);
					}
					// Saplings
					if ([43,52].indexOf(block.data) != -1) {
						// check if there is a dirt type block underneath
						if (getProperties(world.sectors[sectorIndex(absToRel(x).sectorX)].layers[0][getIndex(x,y+1)],['type']).type !== 'dirt') {
							breakBlock(x,y,0,true);
						} else if (probability(1/30)) {
							var sapType = 0;
							switch (block.data) {
							case 43: sapType = 0; break;
							case 52: sapType = 1; break;
							}
							if (growTree(absToRel(x).x,y+1,assets.trees[sapType],world.sectors[sectorIndex].layers)) {
								breakBlock(x,y,0);
							}
						}
					}
				}
			}
			// Make changes to the world
			water.forEach(function (position) {
				world.sectors[sectorIndex(absToRel(position.x).sectorX)].layers[0][getIndex(absToRel(position.x).x,position.y)] = JSON.parse(JSON.stringify(position.block));
			});
		}
	})
	//================
	// update entities
	//================
	world.entities.forEach(function (entity, index) {
		world.players.some(function (player) {
			if (isBetween(player.x-32,entity.x,player.x+32)) {
				entity.update(server.elapsed);
				if (server.tickTimer == 0) {
					// update entity tick
					entity.tick(index,server.elapsed);	
				}
				// pick up item entities
				if (entity.type == 'item' && isBetween(player.x-0.5,entity.x,player.x+0.5)&&isBetween(player.y-0.75,entity.y,player.y+1)) {
					var stack = getProperties(entity.data.data,['stack'],entity.data.type).stack;
					var search = false;
					player.inventory.body.slots.some(function (item,slot,array) {
						if (item != null && compareTDC(item,entity.data)&&item.count < stack) {
							var transfer = 0;
							if (stack-item.count >= entity.data.count) {
								transfer = entity.data.count;
							} else {
								transfer = stack-item.count;
							}
							array[slot].count += transfer;
							entity.data.count -= transfer;
							search = true;
							return true;
						} 
					})
					if (!search) {
						player.inventory.body.slots.some(function (item,slot,array) {
							if (item == null) {
								array[slot] = JSON.parse(JSON.stringify(entity.data));
								var transfer = 0;
								if (stack >= entity.data.count) {
									transfer = entity.data.count;
								} else {
									transfer = stack;
								}
								array[slot].count = transfer;
								entity.data.count -= transfer;
								return true;
							}
						})
					}
					// remove the entity
					if (entity.data.count <= 0) {
						world.entities.splice(index,1);
					}
				}
				return true;
			}
		});
	})
	//==============
	// Block Updates
	//==============
	if (server.tickTimer === 0) {
		var wires = [];
		world.updates.forEach(function (update, index, array) {
			world.players.some(function (player) {
				if (isBetween(player.x-32,update.x,player.x+32)) {
					var thisBlock = getProperties(world.sectors[update.sectorIndex].layers[update.layer][update.index],['network','rotation','color']);
					switch (update.type) {
					case 'unit':
						// update inputs and outputs 
						var input = [{type:null,active:null},{type:null,active:null},{type:null,active:null},{type:null,active:null}];
						// factor in block rotation
						var output = networkRotation(thisBlock.network.ports,-thisBlock.rotation);
						// get inputs
						var locale = [{x:0,y:-1,adj:2,self:0},{x:-1,y:0,adj:3,self:1},{x:0,y:1,adj:0,self:2},{x:1,y:0,adj:1,self:3}];
						locale.forEach(function (adj) {
							var adjBlock = getProperties(world.sectors[sectorIndex(absToRel(update.x+adj.x).sectorX)].layers[0][getIndex(absToRel(update.x+adj.x).x,update.y+adj.y)],['rotation']);
							if (adjBlock.hasOwnProperty('network')) {
								input[adj.self] = adjBlock.network.ports[adj.adj];
							}
						})
						// factor in block rotation
						input = networkRotation(input,-thisBlock.rotation)
						// Logic Gates
						var logicInput = {
							top:(input[0].type == 'logic' ||input[0].type == 'jacket') && input[0].active,
							left:(input[1].type == 'logic' || input[1].type == 'jacket') && input[1].active,
							bottom:(input[2].type == 'logic' || input[2].type == 'jacket')  && input[2].active,
							right:(input[3].type == 'logic' || input[3].type == 'jacket') && input[3].active
						}
						switch (thisBlock.data) {
						case 64:
							// AND
							if (logicInput.left && logicInput.right) {
								output[0].active = true;
							} else {
								output[0].active = false;
							}
							break;
						case 65:
							// OR
							if (logicInput.left||logicInput.bottom||logicInput.right) {
								output[0].active = true;
							} else {
								output[0].active = false;
							}
							break;
						case 66:
							// NOT
							if (!logicInput.bottom) {
								output[0].active = true; output[1].active = true; output[3].active = true;
							} else {
								output[0].active = false; output[1].active = false; output[3].active = false;
							}
							break;
						case 67:
							// XOR
							if ((logicInput.left && !logicInput.right) || (logicInput.right && !logicInput.left)) {
								output[0].active = true;
							} else {
								output[0].active = false;
							}
							break;
						case 68:
							// OFF Switch
							output[0].active = false; output[1].active = false; output[2].active = false; output[3].active = false;
							break;
						case 69:
							// ON Switch
							output[0].active = true; output[1].active = true; output[2].active = true; output[3].active = true;
							break;
						case 70:
							// Indicators
						case 71:
							if (logicInput.top||logicInput.left||logicInput.bottom||logicInput.right) {
								world.sectors[sectorIndex(absToRel(update.x).sectorX)].layers[0][getIndex(absToRel(update.x).x,update.y)].data = 71;
							} else {
								world.sectors[sectorIndex(absToRel(update.x).sectorX)].layers[0][getIndex(absToRel(update.x).x,update.y)].data = 70;
							}
							break;
						case 72:
							// Diode
							if (logicInput.bottom) {
								output[0].active = true; output[1].active = true; output[3].active = true;
							} else {
								output[0].active = false; output[1].active = false; output[3].active = false;
							}
							break;
						case 73:
							// SR Latch
							if (logicInput.left) {
								output[3].active = true;
								output[0].active = false;
							} else {
								output[3].active = false;
								if (logicInput.bottom) {
									output[0].active = true;
								}
							}
							break;
						case 74:
							// D Latch
							if (logicInput.left) {
								output[3].active = true;
								output[0].active = logicInput.bottom;
							} else {
								output[3].active = false;
							}
							break;
						case 75:
							// Half Adder
							if (logicInput.right||logicInput.bottom) {
								if (logicInput.right&&logicInput.bottom) {
									output[1].active = true;
									output[0].active = false;
								} else {
									output[1].active = false;
									output[0].active = true;
								}
							} else {
								output[0].active = false;
								output[1].active = false;
							}
							break;
						case 76:
							// Angled AND Gates
							if (logicInput.left) {
								output[3].active = true
								if (logicInput.bottom) {
									output[0].active = true;
								} else {
									output[0].active = false;
								}
							} else {
								output[3].active = false;
								output[0].active = false;
							}
							break;
						case 83:
							// Bundled AND Gates
							if (input[1].type == 'bundle' && (logicInput.top||logicInput.bottom)) {
								output[3].active = input[1].active;
							} else {
								output[3].active = JSON.parse(JSON.stringify(assets.blockData[83].network.ports[3].active));
							}
						}
						// rotate the outputs back to the rotated position
						output = networkRotation(output,thisBlock.rotation)
						// attach the calculated outputs to the actual block
						world.sectors[sectorIndex(absToRel(update.x).sectorX)].layers[0][getIndex(absToRel(update.x).x,update.y)].network.ports = output;
						break;
					case 'wire':
						wires.push({x:update.x,y:update.y});
						// clip model if necessary
						if (!thisBlock.network.bridge) {
							world.sectors[sectorIndex(absToRel(update.x).sectorX)].layers[0][getIndex(absToRel(update.x).x,update.y)].model = [{x:-0.125,y:-0.125,width:0.25,height:0.25}];
							var locale = [{x:0,y:-1,face:2,model:{x:-0.125,y:-0.5,width:0.25,height:0.375}},{x:0,y:1,face:0,model:{x:-0.125,y:0.125,width:0.25,height:0.375}},{x:-1,y:0,face:3,model:{x:-0.5,y:-0.125,width:0.375,height:0.25}},{x:1,y:0,face:1,model:{x:0.125,y:-0.125,width:0.375,height:0.25}}];
							if ([70,71,79].indexOf(thisBlock.data) != -1) {
								world.sectors[sectorIndex(absToRel(update.x).sectorX)].layers[0][getIndex(absToRel(update.x).x,update.y)].model = [{x:-0.375,y:-0.375,width:0.75,height:0.75}];
								locale = [{x:0,y:-1,face:2,model:{x:-0.375,y:-0.5,width:0.75,height:0.125}},{x:0,y:1,face:0,model:{x:-0.375,y:0.375,width:0.75,height:0.125}},{x:-1,y:0,face:3,model:{x:-0.5,y:-0.375,width:0.125,height:0.75}},{x:1,y:0,face:1,model:{x:0.375,y:-0.375,width:0.125,height:0.75}}];
							} else if (thisBlock.data == 78) {
								world.sectors[sectorIndex(absToRel(update.x).sectorX)].layers[0][getIndex(absToRel(update.x).x,update.y)].model = [{x:-0.25,y:-0.25,width:0.5,height:0.5}];
								locale = [{x:0,y:-1,face:2,model:{x:-0.25,y:-0.5,width:0.5,height:0.25}},{x:0,y:1,face:0,model:{x:-0.25,y:0.25,width:0.5,height:0.25}},{x:-1,y:0,face:3,model:{x:-0.5,y:-0.25,width:0.25,height:0.5}},{x:1,y:0,face:1,model:{x:0.25,y:-0.25,width:0.25,height:0.5}}];
							}
							locale.forEach(function (adj, index) {
								var adjBlock = getProperties(world.sectors[sectorIndex(absToRel(update.x+adj.x).sectorX)].layers[0][getIndex(absToRel(update.x+adj.x).x,update.y+adj.y)],['rotation'])
								if (adjBlock.hasOwnProperty('network')&& adjBlock.network.ports[adj.face].type != null 
								&& (adjBlock.network.ports[adj.face].type == thisBlock.network.ports[index].type||(adjBlock.network.ports[adj.face].type== 'logic'&&thisBlock.network.ports[index].type=='jacket')||(adjBlock.network.ports[adj.face].type== 'jacket'&&thisBlock.network.ports[index].type=='logic')||(adjBlock.network.ports[adj.face].type== 'jacket'&&thisBlock.network.ports[index].type=='bundle')||(adjBlock.network.ports[adj.face].type== 'bundle'&&thisBlock.network.ports[index].type=='jacket')) 
								&& (thisBlock.color == null || !thisBlock.hasOwnProperty('color')||adjBlock.color == null ||!adjBlock.hasOwnProperty('color')|| adjBlock.color == thisBlock.color)) {	
									world.sectors[sectorIndex(absToRel(update.x).sectorX)].layers[0][getIndex(absToRel(update.x).x,update.y)].model.push(adj.model)
								}
							})
						}
					break;
					}
					return true;
				}
			});		
		});
		// turn all wires off
		wires.forEach(function (wire) {
			var thisBlock = world.sectors[sectorIndex(absToRel(wire.x).sectorX)].layers[0][getIndex(absToRel(wire.x).x,wire.y)];
			world.sectors[sectorIndex(absToRel(wire.x).sectorX)].layers[0][getIndex(absToRel(wire.x).x,wire.y)].network.ports = assets.blockData[thisBlock.data].network.ports;
			world.sectors[sectorIndex(absToRel(wire.x).sectorX)].layers[0][getIndex(absToRel(wire.x).x,wire.y)].active = false;
		})
		// update logic wires
		world.updates.forEach(function (update, index, array) {
			if (update.type == 'unit') {
				world.players.some(function (player) {
					if (isBetween(player.x-32,update.x,player.x+32)) {
						var thisBlock = world.sectors[update.sectorIndex].layers[update.layer][update.index];
						var visited = [];
						var probes = [];
						var locale = [{x:0,y:-1,adj:2,self:0},{x:-1,y:0,adj:3,self:1},{x:0,y:1,adj:0,self:2},{x:1,y:0,adj:1,self:3}];
						// push seed probes out from each active side
						thisBlock.network.ports.forEach(function (port,index) {
							var adjBlock = world.sectors[sectorIndex(absToRel(update.x+locale[index].x).sectorX)].layers[0][getIndex(absToRel(update.x+locale[index].x).x,update.y+locale[index].y)]
							
							if (adjBlock.hasOwnProperty('network') && adjBlock.network.type == 'wire' && ((port.type == 'bundle' && adjBlock.network.ports[locale[index].adj].type == 'bundle' && thisBlock.network.ports.indexOf(true) != -1)||((port.type == 'logic' || port.type == 'jacket')&&((adjBlock.network.ports[locale[index].adj].type == 'logic' || adjBlock.network.ports[locale[index].adj].type == 'jacket')) && ((port.type == 'logic'&& port.active) || (port.type == 'jacket'&& port.active))))) {
								probes.push({x:update.x+locale[index].x,y:update.y+locale[index].y,last:{x:update.x,y:update.y,face:index}})
							}
						})
						while (probes.length >0) {
							var temp = [];
							probes.forEach(function (probe) {
								var probeBlock = getProperties(world.sectors[sectorIndex(absToRel(probe.x).sectorX)].layers[0][getIndex(absToRel(probe.x).x,probe.y)],['color']);
								// activate this wire
								var ports = probeBlock.network.ports;
								/* if (probeBlock.network.bridge) {
									if (probe.last.x == probe.x) {
										ports[0].active = probeBlock.network.ports[0].type == 'bundle'?[true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true]:true; 
										ports[2].active = probeBlock.network.ports[2].type == 'bundle'?[true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true]:true;
									} else {
										ports[1].active = probeBlock.network.ports[1].type == 'bundle'?[true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true]:true;
										ports[3].active = probeBlock.network.ports[3].type == 'bundle'?[true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true]:true;
									}
								} else { */
								var lastBlock = getProperties(world.sectors[sectorIndex(absToRel(probe.last.x).sectorX)].layers[0][getIndex(absToRel(probe.last.x).x,probe.last.y)],['color']);
										var active;
										if (ports[0].type == 'bundle') {
											// use data from the last block
											active = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]
											if (lastBlock.network.ports[probe.last.face].type == 'bundle') {
												active = lastBlock.network.ports[probe.last.face].active;
											} else if (lastBlock.network.ports[probe.last.face].type == 'jacket') {
												active[lastBlock.color] = true;
											}
											// make sure not to over-ride active channels with false
											probeBlock.network.ports[0].active.forEach(function (overRide,channel) {
												if (overRide.active) {
													active[channel] = true;
												}
											})
											// update this block's state
											ports[0].active = active; ports[1].active = active; ports[2].active = active; ports[3].active = active;
										} else if (ports[0].type == 'jacket') {
											if (lastBlock.network.ports[probe.last.face].type == 'bundle') {
												active = lastBlock.network.ports[probe.last.face].active[probeBlock.color]
											} else if (lastBlock.network.ports[probe.last.face].type == 'logic' || (lastBlock.network.ports[probe.last.face].type == 'jacket' && lastBlock.color == probeBlock.color)){
												active = lastBlock.network.ports[probe.last.face].active
											}
											if (active) {
												ports[0].active = true; ports[1].active = true; ports[2].active = true; ports[3].active = true;
											}
										} else if (ports[0].type == 'logic'){
											if (lastBlock.network.ports[probe.last.face].active) {
												ports[0].active = true; ports[1].active = true; ports[2].active = true; ports[3].active = true;
												world.sectors[sectorIndex(absToRel(probe.x).sectorX)].layers[0][getIndex(absToRel(probe.x).x,probe.y)].active = true;
											}
										}
								//}
								world.sectors[sectorIndex(absToRel(probe.x).sectorX)].layers[0][getIndex(absToRel(probe.x).x,probe.y)].network.ports = ports;
								// create more probes if necessary
								locale.forEach(function (port,index) {
									var adjBlock = getProperties(world.sectors[sectorIndex(absToRel(probe.x+locale[index].x).sectorX)].layers[0][getIndex(absToRel(probe.x+locale[index].x).x,probe.y+locale[index].y)],[,'color']);
									if (adjBlock.hasOwnProperty('network') && adjBlock.network.type == 'wire') {
										var search = false;
										visited.some(function(visit) {
											if (visit.x == probe.x && visit.y == probe.y) {
												search = true;
												return true;
											}
										})
										var channelSearch = false;
										if (probeBlock.network.ports[0].type == 'bundle' && adjBlock.network.ports[0].type == 'bundle') {
											probeBlock.network.ports[0].active.some(function (channel,channelIndex) {
												if (channel != adjBlock.network.ports[0].active[channelIndex]) {
													return true;
												}
												if (channelIndex == 15) {
													channelSearch = true;
												}
											})
										} else if (probeBlock.network.ports[0].type == 'bundle' && adjBlock.network.ports[0].type == 'jacket') {
											if (!probeBlock.network.ports[0].active[adjBlock.color] || adjBlock.network.ports[0].active)  {
												channelSearch = true;
											}
										} else if (probeBlock.network.ports[0].type == 'jacket' && adjBlock.network.ports[0].type == 'bundle') {
											if (adjBlock.network.ports[0].active[probeBlock.color]) {
												channelSearch = true;
											}
										} else if ((probeBlock.network.ports[0].type == 'jacket' || probeBlock.network.ports[0].type == 'logic') && (adjBlock.network.ports[0].type == 'jacket' || adjBlock.network.ports[0].type == 'logic')) {
											if (adjBlock.network.ports[0].active) {
												channelSearch = true;
											}
										} else {
											channelSearch = true;
										}
										
										if (/* (!search || (probeBlock.network.bridge && !probeBlock.network.ports[index].active)) 
												&& */ adjBlock.hasOwnProperty('network') && adjBlock.network.type == 'wire' 
												&& !channelSearch
												&& (probeBlock.color == null || !probeBlock.hasOwnProperty('color')||adjBlock.color == null ||!adjBlock.hasOwnProperty('color')|| adjBlock.color == probeBlock.color) 
												&& (!probeBlock.network.bridge || probe.last.x == probe.x+port.x || probe.last.y == probe.y+port.y)) {
											temp.push({x:probe.x+port.x,y:probe.y+port.y,last:{x:probe.x,y:probe.y,face:locale[index].adj}})
										}
									}
								})
								visited.push(probe)
							})
							probes = temp;
						}
						
						return true;
					}
				});
			}
		});
	}
	//server.timeout = setTimeout(server.serverUpdate, 1000/60)
}

var server = new Server();
