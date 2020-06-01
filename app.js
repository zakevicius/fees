import {
	checkIfFileExists,
	getInputData,
	getCashInConfig,
	getCashOutNaturalConfig,
	getCashOutLegalConfig,
	getFee
} from './functions.js';

const INPUT_FILE = process.argv[2];
let INPUT_DATA;

if (!checkIfFileExists(INPUT_FILE)) {
	process.stdout.write(`${INPUT_FILE} was not found`);
	process.exit();
}

Promise.all([
	getInputData(INPUT_FILE),
	getCashInConfig(),
	getCashOutNaturalConfig(),
	getCashOutLegalConfig()
]).then((values) => {
	values.forEach((val) => {
		if (typeof val === 'string') {
			process.stdout.write(`${val} was not found or is incorrect`);
			process.exit();
		}
	});

	INPUT_DATA = values[0];

	INPUT_DATA.forEach((data) => {
		process.stdout.write(getFee(data) + '\n');
	});
});
