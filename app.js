import {
	checkIfFileExists,
	getInputData,
	getConfigs,
	getFee
} from './functions.js';

const INPUT_FILE = process.argv[2];

if (!checkIfFileExists(INPUT_FILE)) {
	console.log(`${INPUT_FILE} was not found`);
	process.exit();
}

Promise.all([getInputData(INPUT_FILE), getConfigs()]).then((values) => {
	values.forEach((val) => {
		if (typeof val === 'string') {
			console.log(`${val} was not found or is incorrect`);
			process.exit();
		}
	});

	const { configs } = values.filter((val) => val.configs !== undefined)[0];

	values[0].forEach((data) => {
		console.log(getFee(data, configs));
	});
});
