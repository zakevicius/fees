import {
	checkIfFileExists,
	getInputData,
	isValidDate,
	getFee,
	calculate
} from './functions';

import configs from './configs.json';

describe('Checking configs', () => {
	describe('Checking CASH_IN_CONFIG', () => {
		test('Check if CASH_IN_CONFIG contains required properties', () => {
			const config = configs.cashIn;
			expect(config).toHaveProperty('percents');
			expect(config).toHaveProperty('max.amount');
			expect(config).toHaveProperty('max.currency');
		});
	});

	describe('Checking CASH_OUT_NATURAL_CONFIG', () => {
		test('Check if CASH_OUT_NATURAL_CONFIG contains required properties', async () => {
			const config = configs.cashOut.natural;
			expect(config).toHaveProperty('percents');
			expect(config).toHaveProperty('week_limit.amount');
			expect(config).toHaveProperty('week_limit.currency');
		});
	});

	describe('Checking CASH_OUT_LEGAL_CONFIG', () => {
		test('Check if CASH_OUT_LEGAL_CONFIG contains required properties', async () => {
			const config = configs.cashOut.juridical;
			expect(config).toHaveProperty('percents');
			expect(config).toHaveProperty('min.amount');
			expect(config).toHaveProperty('min.currency');
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
		expect(calculate(1000, 100)).toBe('1000.00');
		expect(calculate(1000, 0.1)).toBe('1.00');
		expect(calculate(1, 1)).toBe('0.01');
		expect(calculate(1000, 0)).toBe('0.00');
		expect(calculate(1000, 5, 'min', 75)).toBe('50.00');
		expect(calculate(5, 50, 'min', 2)).toBe('2.00');
		expect(calculate(1, 100, 'min', 1)).toBe('1.00');
		expect(calculate(1000, 50, 'max', 600)).toBe('600.00');
		expect(calculate(1000, 0, 'max', 600)).toBe('600.00');
		expect(calculate(1000, 10, 'max', 75)).toBe('100.00');
		expect(calculate(1000, 10, 'mistype', 75)).toBe('100.00');
		expect(calculate(1000, 10, 'mistype', 150)).toBe('100.00');
	});

	test('Check if general fee counting is correct', () => {
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
			expect(getFee(el, configs)).toBe(el.expect);
		});
	});
});
