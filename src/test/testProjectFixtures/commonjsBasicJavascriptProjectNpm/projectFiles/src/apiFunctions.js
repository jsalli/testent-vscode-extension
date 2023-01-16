import axios from 'axios';

const baseUrl = 'https://jsonplaceholder.typicode.com/users/';

export async function getUserDetailsById(
	userId,
) {
	if (userId < 0) {
		throw new Error(
			`Given user ID is invalid. Got: ${userId}, expected value >=0`,
		);
	}

	const url = `${baseUrl}${userId}`;
	const response = await axios.get(url);
	const user = response.data;

	return { username: user.username, name: user.name, email: user.email };
}

export async function getUserDetailsByIdTryCatch(
	userId,
) {
	if (userId < 0) {
		throw new Error(
			`Given user ID is invalid. Got: ${userId}, expected value >=0`,
		);
	}

	try {
		const url = `${baseUrl}${userId}`;
		const response = await axios.get(url);
		const user = response.data;

		return { username: user.username, name: user.name, email: user.email };
	} catch (error) {
		throw new Error('Error fetching data from API');
	}
}
