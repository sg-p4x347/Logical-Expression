var Config = {
	// global
	cityCount: 10,
	// population movements
	shuffleChancePerHour: 0.3,
	// city
	maxPopulation: 20,
	minMayorAge: 30,
	minSheriffAge: 30,
	// families
	children: 5,
	marryMinAge: 20,
	marryAgeRange: 10,
	seedFamilies: 10,
	// People
	professions: [
	{data: 'banker', probability: 0.05},
	{data: 'doctor', probability: 0.07},
	{data: 'clergy', probability: 0.1},
	{data: 'blacksmith', probability: 0.1},
	{data: 'salesman', probability: 0.1},
	{data: 'carpenter', probability: 0.1},
	{data: 'warrior', probability: 0.2},
	{data: 'farmer',probability: 0.4},
	],
	oldest: 80,
	gender: [
	{data: 'male', probability: 0.5},
	{data: 'female', probability: 0.5},
	],
	// Buildings
	/* descriptions are chosen from the array of possible descriptions */
	'home':  {
		name: ['residence', 'home', 'household', 'farm'],
		firstRoom: [
		{data: {name: 'foyer', description: ['In front and around you are doorways leading to different rooms.']}, probability: 0.5},
		{data: {name: 'hallway', description: ['On both sides there are doorways leading to different rooms.']}, probability: 0.4},
		],
		rooms: {
			'living room': {description: ['The room is full of softly padded furnature with a central fireplace.']},
			'dining room': {description: ['The dining set is very large, consisting of 8 chairs and a neatly prepared table.']},
			'kitchen': {description: ['There is a large hearth and water basin in front of you.']},
			'bedroom': {description: ['The bed is neatly made, with only a few clothes scattered about the room and on the dresser.',
			'The bed is very messy, and trash litters the ground in some areas.']},
			'master bedroom': {description: ['The bed is neatly made, with only a few clothes scattered about the room and on the dresser.',
			'The room is quite large, accomidating the parents of the household.']},
		},
		description: []
	},
	'court house': {
		name: ['court house'],
		firstRoom: [{data: {name: 'lobby', description: [
		'The room is decorated with intricate landscape paintings.',
		'The room has several windows that keep the room lighted in the daytime.',
		'There are some potted plants on tables next to the main exits of the room.',
		'The doorways and walls are decorated with a very lavish dark trim and wallpaper.'
		]}, probability: 1}],
		rooms: {
			"mayor's office": {description: ['The room is full of softly padded furnature and a sturdy looking desk.']},
			"sheriff's office": {description: ['The room is decorated with numerous awards and newspaper articles.']},
		}
	},
	'banker': {
		name: ['banking', 'bank', 'financial', 'finance'],
		firstRoom: [{data: {name: 'bank interior', description: ['The front desk is made of polished white marble. <br>There are potted plants decorating the otherwise sparse interior']}, probability: 1}],
		rooms: {
		}
	},
	'doctor': {
		name: ['doctor', 'medical', 'hospital', 'clinic'],
		firstRoom: [{data: {name: 'lobby', description: [
		'The room is decorated with intricate landscape paintings.',
		'The room has several windows that keep the room lighted in the daytime.',
		'There are some potted plants on tables next to the main exits of the room.',
		'The doorways and walls are decorated with a very lavish dark trim and wallpaper.'
		]}, probability: 1}],
		rooms: {
		}
	},
	'clergy': {
		name: ['Church of the Second Coming', 'Spoken Gospel Church', 'First United Church', 'Second United Church', 'Third United Church','Church of Truth','Church of Faith','Church of Science'],
		firstRoom: [{data: {name: 'nave', description: ['There are about 10 rows of benches, each with intricatly carved patterns in the wood. <br>At the back, a podium holds a bible and some notes.']}, probability: 1}],
		rooms: {
		}
	},
	'blacksmith': {
		name: ['Metal Works', 'Smithing', 'Hot Iron'],
		firstRoom: [{data: {name: 'smithing shop', description: ['Several large wood and metal tables litter the nearly 15,000 square foot room. <br>There are numerous metal fragments that have been charred from the intensity of the forge.']}, probability: 1}],
		rooms: {
		}
	},
	'salesman': {
		name: ['General Store','Goods','Supplies','Farm and Home Supply','General Goods'],
		firstRoom: [{data: {name: 'store interior', description: ['Many shelves showcase the assorted goods that can be bought. The wooden front desk is about 20 feet long and 3 feet wide.']}, probability: 1}],
		rooms: {
		}
	},
	'carpenter': {
		name: ['Carpentry','Woodworking','Saw and Hammer','Lumber Supply'],
		firstRoom: [{data: {name: 'woodworking shop', description: ['lobby description']}, probability: 1}],
		rooms: {
		}
	}
}