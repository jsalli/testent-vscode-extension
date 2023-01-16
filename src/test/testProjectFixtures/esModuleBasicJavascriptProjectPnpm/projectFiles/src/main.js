import { getUserDetailsById } from './apiFunctions.js';
import createMessage from './createMessage.js';

async function main(userId) {
	const userData = await getUserDetailsById(userId);

	const message = createMessage(
		userData.email,
		userData.name,
		userData.username,
	);
	console.log(message);
}

const userId = 2;

main(userId);
