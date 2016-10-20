//===================================================
// Required game information on just about everything
//===================================================

/* The new way of storing block data is based on a fall-back system.
The absolute minimum amount of data is stored in a block within the world, containing only the most specific information for that block.
In the case where a function is operating on a block, any missing properties are searched for in the 'blockData' variable based on the block's data value.
Any properties that are not defined in the blockData variable are subsequently searched for in the 'defaultBlock' variable.
	1. Block specific data
	2. Data value data
	3. fall-back data
*/
var assets = {};
assets.storage = {
	'inventory': {
type: 'inventory',
sx: 0, 
sy: 44, 
width: 80, 
height: 64,
body: {x:3,y:8,width:9,height:4,slots: newFilledArray(36,null)},
elements: [
		new UIelement(null,'absolute','topLeft',0,0,80,172,16,16,{type:'help'})
		]
	},
	'hotbar': {
type: 'hotbar',
body: {x:3,y:14,width:9,height:1,slots: newFilledArray(9,null)}
	},	
	'invCrafting':{
type: 'crafting',
sx: 24,
sy: 20,
width: 32,
height: 24,
input: {x:6,y:5,width:1,height:1,slots:[null]},
tool: {x:8,y:6,width:1,height:1,slots:[null]},
output: {x:8,y:5,width:1,height:1,slots:[null]}
	},
	'crafting': {
type: 'crafting',
sx: 80,
sy: 0,
width: 64,
height: 48,
input: {x:4,y:2,width:5,height:5,slots: newFilledArray(25,null)},
tool: {x:10,y:5,width:1,height:1,slots: [null]},
output: {x:10,y:4,width:1,height:1,slots: [null]}
	},
	'chest': {
type: 'chest',
sx: 0,
sy: 108,
width: 80,
height: 64,
body: {x:3,y:0,width:9,height:7,slots:newFilledArray(63,null)}
	},
	'furnace': {
type: 'furnace',
tier: 1,
sx: 80,
sy: 48,
width: 64,
height: 48,
smelting: {
progress: 0,
recipe: null,
fuel: 0
		},
input: {x:5,y:4,width:3,height:1,slots:[null,null,null]},
fuel: {x:6,y:6,width:1,height:1,slots:[null]},
cast: {x:9,y:6,width:1,height:1,slots:[null]},
slag: {x:10,y:5,width:1,height:1,slots:[null]},
output: {x:10,y:6,width:1,height:1,slots:[null]}
	},
	'help': {
type: 'help',
sx: 0,
sy: 196,
width: 128,
height: 64,
body: {x:0,y:1,width:14,height:6,slots:newFilledArray(84,null)},
elements: [
		new UIelement('crafting','relative','topLeft',0,0,0,196,60,8,{type:'helpTab',data:'craftingRecipes'}),
		new UIelement('smelting','relative','topLeft',60,0,60,196,60,8,{type:'helpTab',data:'smeltingRecipes'})
		]
	},
	'hammering': {
type: 'hammering',
hammering: {
hammeringRecipe: 0
		},
sx: 80,
sy: 96,
width: 48,
height: 56,
input: {x:6,y:3,width:1,height:1,slots: [null]},
tool: {x:7,y:5,width:1,height:1,slots: [null]},
output: {x:8,y:3,width:1,height:1,slots: [null]},
elements: [
		new UIelement(null,'relative','topLeft',39,9,24,0,4,6,{type:'hammerArrow',data:-1},{sx:32,sy:0}),
		new UIelement(null,'relative','topLeft',85,9,28,0,4,6,{type:'hammerArrow',data:1},{sx:36,sy:0}),
		new UIelement('Stair','relative','topLeft',44,8,null,null,40,8)
		]
	}
}
assets.menu = {
	'titlescreen': {screen: 0, type: 'titlescreen',data:[
		new UIelement(null,'proportional','center',0.5,0.125,0,260,120,15,null),
		new UIelement('Multiplayer','proportional','center',0.5,0.375,0,172,80,16,{type:'transfer',data:'multiplayer'}),
		new UIelement('Singleplayer','proportional','center',0.5,0.5,0,172,80,16,{type:'transfer',data:'singleplayer'}),
		new UIelement('Options','proportional','center',0.5,0.625,0,172,80,16,{type:'transfer',data:'options'}),
		new UIelement('Credits','proportional','center',0.5,0.75,0,172,80,16,{type:'transfer',data:'credits'})
		]},
	'singleplayer': {screen: 1,type: 'singleplayer',data:[
		new UIelement('Create new world','proportional','center',0.5,0.125,0,172,80,16,{type:'transfer',data:'generator'}),
		new UIelement(null,'absolute','bottomLeft',0,canvas.height,96,172,16,16,{type:'transfer',data:'titlescreen'})
		]},
	'multiplayer': {screen: 1, type:'multiplayer',data:[
		new UIelement(null,'absolute','bottomLeft',0,canvas.height,96,172,16,16,{type:'transfer',data:'titlescreen'})
		]},
	'generator': {screen: 1, data:[
		new UIelement('Roughness: 6','proportional','center',0.5,0.5,0,172,80,16),
		new UIelement(null,'proportional','center',0.85,0.46,68,0,6,4,{type:'roughnessArrow',data:1},{sx:56,sy:0}),
		new UIelement(null,'proportional','center',0.85,0.54,74,0,6,4,{type:'roughnessArrow',data:-1},{sx:62,sy:0}),
		new UIelement('Generate','proportional','center',0.5,0.625,0,172,80,16,{type:'generate'}),
		new UIelement(null,'absolute','bottomLeft',0,canvas.height,96,172,16,16,{type:'transfer',data:'singleplayer'}),
		new UIelement('world1','proportional','center',0.5,0.375,0,172,80,16,{type:'textBox'},null,false)
		]},
	'options': {screen: 1, data:[
		new UIelement('Controls','proportional','center',0.5,0.125,0,172,80,16,{type:'transfer',data:'controls'}),
		new UIelement(null,'absolute','bottomLeft',0,canvas.height,96,172,16,16,{type:'transfer',data:'titlescreen'})
		]},
	'controls': {screen: 1, data:[
		new UIelement('Left: ' + getCharacter(client.keyBinds.left),'proportional','center',0.5,0.125,0,172,80,16,{type:'control',data:'left'}),
		new UIelement('Right: ' + getCharacter(client.keyBinds.right),'proportional','center',0.5,0.25,0,172,80,16,{type:'control',data:'right'}),
		new UIelement('Up(ladders): ' + getCharacter(client.keyBinds.forward),'proportional','center',0.5,0.375,0,172,80,16,{type:'control',data:'forward'}),
		new UIelement('Down(ladders): ' + getCharacter(client.keyBinds.back),'proportional','center',0.5,0.5,0,172,80,16,{type:'control',data:'back'}),
		new UIelement('Jump: ' + getCharacter(client.keyBinds.jump),'proportional','center',0.5,0.625,0,172,80,16,{type:'control',data:'jump'}),
		new UIelement('Inventory: ' + getCharacter(client.keyBinds.inventory),'proportional','center',0.5,0.75,0,172,80,16,{type:'control',data:'inventory'}),
		new UIelement('Shift: ' + getCharacter(client.keyBinds.shift),'proportional','center',0.5,0.875,0,172,80,16,{type:'control',data:'shift'}),
		new UIelement('Chat: ' + getCharacter(client.keyBinds.chat),'proportional','center',0.5,1,0,172,80,16,{type:'control',data:'chat'}),
		new UIelement('Drop item: ' + getCharacter(client.keyBinds.drop),'proportional','center',0.5,1.125,0,172,80,16,{type:'control',data:'drop'}),
		new UIelement(null,'absolute','bottomLeft',0,canvas.height,96,172,16,16,{type:'transfer',data:'options'})
		]},
	'credits': {screen: 1, data:[
		new UIelement('Made by sg_p4x347','proportional','center',0.5,0.125,null,null,80,24,null),
		new UIelement('Extra help from camdonite','proportional','center',0.5,0.25,null,null,80,24,null),
		new UIelement(null,'absolute','bottomLeft',0,canvas.height,96,172,16,16,{type:'transfer',data:'titlescreen'})
		]},
	'game': {screen: 1, data:[
		new UIelement('Save and Exit','proportional','center',0.5,0.25,0,172,80,16,{type:'transfer',data:'titlescreen'}),
		new UIelement('Save','proportional','center',0.5,0.5,0,172,80,16,{type:null,data:null}),
		new UIelement('Resume','proportional','center',0.5,0.75,0,172,80,16,{type:'resume'})
		]},
	'dead': {screen: 1, data:[
		new UIelement('Save and exit','proportional','center',0.5,0.25,0,172,80,16,{type:'transfer',data:'titlescreen'}),
		new UIelement('You are dead!','proportional','center',0.5,0.5,null,null,80,48),
		new UIelement('Respawn', 'proportional','center',0.5,0.75,0,172,80,16,{type:'respawn'})
		]},
}
assets.hammeringRecipes = [
{name: 'Stairs',collision:'stairs',count:2},
{name: '0.125 Slab',collision:'0.125_slab',count:8},
{name: '0.25 Slab',collision:'0.25_slab',count:4},
{name: '0.375 Slab',collision:'0.375_slab',count:2},
{name: '0.5 Slab',collision:'0.5_slab',count:2},
{name: '0.625 Slab',collision:'0.625_slab',count:1},
{name: '0.75 Slab',collision:'0.75_slab',count:1},
{name: '0.875 Slab',collision:'0.875_slab',count:1},
{name: '0.25 Wall',collision:'0.25_wall',count:4},
{name: '0.5 Wall',collision:'0.5_wall',count:2},
{name: '0.75 Wall',collision:'0.75_wall',count:1},
{name: '0.125 Corner',collision:'0.125_corner',count:64},
{name: '0.25 Corner',collision:'0.25_corner',count:16},
{name: '0.375 Corner',collision:'0.375_corner',count:7},
{name: '0.5 Corner',collision:'0.5_corner',count:4},
{name: '0.625 Corner',collision:'0.625_corner',count:2},
{name: '0.75 Corner',collision:'0.75_corner',count:1},
{name: '0.875 Corner',collision:'0.875_corner',count:1},
{name: 'Round',collision:'round',count:1}
]
assets.blockSheet = new Image()
assets.itemSheet = new Image()
assets.screenSheet = new Image()
assets.font = new Image()
assets.gui = new Image()
assets.parallax = new Image()
assets.sun = new Image()
assets.sprites = {
player: new Image(),
zombie: new Image(),
skeleton: new Image(),
jaffa: new Image()
}
// default block properties
assets.defaultBlock = {
name: 'undefined',
type: 'general',
collision: 'full',
model: 'collision',
rotation: 0,
mirrored: false,
durability: 1,
tier: 0,
drop: [{type:'block',data:'data',min:1,max:1}],
transparent: false,
storage: 'none',
stack: 128,
fall: false,
mass: 1,
network: undefined,
active: false,
color: null
},
// block data, indexed by data value
assets.blockData = [
{
data: 0,
name: 'Air',
type: 'air',
durability: 0,
collision: 'none',
transparent: true,
fall: false
}, {
data: 1,
name: 'Stone',
type: 'stone',
durability: 6,
tier: 1,
drop: [{type:'block',data:{data:9},min:1,max:1}]
}, {
data: 2,
name: 'Dirt',
type: 'dirt',
durability: 1
}, {
data: 3,
name: 'Grass',
type: 'dirt',
durability: 1.2
}, {
data: 4,
name: 'Sand',
type: 'dirt',
durability: 0.8,
fall: true
}, {
data: 5,
name: 'Elm Log',
type: 'wood',
durability: 3
}, {
data: 6,
name: 'Elm Leaves',
type: 'wood',
durability: 0.8,
transparent: true,
drop: [
	{type:'item',data:{data:18},min:1,max:3},
	{type:'item',data:{data:19},min:1,max:2},
	{type:'block',data:{data:43},min:0,max:1,probability:10}
	]
}, {
data: 7,
name: 'Elm Planks',
type: 'wood',
durability: 2
}, {
data: 8,
name: 'Stone Tile',
type: 'stone',
durability: 6
}, {
data: 9,
name: 'Rubble',
type: 'stone',
durability: 5,
tier: 1
}, {
data: 10,
name: 'Elm Chest',
type: 'wood',
collision: 'none',
durability: 3,
transparent: true
}, {
data: 11,
name: 'Crafting Table',
type: 'wood',
collision: 'none',
durability: 3
}, {
data: 12,
name: 'Clay',
type: 'dirt',
durability: 1
}, {
data: 13,
name: 'Mud Bricks',
type: 'stone',
durability: 2,
tier: 1
}, {
data: 14,
name: 'Mud Furnace',
type: 'stone',
collision: 'none',
durability: 2,
tier: 1
}, {
data: 15,
name: 'Copper Ore',
type: 'stone',
tier: 2,
durability: 6.5
}, {
data: 16,
name: 'Tin Ore',
type: 'stone',
tier: 3,
durability: 6.5
}, {
data: 17,
name: 'Iron Ore',
type: 'stone',
tier: 4,
durability: 7
}, {
data: 18,
name: 'Gold Ore',
type: 'stone',
tier: 5,
durability: 7
}, {
data: 19,
name: 'Coal Ore',
type: 'stone',
tier: 2,
durability: 5,
drop: [{type:'item',data:{data:44},min:0,max:2}]
}, {
data: 20,
name: 'Uranium Ore',
type: 'stone',
tier: 6,
durability: 10
}, {
data: 21,
name: 'Thorium Ore',
type: 'stone',
tier: 4,
durability: 7
}, {
data: 22,
name: 'Water',
type: 'liquid',
collision: 'none',
transparent: true
}, {
data: 23,
name: 'Gravel',
type: 'dirt',
durability: 1.8,
drop: [
	{type:'block',data:{data:23},min:0,max:1},
	{type:'item',data:{data:20},min:0,max:1}
	],
fall: true
}, {
data: 24,
name: 'Clay Bricks',
type: 'stone',
durability: 3,
tier: 1
}, {
data: 25,
name: 'Clay Furnace',
type: 'stone',
durability: 3,
tier: 1
}, {
data: 26,
name: 'Glass',
durability: 1,
transparent: true
}, {
data: 27,
name: 'Elm Door Bottom Closed',
type: 'wood',
collision: 'door',
durability: 2
}, {
data: 28,
name: 'Elm Door Top Closed',
type: 'wood',
collision: 'door',
durability: 2,
transparent: true
}, {
data: 29,
name: 'Elm Door Bottom Open',
type: 'wood',
collision: 'none',
durability: 2,
transparent: true
}, {
data: 30,
name: 'Elm Door Top Open',
type: 'wood',
collision: 'none',
durability: 2,
transparent: true
}, {
data: 31,
name: 'Bed Left',
type: 'wood',
collision: 'none',
durability: 2,
transparent: true
}, {
data: 32,
name: 'Bed Right',
type: 'wood',
collision: 'none',
durability: 2,
transparent: true
}, {
data: 33,
name: 'Lead Ore',
type: 'stone',
durability: 7,
tier: 4
}, {
data: 34,
name: 'Silver Ore',
type: 'stone',
durability: 7,
tier: 6
}, {
data: 35,
name: 'Ladder',
type: 'wood',
collision: 'none',
durability: 2,
transparent: true
}, {
data: 36,
name: 'Rope Ladder',
type: 'wood',
collision: 'none',
durability: 1.75,
transparent: true
}, {
data: 37,
name: 'Copper Block',
type: 'metal',
durability: 8,
tier: 1
}, {
data: 38,
name: 'Tin Block',
type: 'metal',
durability: 8,
tier: 1
}, {
data: 39,
name: 'Bronze Block',
type: 'metal',
durability: 8.5,
tier: 1
}, {
data: 40,
name: 'Iron Block',
type: 'metal',
durability: 9,
tier: 1
}, {
data: 41,
name: 'Steel Block',
type: 'metal',
durability: 10,
tier: 1
}, {
data: 42,
name: 'Mantle',
type: 'mantle',
durability: 1000
}, {
data: 43,
name: 'Elm Sapling',
type: 'wood',
durability: 0.5,
collision: 'none',
transparent: true
}, {
data: 44,
name: 'Long Grass',
type: 'wood',
durability: 0.5,
collision: 'none',
transparent: true
}, {
data: 45,
name: 'Yellow Flowers',
type: 'wood',
durability: 0.5,
collision: 'none',
transparent: true
}, {
data: 46,
name: 'Purple Flowers',
type: 'wood',
durability: 0.5,
collision: 'none',
transparent: true
}, {
data: 47,
name: 'Red Flowers',
type: 'wood',
durability: 0.5,
collision: 'none',
transparent: true
}, {
data: 48,
name: 'Pine Log',
type: 'wood',
durability: 3
}, {
data: 49,
name: 'Pine Leaves',
type: 'wood',
durability: 0.8,
transparent: true,
drop: [
	{type:'item',data:{data:18},min:1,max:3},
	{type:'item',data:{data:19},min:1,max:2},
	{type:'block',data:{data:52},min:0,max:1,probability:10}
	]
}, {
data: 50,
name: 'Pine Planks',
type: 'wood',
durability: 2
}, {
data: 51,
name: 'Steel Bars',
type: 'metal',
durability: 10,
transparent: true,
collision: 'none'
}, {
data: 52,
name: 'Pine Sapling',
type: 'wood',
durability: 0.5,
collision: 'none',
transparent: true
}, {
data: 53,
name: 'Cloud',
type: 'air',
durability: 0.1,
collision: 'none',
transparent: true
}, {
data: 54,
name: 'Stalactite',
type: 'stone',
durability: 5,
transparent: true,
tier: 1
}, {
data: 55,
name: 'Column',
type: 'stone',
durability: 1,
transparent: true
}, {
data: 56,
name: 'Rock',
type: 'stone',
durability: 1,
transparent: true,
collision: 'none'
}, {
data: 57,
name: 'Hammering Bench',
type: 'wood',
durability: 4,
collision: 'none',
model: 'full'
}, {
data: 58,
name: 'Stone Bricks',
type: 'stone',
durability: 6,
tier: 1
}, {
data: 59,
name: 'Fitted Stone Bricks',
type: 'stone',
durability: 6,
tier: 1
}, {
data: 60,
name: 'Decorative Stone',
type: 'stone',
durability: 6,
tier: 1
}, {
data: 61,
name: 'Decorative Stone Corner',
type: 'stone',
durability: 6,
tier: 1
}, {
data: 62,
name: 'Spider Web',
type: 'general',
durability: 1,
collision: 'none',
transparent: true
}, {
data: 63,
name: 'Torch',
type: 'wood',
durability: 1,
collision: 'none',
transparent: true
}, {
data: 64,
name: 'AND Gate',
type: 'metal',
durability: 1,
collision: 'none',
transparent: true,
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:null,active:null},{type:'logic',active:false}]}
}, {
data: 65,
name: 'OR Gate',
type: 'metal',
durability: 1,
collision: 'none',
transparent: true,
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 66,
name: 'NOT Gate',
type: 'metal',
durability: 1,
collision: 'none',
transparent: true,
network: {type:'unit',ports:[{type:'logic',active:true},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 67,
name: 'XOR Gate',
type: 'metal',
durability: 1,
collision: 'none',
transparent: true,
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:null,active:null},{type:'logic',active:false}]}
}, {
data: 68,
name: 'Logic Switch',
type: 'metal',
durability: 1,
collision: 'none',
transparent: true,
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 69,
name: 'Logic Switch On',
type: 'metal',
durability: 1,
collision: 'none',
transparent: true,
network: {type:'wire',ports:[{type:'logic',active:true},{type:'logic',active:true},{type:'logic',active:true},{type:'logic',active:true}]}
}, {
data: 70,
name: 'Indicator',
type: 'metal',
durability: 1,
collision: 'none',
transparent: true,
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 71,
name: 'Indicator On',
type: 'metal',
durability: 1,
collision: 'none',
transparent: true,
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 72,
name: 'Diode',
type: 'metal',
durability: 1,
collision: 'none',
transparent: true,
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 73,
name: 'SR Latch',
type: 'metal',
durability: 1,
collision: 'none',
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 74,
name: 'D Latch',
type: 'metal',
durability: 1,
collision: 'none',
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 75,
name: 'Half Adder',
type: 'metal',
durability: 1,
collision: 'none',
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 76,
name: 'Angled AND Gate',
type: 'metal',
durability: 1,
collision: 'none',
network: {type:'unit',ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 77,
name: 'Logic Wire',
type: 'metal',
durability: 0.5,
transparent: true,
collision: 'none',
model: [{x:-0.5,y:-0.125,width:1,height:0.25}],
network: {type:'wire',bridge:false,ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 78,
name: 'Jacketed Cable',
type: 'metal',
durability: 0.5,
transparent: true,
collision: 'none',
model: [{x:-0.5,y:-0.25,width:1,height:0.5}],
color: 0,
network: {type:'wire',bridge:false,ports:[{type:'jacket',active:false},{type:'jacket',active:false},{type:'jacket',active:false},{type:'jacket',active:false}]}
}, {
data: 79,
name: 'Bundled Cable',
type: 'metal',
durability: 0.5,
transparent: true,
collision: 'none',
model: [{x:-0.5,y:-0.375,width:1,height:0.75}],
network: {type:'wire',bridge:false,ports:[
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]}
]}
}, {
data: 80,
name: 'Logic Bridge',
type: 'metal',
durability: 0.8,
transparent: true,
collision: 'none',
model: [
{x:-0.5,y:-0.125,width:0.375,height:0.25},
{x:-0.375,y:-0.375,width:0.75,height:0.25},
{x:0.125,y:-0.125,width:0.375,height:0.25},
{x:-0.125,y:-0.5,width:0.25,height:0.125},
{x:-0.125,y:-0.125,width:0.25,height:0.625}
],
network: {type:'wire',bridge:true,ports:[{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false},{type:'logic',active:false}]}
}, {
data: 81,
name: 'Logic Bundle Bridge',
type: 'metal',
durability: 0.5,
transparent: true,
collision: 'none',
network: {type:'wire',bridge:true,ports:[
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
{type:'logic',active:false},
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
{type:'logic',active:false}
]}
}, {
data: 82,
name: 'Bundled Bridge',
type: 'metal',
durability: 0.5,
transparent: true,
collision: 'none',
network: {type:'wire',bridge:true,ports:[
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]}
]}
}, {
data: 83,
name: 'Bundled AND Gate',
type: 'metal',
durability: 0.5,
transparent: true,
collision: 'none',
network: {type:'unit',ports:[
{type:'logic',active:false},
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
{type:'logic',active:false},
{type:'bundle',active:[false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]}
]}
}, {
data: 84,
name: 'Electrical Cable',
type: 'metal',
durability: 0.5,
transparent: true,
collision: 'none',
model: [{x:-0.5,y:-0.125,width:1,height:0.25}],
network: {type:'wire',bridge:false,ports:[{type:'power',active:false},{type:'power',active:false},{type:'power',active:false},{type:'power',active:false}]}
}, {
data: 85,
name: 'Electrical Bridge',
type: 'metal',
durability: 0.8,
transparent: true,
collision: 'none',
model: [
{x:-0.5,y:-0.125,width:0.375,height:0.25},
{x:-0.375,y:-0.375,width:0.75,height:0.25},
{x:0.125,y:-0.125,width:0.375,height:0.25},
{x:-0.125,y:-0.5,width:0.25,height:0.125},
{x:-0.125,y:-0.125,width:0.25,height:0.625}
],
network: {type:'wire',bridge:true,ports:[{type:'power',active:false},{type:'power',active:false},{type:'power',active:false},{type:'power',active:false}]}
}
]
// default item properties
assets.defaultItem = {
name: 'undefined',
type: 'item',
tier: 0,
durability: 1,
stack: 128,
fuel: 0,
food: 0,
blocks: {
width: 0,
height: 0,
data: []
	}
}
// item data, indexed by data value
assets.itemData = [
{
data: 0,
name: 'Error'
}, {
data: 1,
name: 'Wood Pickaxe',
type: 'pickaxe',
tier: 1,
durability: 1,
stack: 1
}, {
data: 2,
name: 'Stone Pickaxe',
type: 'pickaxe',
tier: 2,
durability: 1,
stack: 1
}, {
data: 3,
name: 'Copper Pickaxe',
type: 'pickaxe',
tier: 3,
durability: 1,
stack: 1
}, {
data: 4,
name: 'Bronze Pickaxe',
type: 'pickaxe',
tier: 4,
durability: 1,
stack: 1
}, {
data: 5,
name: 'Iron Pickaxe',
type: 'pickaxe',
tier: 5,
durability: 1,
stack: 1
}, {
data: 6,
name: 'Steel Pickaxe',
type: 'pickaxe',
tier: 6,
durability: 1,
stack: 1
}, {
data: 7,
name: 'Wood Shovel',
type: 'shovel',
tier: 1,
durability: 1,
stack: 1
}, {
data: 8,
name: 'Stone Shovel',
type: 'shovel',
tier: 2,
durability: 1,
stack: 1
}, {
data: 9,
name: 'Copper Shovel',
type: 'shovel',
tier: 3,
durability: 1,
stack: 1
}, {
data: 10,
name: 'Bronze Shovel',
type: 'shovel',
tier: 4,
durability: 1,
stack: 1
}, {
data: 11,
name: 'Iron Shovel',
type: 'shovel',
tier: 5,
durability: 1,
stack: 1
}, {
data: 12,
name: 'Steel Shovel',
type: 'shovel',
tier: 6,
durability: 1,
stack: 1
}, {
data: 13,
name: 'Flint Hatchet',
type: 'axe',
tier: 2,
durability: 1,
stack: 1
}, {
data: 14,
name: 'Copper Hatchet',
type: 'axe',
tier: 3,
durability: 1,
stack: 1
}, {
data: 15,
name: 'Bronze Hatchet',
type: 'axe',
tier: 4,
durability: 1,
stack: 1
}, {
data: 16,
name: 'Iron Hatchet',
type: 'axe',
tier: 5,
durability: 1,
stack: 1
}, {
data: 17,
name: 'Steel Axe',
type: 'axe',
tier: 6,
durability: 1,
stack: 1
}, {
data: 18,
name: 'Stick',
fuel: 3
}, {
data: 19,
name: 'Twine'
}, {
data: 20,
name: 'Flint'
}, {
data: 21,
name: 'Mud Brick'
}, {
data: 22,
name: 'Copper Pickaxe Head'
}, {
data: 23,
name: 'Bronze Pickaxe Head'
}, {
data: 24,
name: 'Iron Pickaxe Head'
}, {
data: 25,
name: 'Steel Pickaxe Head'
}, {
data: 26,
name: 'Copper Shovel Head'
}, {
data: 27,
name: 'Bronze Shovel Head'
}, {
data: 28,
name: 'Iron Shovel Head'
}, {
data: 29,
name: 'Steel Shovel Head'
}, {
data: 30,
name: 'Copper Hatchet Head'
}, {
data: 31,
name: 'Bronze Hatchet Head'
}, {
data: 32,
name: 'Iron Hatchet Head'
}, {
data: 33,
name: 'Steel Axe Head'
}, {
data: 34,
name: 'Pickaxe Head Cast',
type: 'pickaxe cast',
tier: 1,
durability: 1,
stack: 1
}, {
data: 35,
name: 'Shovel Head Cast',
type: 'shovel cast',
tier: 1,
durability: 1,
stack: 1
}, {
data: 36,
name: 'Hatchet Head Cast',
type: 'hatchet cast',
tier: 1,
durability: 1,
stack: 1
}, {
data: 37,
name: 'Axe Head Cast',
type: 'axe cast',
tier: 1,
durability: 1,
stack: 1
}, {
data: 38,
name: 'Sword Cast',
type: 'sword cast',
tier: 1,
durability: 1,
stack: 1
}, {
data: 39,
name: 'Ingot Cast',
type: 'ingot cast',
tier: 1,
durability: 1,
stack: 1
}, {
data: 40,
name: 'Bronze Sword',
type: 'sword',
tier: 4,
stack: 1
}, {
data: 41,
name: 'Iron Sword',
type: 'sword',
tier: 5,
stack: 1
}, {
data: 42,
name: 'Steel Sword',
type: 'sword',
tier: 6,
stack: 1
}, {
data: 43,
name: 'Clay Brick'
}, {
data: 44,
name: 'Coal',
fuel: 8
}, {
data: 45,
name: 'Tool Rod',
fuel: 6
}, {
data: 46,
name: 'Twine Fabric'
}, {
data: 47,
name: 'Twine Rope'
}, {
data: 48,
name: 'Bed',
blocks: {
	width: 2,
	height:1,
	data: [JSON.parse(JSON.stringify(assets.blockData[31])),JSON.parse(JSON.stringify(assets.blockData[32]))]
}
}, {
data: 49,
name: 'Lead Ingot'
}, {
data: 50,
name: 'Silver Ingot'
}, {
data: 51,
name: 'Copper Ingot'
}, {
data: 52,
name: 'Tin Ingot'
}, {
data: 53,
name: 'Bronze Ingot'
}, {
data: 54,
name: 'Iron Ingot'
}, {
data: 55,
name: 'Steel Ingot'
}, {
data: 56,
name: 'Gold Ingot'
}, {
data: 57,
name: 'Uranium Ingot'
}, {
data: 58,
name: 'Thorium Ingot'
}, {
data: 59,
name: 'Elm Door',
blocks: {
width: 1,
height:2,
data: [{data:28},{data:27}]
	}
}, {
data: 60,
name: 'M4 Assault Rifle',
type: 'gun',
stack: 1
}, {
data: 61,
name: 'M1 Garand',
type: 'gun',
stack: 1
}, {
data: 62,
name: '1911 Colt',
type: 'gun',
stack: 1
}, {
data: 63,
name: 'Thompson SMG',
type: 'gun',
stack: 1
}, {
data: 64,
name: 'World Destroyer'
}, {
data: 65,
name: 'Bread',
food: 25
}, {
data: 66,
name: 'Hammer',
type: 'hammer',
tier: 1,
durability: 1,
stack: 1
}, {
data: 67,
name: 'Block Cast',
type: 'block cast',
tier: 1,
durability: 1,
stack: 1
}, {
data: 68,
name: 'Ash'
}, {
	data: 69,
	name: 'Paint Brush',
	type: 'brush',
	tier: 1,
	durability: 1,
	stack: 1
}
]
assets.craftingRecipes = [
// Hatchets
{
output: new item('item',{data:13,durability:1},1),
type: 'shaped',
width: 3,
height: 5,
input: [
	null,new item('item',{data:18},1),null,
	new item('item',{data:20},1),new item('item',{data:18},1),new item('item',{data:19},1),
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null
	],
tool: null
}, {
output: new item('item',{data:14,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:30},1),
	new item('item',{data:45},1)
	],
tool: null
}, {
output: new item('item',{data:15,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:31},1),
	new item('item',{data:45},1)
	],
tool: null
}, {
output: new item('item',{data:16,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:32},1),
	new item('item',{data:45},1)
	],
tool: null
}, {
output: new item('item',{data:17,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:33},1),
	new item('item',{data:45},1)
	],
tool: null
},
// Shovels
{
output: new item('item',{data:7,durability:1},1),
type: 'shaped',
width: 3,
height: 5,
input: [
	null,new item('block',{data:5},1),null,
	new item('item',{data:19},1),new item('item',{data:18},1),new item('item',{data:19},1),
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null
	],
tool: null
}, {
output: new item('item',{data:8,durability:1},1),
type: 'shaped',
width: 3,
height: 5,
input: [
	null,new item('block',{data:9},1),null,
	new item('item',{data:19},1),new item('item',{data:18},1),new item('item',{data:19},1),
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null
	],
tool: null
}, {
output: new item('item',{data:9,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:26},1),
	new item('item',{data:45},1)
	],
tool: null
}, {
output: new item('item',{data:10,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:27},1),
	new item('item',{data:45},1)
	],
tool: null
}, {
output: new item('item',{data:11,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:28},1),
	new item('item',{data:45},1)
	],
tool: null
}, {
output: new item('item',{data:12,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:29},1),
	new item('item',{data:45},1)
	],
tool: null
}, 
// Pickaxes
{
output: new item('item',{data:1,durability:1},1),
type: 'shaped',
width: 3,
height: 5,
input: [
	null,new item('item',{data:18},1),null,
	new item('block',{data:5},1),new item('item',{data:18},1),new item('item',{data:19},1),
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null
	],
tool: null
}, {
output: new item('item',{data:2,durability:1},1),
type: 'shaped',
width: 3,
height: 5,
input: [
	null,new item('item',{data:18},1),null,
	new item('block',{data:9},1),new item('item',{data:18},1),new item('item',{data:19},1),
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null
	],
tool: null
}, {
output: new item('item',{data:3,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:22},1),
	new item('item',{data:45},1)
	],
tool: null
}, {
output: new item('item',{data:4,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:23},1),
	new item('item',{data:45},1)
	],
tool: null
}, {
output: new item('item',{data:5,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:24},1),
	new item('item',{data:45},1)
	],
tool: null
}, {
output: new item('item',{data:6,durability:1},1),
type: 'shaped',
width: 1,
height: 2,
input: [
	new item('item',{data:25},1),
	new item('item',{data:45},1)
	],
tool: null
}, 
// Casts
{
output: new item('item',{data:34,durability:1},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), 
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	new item('block',{data:4},1), null, null, null, new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	],
tool: null
}, {
output: new item('item',{data:35,durability:1},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), 
	new item('block',{data:4},1), new item('block',{data:4},1), null, new item('block',{data:4},1), new item('block',{data:4},1),
	new item('block',{data:4},1), null, null, null, new item('block',{data:4},1),
	new item('block',{data:4},1), null, null, null, new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	],
tool: null
}, {
output: new item('item',{data:36,durability:1},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), 
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	new item('block',{data:4},1), null, null, null, new item('block',{data:4},1),
	new item('block',{data:4},1), null, null, new item('block',{data:4},1), new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	],
tool: null
}, {
output: new item('item',{data:37,durability:1},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), 
	new item('block',{data:4},1), null, null, new item('block',{data:4},1), new item('block',{data:4},1),
	new item('block',{data:4},1), null, null, null, new item('block',{data:4},1),
	new item('block',{data:4},1), null, null, new item('block',{data:4},1), new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	],
tool: null
}, {
output: new item('item',{data:38,durability:1},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), 
	new item('block',{data:4},1), null, new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), null, new item('block',{data:4},1), new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), null, new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	],
tool: null
}, {
output: new item('item',{data:39,durability:1},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), 
	new item('block',{data:4},1), null, new item('block',{data:4},1), null, new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	new item('block',{data:4},1), null, new item('block',{data:4},1), null, new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	],
tool: null
}, {
output: new item('item',{data:67,durability:1},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), 
	new item('block',{data:4},1), null, null, null, new item('block',{data:4},1),
	new item('block',{data:4},1), null, null, null, new item('block',{data:4},1),
	new item('block',{data:4},1), null, null, null, new item('block',{data:4},1),
	new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1), new item('block',{data:4},1),
	],
tool: null
},
// Misc. Tools
{
output: new item('item',{data:66,durability:1},1),
type: 'shaped',
width: 3,
height: 5,
input: [
	null,new item('item',{data:19},1),null,
	new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1),
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null,
	null,new item('item',{data:18},1),null
	],
tool: null
},
// Blocks
{
	// Crafting Table
output: new item('block',{data:11,storage:JSON.parse(JSON.stringify(assets.storage['crafting']))},1),
type: 'shapeless',
input: [
	new item('block',{data:5},1)
	],
tool: null
}, {
	// Crafting Table
output: new item('block',{data:11,storage:JSON.parse(JSON.stringify(assets.storage['crafting']))},1),
type: 'shapeless',
input: [
	new item('block',{data:48},1)
	],
tool: null
}, {
	// Hammering Bench
output: new item('block',{data:57,storage:JSON.parse(JSON.stringify(assets.storage['hammering']))},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:9},1),new item('block',{data:9},1),new item('block',{data:9},1),new item('block',{data:9},1),new item('block',{data:9},1),
	new item('block',{data:9},1),new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:9},1),
	new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1),
	new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1),
	new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1),new item('block',{data:5},1)
	],
tool: null
}, {
	// Mud Furnace
output: new item('block',{data:14, storage:JSON.parse(JSON.stringify(assets.storage['furnace']))},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:13},1),new item('block',{data:13},1),new item('block',{data:13},1),new item('block',{data:13},1),new item('block',{data:13},1),
	new item('block',{data:13},1), null, null, null,new item('block',{data:13},1),
	new item('block',{data:13},1), null, null, null,new item('block',{data:13},1),
	new item('block',{data:13},1), null, null, null,new item('block',{data:13},1),
	new item('block',{data:13},1),new item('block',{data:13},1),new item('block',{data:13},1),new item('block',{data:13},1),new item('block',{data:13},1),
	],
tool: null
}, {
	// Elm Planks
output: new item('block',{data:7},4),
type: 'shapeless',
input: [
	new item('block',{data:5},1)
	],
tool: 'axe'
}, {
	// Pine Planks
output: new item('block',{data:50},4),
type: 'shapeless',
input: [
	new item('block',{data:48},1)
	],
tool: 'axe'
}, {
	// Mud Bricks
output: new item('block',{data:13},1),
type: 'shaped',
width: 2,
height: 2,
input: [
	new item('item',{data:21},1), new item('item',{data:21},1),
	new item('item',{data:21},1), new item('item',{data:21},1)
	],
tool: null
}, {
	// Bricks
output: new item('block',{data:24},2),
type: 'shaped',
width: 2,
height: 2,
input: [
	new item('item',{data:43},1), new item('item',{data:43},1),
	new item('item',{data:43},1), new item('item',{data:43},1)
	],
tool: null
}, {
	// Brick Furnace
output: new item('block',{data:25},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:24},1), new item('block',{data:24},1), new item('block',{data:24},1), new item('block',{data:24},1), new item('block',{data:24},1),
	new item('block',{data:24},1), null, null, null, new item('block',{data:24},1),
	new item('block',{data:24},1), null, null, null, new item('block',{data:24},1),
	new item('block',{data:24},1), null, null, null, new item('block',{data:24},1),
	new item('block',{data:24},1), new item('block',{data:24},1), new item('block',{data:24},1), new item('block',{data:24},1), new item('block',{data:24},1)
	],
tool: null
}, {
	// Chest
output: new item('block',{data:10, storage: JSON.parse(JSON.stringify(assets.storage['chest']))},1),
type: 'shaped',
width: 5,
height: 5,
input: [
	new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1),
	new item('block',{data:7},1), null, null, null, new item('block',{data:7},1),
	new item('block',{data:7},1), null, null, null, new item('block',{data:7},1),
	new item('block',{data:7},1), null, null, null, new item('block',{data:7},1),
	new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1)
	],
tool: null
}, {
	// Stone Tile
output: new item('block',{data:8},1),
type: 'shapeless',
input: [
	new item('block',{data:1},1)
	],
tool: 'pickaxe'
}, {
	// Ladder
output: new item('block',{data:35},1),
type: 'shaped',
width: 3,
height: 5,
input: [
	new item('item',{data:18},1), null, new item('item',{data:18},1),
	new item('item',{data:18},1), new item('item',{data:18},1), new item('item',{data:18},1),
	new item('item',{data:18},1), null, new item('item',{data:18},1),
	new item('item',{data:18},1), new item('item',{data:18},1), new item('item',{data:18},1),
	new item('item',{data:18},1), null, new item('item',{data:18},1)
	],
tool: null
}, {
	// Rope Ladder
output: new item('block',{data:36},1),
type: 'shaped',
width: 3,
height: 5,
input: [
	new item('item',{data:47},1), null, new item('item',{data:47},1),
	new item('item',{data:47},1), new item('item',{data:18},1), new item('item',{data:47},1),
	new item('item',{data:47},1), null, new item('item',{data:47},1),
	new item('item',{data:47},1), new item('item',{data:18},1), new item('item',{data:47},1),
	new item('item',{data:47},1), null, new item('item',{data:47},1)
	],
tool: null
},
// Items
{
	// Colour
output: 'color',
type: 'property',
input: 'block',
tool: 'brush'
}, {
	// Stick
output: new item('item',{data:18},2),
type: 'shapeless',
input: [
	new item('block',{data:7},1)
	],
tool: 'axe'
}, {
	// Stick
output: new item('item',{data:18},2),
type: 'shapeless',
input: [
	new item('block',{data:50},1)
	],
tool: 'axe'
}, {
	// Mud Brick
output: new item('item',{data:21},4),
type: 'shapeless',
input: [
	new item('block',{data:2},1),
	new item('block',{data:4},1)
	],
tool: null
}, {
	// Tool Rod
output: new item('item',{data:45},1),
type: 'shaped',
width: 1,
height: 5,
input: [
	new item('item',{data:18},1), new item('item',{data:18},1), new item('item',{data:18},1), new item('item',{data:18},1), new item('item',{data:18},1)
	],
tool: null
}, {
	// Twine
output: new item('item',{data:19},1),
type: 'shapeless',
input: [
	new item('item',{data:18},1)
	],
tool: 'axe'
}, {
	// Twine Fabric
output: new item('item',{data:46},1),
type: 'shaped',
width:2,
height:2,
input:[
	new item('item',{data:19},1), new item('item',{data:19},1),
	new item('item',{data:19},1), new item('item',{data:19},1),
	],
tool: null
}, {
	// Twine Rope
output: new item('item',{data: 47},2),
type: 'shaped',
width: 1,
height: 5,
input: [
	new item('item',{data:19},1), new item('item',{data:19},1), new item('item',{data:19},1), new item('item',{data:19},1), new item('item',{data:19},1)
	],
tool: null
}, {
	// Bed
output: new item('item',{data:48},1),
type: 'shaped',
width: 5,
height: 3,
input: [
	new item('item',{data:46},1), new item('item',{data:46},1), new item('item',{data:46},1), new item('item',{data:46},1), new item('item',{data:46},1),
	new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1),
	new item('item',{data:18},1), null, null, null, new item('item',{data:18},1)
	]
}, {
	// Elm Door
output: new item('item',{data:59,blocks: {
width: 1,
height:2,
data: [{data:28},{data:27}]
		}},2),
type: 'shaped',
width: 3,
height: 5,
input: [
	new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1),
	new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1),
	new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1),
	new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1),
	new item('block',{data:7},1), new item('block',{data:7},1), new item('block',{data:7},1)
	]
}
]
assets.smeltingRecipes = [
// Hatchets
{
output: new item('item',{data:30},1),
slag: null,
tier: 1,
input: [new item('item',{data:51},4)],
cast: 'hatchet cast',
time: 6
}, {
output: new item('item',{data:31},1),
slag: null,
tier: 1,
input: [new item('item',{data:53},3)],
cast: 'hatchet cast',
time: 8
}, {
output: new item('item',{data:32},1),
slag: null,
tier: 1,
input: [new item('item',{data:54},4)],
cast: 'hatchet cast',
time: 10
}, {
output: new item('item',{data:33},1),
slag: null,
tier: 1,
input: [new item('item',{data:55},3)],
cast: 'axe cast',
time: 12
},
// Shovels
{
output: new item('item',{data:26},1),
slag: null,
tier: 1,
input: [new item('item',{data:51},4)],
cast: 'shovel cast',
time: 6
}, {
output: new item('item',{data:27},1),
slag: null,
tier: 1,
input: [new item('item',{data:53},3)],
cast: 'shovel cast',
time: 8
}, {
output: new item('item',{data:28},1),
slag: null,
tier: 1,
input: [new item('item',{data:54},4)],
cast: 'shovel cast',
time: 10
}, {
output: new item('item',{data:29},1),
slag: null,
tier: 1,
input: [new item('item',{data:55})],
cast: 'shovel cast',
time: 12
},
// Pickaxes
{
output: new item('item',{data:22},1),
slag: null,
tier: 1,
input: [new item('item',{data:51},4)],
cast: 'pickaxe cast',
time: 6
}, {
output: new item('item',{data:23},1),
slag: null,
tier: 1,
input: [new item('item',{data:53},3)],
cast: 'pickaxe cast',
time: 8
}, {
output: new item('item',{data:24},1),
slag: null,
tier: 1,
input: [new item('item',{data:54},4)],
cast: 'pickaxe cast',
time: 10
}, {
output: new item('item',{data:25},1),
slag: null,
tier: 1,
input: [new item('item',{data:55},3)],
cast: 'pickaxe cast',
time: 12
},
// Swords
{
output: new item('item',{data:40},1),
slag: null,
tier: 1,
input: [new item('item',{data:53},3)],
cast: 'sword cast',
time: 8
}, {
output: new item('item',{data:41},1),
slag: null,
tier: 1,
input: [new item('item',{data:54},4)],
cast: 'sword cast',
time: 10
}, {
output: new item('item',{data:42},1),
slag: null,
tier: 1,
input: [new item('item',{data:55},3)],
cast: 'sword cast',
time: 12
},
// Misc. Tools
// Items
{
output: new item('item',{data:43},4),
slag: new item('item',{data:68},4),
tier: 1,
input: [new item('block',{data:12},4)],
cast: 'ingot cast',
time: 6
},
// Blocks
{
output: new item('block',{data:1},1),
slag: new item('item',{data:68},1),
tier: 1,
input: [new item('block',{data:9},1)],
cast: 'block cast',
time: 4
}, {
output: new item('block',{data:26},1),
slag: new item('item',{data:68},1),
tier: 1,
input: [new item('block',{data:4},1)],
cast: 'block cast',
time: 4
},
// Ingots
{
output: new item('item',{data:49},4),
slag: new item('block',{data:1},3),
tier: 1,
input: [new item('block',{data:33},4)],
cast: 'ingot cast',
time: 10
}, {
output: new item('item',{data:50},4),
slag: new item('block',{data:1},3),
tier: 1,
input: [new item('block',{data:34},4)],
cast: 'ingot cast',
time: 10
}, {
output: new item('item',{data:51},4),
slag: new item('block',{data:1},3),
tier: 1,
input: [new item('block',{data:15},4)],
cast: 'ingot cast',
time: 6
}, {
output: new item('item',{data:52},4),
slag: new item('block',{data:1},3),
tier: 1,
input: [new item('block',{data:16},4)],
cast: 'ingot cast',
time: 6
}, {
output: new item('item',{data:53},4),
slag: new item('block',{data:1},3),
tier: 1,
input: [new item('block',{data:15},3),new item('block',{data:16},1)],
cast: 'ingot cast',
time: 8
}, {
output: new item('item',{data:54},4),
slag: new item('block',{data:1},3),
tier: 1,
input: [new item('block',{data:17},4)],
cast: 'ingot cast',
time: 10
}, {
output: new item('item',{data:55},4),
slag: new item('block',{data:1},3),
tier: 1,
input: [new item('block',{data:17},3), new item('item',{data:44},1)],
cast: 'ingot cast',
time: 12
}, {
output: new item('item',{data:56},4),
slag: new item('block',{data:1},3),
tier: 1,
input: [new item('block',{data:18},4)],
cast: 'ingot cast',
time: 8
}, {
output: new item('item',{data:57},4),
slag: new item('block',{data:1},3),
tier: 1,
input: [new item('block',{data:20},4)],
cast: 'ingot cast',
time: 12
}, {
output: new item('item',{data:58},4),
slag: new item('block',{data:1},3),
tier: 1,
input: [new item('block',{data:21},4)],
cast: 'ingot cast',
time: 10
}
]
// blobs of blocks that spawn in the world
assets.veins = [
{ data: {data:15}, minVeins: 40, maxVeins: 80, minY: 96, maxY: 160, width: 6, height: 3 },
{ data: {data:16}, minVeins: 40, maxVeins: 70, minY: 128, maxY: 192, width: 6, height: 3 },
{ data: {data:17}, minVeins: 40, maxVeins: 70, minY: 128, maxY: 256, width: 6, height: 3 },
{ data: {data:18}, minVeins: 3, maxVeins: 6, minY: 64, maxY: 80, width: 4, height: 10 },
{ data: {data:18}, minVeins: 3, maxVeins: 6, minY: 184, maxY: 200, width: 2, height: 10 },
{ data: {data:19}, minVeins: 40, maxVeins: 60, minY: 96, maxY: 160, width: 20, height: 2.5 },
{ data: {data:20}, minVeins: 5, maxVeins: 7, minY: 192, maxY: 256, width: 4, height: 4 },
{ data: {data:21}, minVeins: 20, maxVeins: 70, minY: 128, maxY: 256, width: 6, height: 4 },
{ data: {data:4}, minVeins: 70, maxVeins: 90, minY: 100, maxY: 192, width: 10, height: 6 },
{ data: {data:23}, minVeins: 70, maxVeins: 90, minY: 100, maxY: 192, width: 10, height: 6 },
{ data: {data:12}, minVeins: 40, maxVeins: 60, minY: 100, maxY: 192, width: 10, height: 6 },
{ data: {data:33}, minVeins: 10, maxVeins: 20, minY: 160, maxY: 256, width: 6, height: 3 },
{ data: {data:34}, minVeins: 10, maxVeins: 20, minY: 160, maxY: 256, width: 6, height: 3 },
{ data: {data:53}, minVeins: 5, maxVeins: 10, minY: 0, maxY: 30, width: 12, height: 5 }
];
assets.trees = [
{ log: {data:5}, leaves: {data:6}, minY: 110, maxY: 148, minHeight:5, maxHeight:15, widthRatio: 0.6, leafRatio: 0.7},
{ log: {data:48}, leaves: {data:49}, minY: 30, maxY: 110, minHeight:11, maxHeight:18, widthRatio: 0.4, leafRatio: 0.6}
];
assets.caveData = {
minCaves: 0,
maxCaves: 2,
maxDeflection: Math.PI/2,
segmentLength: 7,
minLength: 80,
maxLength: 130,
minRadius: 1.5,
maxRadius: 3
}
// collision models
assets.collision = {
	'none': [{x: -0.5, y: -0.5, width: 1, height: 1}],
	'full': [{x: -0.5, y: -0.5, width: 1, height: 1}],
	'door': [{x: 0.25, y: -0.5, width: 0.25, height: 1 }],
	'player': [{x: -0.1875,y: -0.75,width: 0.375,height:1.75}],
	'drop': [{x: -0.25, y: -0.25, width: 0.5, height: 0.5}],
	'giant': [{x: -1.5, y: -1.5, width: 3, height: 3}],
	// building models
	'stairs': [
	{x: -0.5, y: -0.5, width: 0.25, height: 1 },
	{x: -0.25, y: -0.25, width: 0.25, height: 0.75 },
	{x: 0, y: 0, width: 0.25, height: 0.5 },
	{x: 0.25, y: 0.25, width: 0.25, height: 0.25 }
	],
	'0.125_slab': [{x:-0.5,y:0.375,width:1,height:0.125}],
	'0.25_slab': [{x:-0.5,y:0.25,width:1,height:0.25}],
	'0.375_slab': [{x:-0.5,y:0.125,width:1,height:0.375}],
	'0.5_slab': [{x:-0.5,y:0,width:1,height:0.5}],
	'0.625_slab':[{x:-0.5,y:-0.125,width:1,height:0.625}],
	'0.75_slab': [{x:-0.5,y:-0.25,width:1,height:0.75}],
	'0.875_slab': [{x:-0.5,y:-0.375,width:1,height:0.875}],
	'0.25_wall': [{x:-0.125,y:-0.5,width:0.25,height: 1}],
	'0.5_wall': [{x:-0.25,y:-0.5,width:0.5,height: 1}],
	'0.75_wall': [{x:-0.375,y:-0.5,width:0.75,height: 1}],
	'0.125_corner': [{x:-0.5,y:0.375,width:0.125,height:0.125}],
	'0.25_corner': [{x:-0.5,y:0.25,width:0.25,height:0.25}],
	'0.375_corner': [{x:-0.5,y:0.125,width:0.375,height:0.375}],
	'0.5_corner': [{x:-0.5,y:0,width:0.5,height:0.5}],
	'0.625_corner':[{x:-0.5,y:-0.125,width:0.625,height:0.625}],
	'0.75_corner': [{x:-0.5,y:-0.25,width:0.75,height:0.75}],
	'0.875_corner': [{x:-0.5,y:-0.375,width:0.875,height:0.875}],
	'round': [
	{x:-0.5,y:-0.25,width:0.125,height:0.5},
	{x:-0.375,y:-0.375,width:0.125,height:0.75},
	{x:-0.25,y:-0.5,width:0.5,height:1},
	{x:0.25,y:-0.375,width:0.125,height:0.75},
	{x:0.375,y:-0.25,width:0.125,height:0.5}
	]
}
// ocean level
assets.water = 150
// max stack count
assets.stack = 128
assets.terminalVel = 54
assets.gravity = 20
assets.fontIndex = [' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z','_','-',':',';','.',',','(',')','','?','/','\\','!','@','#','$','%','^','&','*','"',"'",'{','}','|','=','+',
'~','`','?','[',']','<','>']
assets.structures = {
labyrinth: {
spawnProbability: 50,
roomProbability: 50,
gridWidth: 11,
gridHeight: 11,
rooms: {
minHeight: 7,
maxHeight: 9,
minWidth: 7,
maxWidth: 9,
backLayer: 9,
wall: 60,
corner: 61
		}
	}
}
assets.chestLoot = [
// Ingots
{type:'item',data:{data:49},min:1,max:40,probability:30},
{type:'item',data:{data:50},min:1,max:20,probability:10},
{type:'item',data:{data:51},min:1,max:40,probability:40},
{type:'item',data:{data:52},min:1,max:40,probability:40},
{type:'item',data:{data:53},min:1,max:30,probability:30},
{type:'item',data:{data:54},min:1,max:40,probability:30},
{type:'item',data:{data:55},min:1,max:20,probability:10},
{type:'item',data:{data:56},min:1,max:20,probability:10},
{type:'item',data:{data:57},min:1,max:20,probability:10},
{type:'item',data:{data:58},min:1,max:40,probability:20},
{type:'item',data:{data:65},min:1,max:20,probability:60},
// Tool Heads
{type:'item',data:{data:22},min:1,max:1,probability:20},
{type:'item',data:{data:23},min:1,max:1,probability:15},
{type:'item',data:{data:24},min:1,max:1,probability:10},
{type:'item',data:{data:25},min:1,max:1,probability:5},
{type:'item',data:{data:26},min:1,max:1,probability:20},
{type:'item',data:{data:27},min:1,max:1,probability:15},
{type:'item',data:{data:28},min:1,max:1,probability:10},
{type:'item',data:{data:29},min:1,max:1,probability:5},
{type:'item',data:{data:30},min:1,max:1,probability:20},
{type:'item',data:{data:31},min:1,max:1,probability:15},
{type:'item',data:{data:32},min:1,max:1,probability:10},
{type:'item',data:{data:33},min:1,max:1,probability:5}
];
assets.audio = {
	mining_stone: [
	new Audio()
	],
	mining_wood: [
	new Audio(),
	new Audio(),
	new Audio()
	],
	mining_dirt: [
	new Audio(),
	new Audio(),
	new Audio(),
	new Audio()
	],
	mining_metal: [
	new Audio()
	],
	mining_general: [
	new Audio()
	],
	step_stone: [
	new Audio(),
	new Audio(),
	new Audio(),
	new Audio(),
	new Audio(),
	new Audio()
	],
	falling: [
	new Audio(),
	new Audio(),
	new Audio(),
	new Audio()
	]
}
// textures
assets.blockSheet.src = 'textures/blocks/block_sheet.png';
assets.itemSheet.src = 'textures/items/item_sheet.png';
assets.screenSheet.src = 'textures/screens.png';
assets.font.src = 'textures/font.png';
assets.gui.src = 'textures/interface.png';
assets.parallax.src = 'textures/parallax.png';
assets.sun.src = 'textures/sun.png';
client.menu = assets.menu['titlescreen'];
// default colors
assets.colors = [
{r:221,g:221,b:221,a:0.5}, //White
{r:219,g:125,b:  62,a:0.5}, //Orange
{r:179,g:  80,b:188,a:0.5}, //Magenta
{r:107,g:138,b:201,a:0.5}, //Light Blue
{r:177,g:166,b:  39,a:0.5}, //Yellow
{r:  65,g:174,b:  56,a:0.5}, //Lime
{r:208,g:132,b:153,a:0.5}, //Pink
{r:  64,g:  64,b:  64,a:0.5}, //Gray
{r:154,g:161,b:161,a:0.5}, //Light Gray
{r:  46,g:110,b:137,a:0.5}, //Cyan
{r:126,g:  61,b:181,a:0.5}, //Purple
{r:  46,g:  56,b:141,a:0.5}, //Blue
{r:  79,g:  50,b:  31,a:0.5}, //Brown
{r:  53,g:  70,b:  27,a:0.5}, //Green
{r:150,g:  52,b:  48,a:0.5}, //Red
{r:  25,g:  22,b:  22,a:0.5}  //Black
]
// audio
for (var group in assets.audio) {
	assets.audio[group].forEach(function (sound, index) {
		assets.audio[group][index].src = 'audio/'+group+index+'.wav';
	});
}
// entities
assets.sprites.player.src = 'textures/entities/player.png';
assets.sprites.zombie.src = 'textures/entities/zombie.png';
assets.sprites.skeleton.src = 'textures/entities/skeleton.png';
assets.sprites.jaffa.src = 'textures/entities/jaffa.png';