import { getUserDetailsById } from './apiFunctions';
import createMessage from './createMessage';

async function main(userId: number) {
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
