import User from './User';

const user = new User();

describe('Checking User class functions', () => {
	test('Checking if limit should be restored', () => {
		expect(
			user.shouldRestoreLimit(new Date('2020-05-31'), new Date('2020-06-01'))
		).toBeTruthy();
		expect(
			user.shouldRestoreLimit(new Date('2020-05-30'), new Date('2020-05-31'))
		).toBeFalsy();
		expect(
			user.shouldRestoreLimit(new Date('2020-05-31'), new Date('2020-06-01'))
		).toBeTruthy();
		expect(
			user.shouldRestoreLimit(new Date('2020-05-01'), new Date('2020-05-03'))
		).toBeFalsy();
		expect(
			user.shouldRestoreLimit(new Date('2020-05-03'), new Date('2020-05-04'))
		).toBeTruthy();
		expect(
			user.shouldRestoreLimit(new Date('2020-05-01'), new Date('2019-06-03'))
		).toBeFalsy();
		expect(
			user.shouldRestoreLimit(new Date('2020-05-06'), new Date('2020-06-06'))
		).toBeTruthy();
		expect(
			user.shouldRestoreLimit(new Date('2020-04-30'), new Date('2020-05-01'))
		).toBeFalsy();
	});
});
