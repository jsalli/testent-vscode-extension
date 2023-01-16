import axios from 'axios';

export interface User {
	id: number;
	name: string;
	username: string;
	email: string;
	address: {
		street: string;
		suite: string;
		city: string;
		zipcode: string;
		geo: { lat: string; lng: string };
	};
	phone: string;
	website: string;
	company: {
		name: string;
		catchPhrase: string;
		bs: string;
	};
}

const baseUrl = 'https://jsonplaceholder.typicode.com/users/';

export async function getUserDetailsById(
	userId: number,
): Promise<{ username: string; name: string; email: string }> {
	if (userId < 0) {
		throw new Error(
			`Given user ID is invalid. Got: ${userId}, expected value >=0`,
		);
	}

	const url = `${baseUrl}${userId}`;
	const response = await axios.get(url);
	const user = response.data as User;

	return { username: user.username, name: user.name, email: user.email };
}

export async function getUserDetailsByIdTryCatch(
	userId: number,
): Promise<{ username: string; name: string; email: string }> {
	if (userId < 0) {
		throw new Error(
			`Given user ID is invalid. Got: ${userId}, expected value >=0`,
		);
	}

	try {
		const url = `${baseUrl}${userId}`;
		const response = await axios.get(url);
		const user = response.data as User;

		return { username: user.username, name: user.name, email: user.email };
	} catch (error) {
		throw new Error('Error fetching data from API');
	}
}
