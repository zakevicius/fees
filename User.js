export default class User {
	constructor(id, type, date, max) {
		this.id = id;
		this.type = type;
		this.usedLimit = 0;
		this.lastCashoutDate = new Date(date);
		this.MAX_LIMIT = max;
	}

	get lastDate() {
		return this.lastCashoutDate;
	}

	set lastDate(date) {
		this.lastCashoutDate = date;
	}

	get limitLeft() {
		return this.MAX_LIMIT - this.usedLimit;
	}

	get limit() {
		return this.usedLimit;
	}

	set limit(amount) {
		this.usedLimit = amount;
	}

	recalculateLimit(amount, newDate) {
		const oldDate = this.lastDate;
		this.lastDate = newDate;

		if (this.shouldRestoreLimit(oldDate, newDate)) {
			this.limit = 0;
		}

		if (amount < this.limitLeft) {
			const limit = this.limitLeft;
			this.limit += amount;
			return limit;
		} else {
			const difference = this.limitLeft;
			this.limit = this.MAX_LIMIT;
			return difference;
		}
	}

	shouldRestoreLimit(oldDate, newDate) {
		const ms = 1000 * 60 * 60 * 24 * 7; // miliseconds in a week
		const nD = newDate.getDay();
		const oD = oldDate.getDay();

		return (
			(newDate > oldDate && ((nD < oD && nD !== 0) || (nD > oD && oD === 0))) ||
			newDate - oldDate > ms
		);
	}
}
