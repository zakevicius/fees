import fs from 'fs';
import axios from 'axios';
import util from 'util';
import User from './User';

const readFile = util.promisify(fs.readFile);

let CASH_IN_CONFIG, CASH_OUT_NATURAL_CONFIG, CASH_OUT_LEGAL_CONFIG;
const [CASH_IN, CASH_OUT, NATURAL, LEGAL] = [
	'cash_in',
	'cash_out',
	'natural',
	'juridical'
];

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
export async function getCashInConfig() {
	try {
		const res = await axios.get(
			'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in'
		);
		CASH_IN_CONFIG = res.data;
		return res.data;
	} catch (err) {
		return 'CASH_IN_CONFIG';
	}
}

export async function getCashOutNaturalConfig() {
	try {
		const res = await axios.get(
			'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural'
		);
		CASH_OUT_NATURAL_CONFIG = res.data;
		return res.data;
	} catch (err) {
		return 'CASH_OUT_NATURAL_CONFIG';
	}
}

export async function getCashOutLegalConfig() {
	try {
		const res = await axios.get(
			'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical'
		);
		CASH_OUT_LEGAL_CONFIG = res.data;
		return res.data;
	} catch (err) {
		return 'CASH_OUT_LEGAL_CONFIG';
	}
}

// Initiliazing temp users 'database'
const users = [];

// Counting fees
export function getFee(data) {
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
		user = new User(user_id, user_type, new Date(date));
		users.push(user);
	}

	const fee = countFee(user_type, type, amount, date, user);

	return fee;
}

// Counting fee based on operation and user type
function countFee(user_type, type, amount, date, user) {
	switch (type) {
		case CASH_IN:
			const {
				percents: p,
				max: { amount: maxAmount }
			} = CASH_IN_CONFIG;
			return Math.min(Math.ceil(amount * p) / 100, maxAmount).toFixed(2);
		case CASH_OUT:
			switch (user_type) {
				case NATURAL: {
					const { percents: p_N } = CASH_OUT_NATURAL_CONFIG;
					const limitLeft = user.recalculateLimit(amount, new Date(date));
					return (
						Math.ceil(Math.max(amount - limitLeft, 0) * p_N) / 100
					).toFixed(2);
				}
				case LEGAL: {
					const {
						percents: p_L,
						min: { amount: minAmount }
					} = CASH_OUT_LEGAL_CONFIG;
					return Math.max(Math.ceil(amount * p_L) / 100, minAmount).toFixed(2);
				}
				default: {
					process.stdout.write(`Unsupported user type: ${user_type}`);
				}
			}
			break;
		default:
			process.stdout.write(`Unsupported operation type: ${type}`);
	}
}

export function isValidDate(date) {
	const DATE_FORMAT = /^\d{4}\W\d{2}\W\d{2}$/; // YYYY-MM-DD
	return date.match(DATE_FORMAT);
}
