import {
	getCashInConfig,
	getCashOutNaturalConfig,
	getCashOutLegalConfig,
	checkIfFileExists,
	getInputData,
	isValidDate,
	getFee
} from './functions';

describe('Checking configs', () => {
	describe('Checking CASH_IN_CONFIG', () => {
		test('Check if CASH_IN_CONFIG exists', async () => {
			expect.assertions(1);
			expect(await getCashInConfig()).toBeTruthy();
		});

		test('Check if CASH_IN_CONFIG contains required properties', async () => {
			expect.assertions(3);
			const CASH_IN_CONFIG = await getCashInConfig();
			expect(CASH_IN_CONFIG).toHaveProperty('percents');
			expect(CASH_IN_CONFIG).toHaveProperty('max.amount');
			expect(CASH_IN_CONFIG).toHaveProperty('max.currency');
		});
	});

	describe('Checking CASH_OUT_NATURAL_CONFIG', () => {
		test('Check if CASH_OUT_NATURAL_CONFIG exists', async () => {
			expect.assertions(1);
			expect(await getCashOutNaturalConfig()).toBeTruthy();
		});

		test('Check if CASH_OUT_NATURAL_CONFIG contains required properties', async () => {
			expect.assertions(3);
			const CASH_OUT_NATURAL_CONFIG = await getCashOutNaturalConfig();
			expect(CASH_OUT_NATURAL_CONFIG).toHaveProperty('percents');
			expect(CASH_OUT_NATURAL_CONFIG).toHaveProperty('week_limit.amount');
			expect(CASH_OUT_NATURAL_CONFIG).toHaveProperty('week_limit.currency');
		});
	});

	describe('Checking CASH_OUT_LEGAL_CONFIG', () => {
		test('Check if CASH_OUT_LEGAL_CONFIG exists', async () => {
			expect.assertions(1);
			expect(await getCashOutLegalConfig()).toBeTruthy();
		});

		test('Check if CASH_OUT_LEGAL_CONFIG contains required properties', async () => {
			expect.assertions(3);
			const CASH_OUT_LEGAL_CONFIG = await getCashOutLegalConfig();
			expect(CASH_OUT_LEGAL_CONFIG).toHaveProperty('percents');
			expect(CASH_OUT_LEGAL_CONFIG).toHaveProperty('min.amount');
			expect(CASH_OUT_LEGAL_CONFIG).toHaveProperty('min.currency');
		});
	});
});

describe('Checking INPUT_DATA', () => {
	test('Check if file exists', () => {
		expect(checkIfFileExists('input.json')).toBeTruthy();
	});

	test('Check INPUT_DATA contains all required fields', async () => {
		// expect.assertions(1);
		const data = await getInputData('input.json');
		data.forEach((el) => {
			expect(isValidDate(el.date)).not.toBe(null);
			expect(el).toEqual(
				expect.objectContaining({
					user_id: expect.any(Number),
					user_type: expect.any(String),
					type: expect.any(String),
					operation: expect.objectContaining({
						amount: expect.any(Number),
						currency: expect.stringMatching(/EUR/)
					})
				})
			);
		});
	});
});

describe('Checking functions', () => {
	test('Check if fee counting is correct', () => {
		const data = [
			{
				date: '2020-02-20',
				user_type: 'natural',
				user_id: 1,
				type: 'cash_in',
				operation: {
					amount: '50000'
				},
				expect: '5.00'
			},
			{
				date: '2020-02-21',
				user_type: 'natural',
				user_id: 1,
				type: 'cash_in',
				operation: {
					amount: '1000'
				},
				expect: '0.30'
			},
			{
				date: '2020-02-21',
				user_type: 'natural',
				user_id: 1,
				type: 'cash_out',
				operation: {
					amount: '10000'
				},
				expect: '27.00'
			},
			{
				date: '2020-02-21',
				user_type: 'juridical',
				user_id: 1,
				type: 'cash_out',
				operation: {
					amount: '100'
				},
				expect: '0.50'
			},
			{
				date: '2020-03-28',
				user_type: 'natural',
				user_id: 1,
				type: 'cash_out',
				operation: {
					amount: '500'
				},
				expect: '0.00'
			},
			{
				date: '2020-03-28',
				user_type: 'natural',
				user_id: 1,
				type: 'cash_out',
				operation: {
					amount: '600'
				},
				expect: '0.30'
			}
		];
		data.forEach((el) => {
			expect(getFee(el)).toBe(el.expect);
		});
	});
});
