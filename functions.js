import fs from 'fs';
import axios from 'axios';
import util from 'util';
import User from './User';

const readFile = util.promisify(fs.readFile);

const [CASH_IN, CASH_OUT, NATURAL, LEGAL] = [
	'cash_in',
	'cash_out',
	'natural',
	'juridical'
];
const MAX_LIMIT_NATURAL = 1000;
const MAX_LIMIT_LEGAL = 0;

// Check if file exists and user is allowed to access content
export function checkIfFileExists(fileName) {
	try {
		fs.accessSync(fileName, fs.constants.F_OK | fs.constants.R_OK);
		return true;
	} catch {
		return false;
	}
}

// Reading file data
export async function getInputData(fileName) {
	try {
		const data = JSON.parse(await readFile(fileName, { encoding: 'utf8' }));
		return data;
	} catch (err) {
		return 'INPUT_DATA';
	}
}

// Getting configurations for operations
async function getCashInConfig() {
	try {
		const res = await axios.get(
			'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in'
		);
		return { type: CASH_IN, userType: '', config: res.data };
	} catch (err) {
		return 'CASH_IN_CONFIG';
	}
}

async function getCashOutNaturalConfig() {
	try {
		const res = await axios.get(
			'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural'
		);
		return { type: CASH_OUT, userType: NATURAL, config: res.data };
	} catch (err) {
		return 'CASH_OUT_NATURAL_CONFIG';
	}
}

async function getCashOutLegalConfig() {
	try {
		const res = await axios.get(
			'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical'
		);
		return { type: CASH_OUT, userType: LEGAL, config: res.data };
	} catch (err) {
		return 'CASH_OUT_LEGAL_CONFIG';
	}
}

export function getConfigs() {
	return Promise.all([
		getCashInConfig(),
		getCashOutNaturalConfig(),
		getCashOutLegalConfig()
	]).then((values) => {
		values.forEach((val) => {
			if (typeof val === 'string') {
				console.log(`${val} was not found or is incorrect`);
				process.exit();
			}
		});

		const natural = values.filter(
			(val) => val.type === 'cash_out' && val.userType === 'natural'
		)[0].config;

		const juridical = values.filter(
			(val) => val.type === 'cash_out' && val.userType === 'juridical'
		)[0].config;

		const cashIn = values.filter((val) => val.type === 'cash_in')[0].config;

		const configs = {
			cashIn,
			cashOut: { natural, juridical }
		};

		return { configs };
	});
}

// Initiliazing temp users 'database'
const users = [];

// Counting fees
export function getFee(data, configs) {
	const {
		date,
		user_type,
		type,
		user_id,
		operation: { amount }
	} = data;

	// Check if client already exists. If not, create a new one.
	let user = users.filter((user) => user.id === user_id)[0];

	if (!user) {
		const maxLimit =
			user_type === NATURAL ? MAX_LIMIT_NATURAL : MAX_LIMIT_LEGAL;
		user = new User(user_id, user_type, new Date(date), maxLimit);
		users.push(user);
	}

	const fee = countFee(user_type, type, amount, date, user, configs);

	return fee;
}

// Counting fee based on operation and user type
function countFee(user_type, type, amount, date, user, configs) {
	const {
		cashIn,
		cashOut: { natural, juridical }
	} = configs;

	switch (type) {
		case CASH_IN:
			const {
				percents: p,
				max: { amount: maxAmount }
			} = cashIn;
			return calculate(amount, p, 'min', maxAmount);
		case CASH_OUT:
			switch (user_type) {
				case NATURAL: {
					const { percents: p_N } = natural;
					const limitLeft = user.recalculateLimit(amount, new Date(date));

					return amount - limitLeft <= 0
						? '0.00'
						: calculate(amount - limitLeft, p_N);
				}
				case LEGAL: {
					const {
						percents: p_L,
						min: { amount: minAmount }
					} = juridical;
					return calculate(amount, p_L, 'max', minAmount);
				}
				default: {
					console.log(`Unsupported user type: ${user_type}`);
				}
			}
			break;
		default:
			console.log(`Unsupported operation type: ${type}`);
	}
}

export function isValidDate(date) {
	const DATE_FORMAT = /^\d{4}\W\d{2}\W\d{2}$/; // YYYY-MM-DD
	return date.match(DATE_FORMAT);
}

export function calculate(amount, p, minOrMax, minMaxValue) {
	let fee = Math.ceil(amount * p) / 100;

	if (minOrMax !== undefined && minMaxValue !== undefined) {
		switch (minOrMax) {
			case 'min': {
				fee = Math.min(fee, minMaxValue);
				break;
			}
			case 'max': {
				fee = Math.max(fee, minMaxValue);
				break;
			}
			default: {
				console.log(`Unregognized min or max value: ${minOrMax}.`);
			}
		}
	}
	return fee.toFixed(2);
}
