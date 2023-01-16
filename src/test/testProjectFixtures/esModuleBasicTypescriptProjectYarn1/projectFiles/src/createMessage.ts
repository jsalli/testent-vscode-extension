import { capitalizeFirstLetter, validateEmail } from './utils/utils';

/**
 * Function creating a custom message from given information
 * @param email
 * @param name
 * @param username
 * @return 
 */
export default function createMessage(
	email: string,
	name: string,
	username: string,
): string {
	if (email.length !== 0) {
		if (email.length > 0 && !validateEmail(email)) {
			throw new Error('email is not valid');
		}
	} else {
		throw new Error('email is empty');
	}
	if (username.length === 0) {
		throw new Error('username is empty');
	}
	if (name.length === 0) {
		throw new Error("User's name is empty");
	}

	const capitalizedName = name
		.split(' ')
		.map((namePart) => {
			return capitalizeFirstLetter(namePart);
		})
		.join(' ');

	return (
		`User with email: ${email} has name: "${capitalizedName}".` +
		` This Her/his username is '${username}'`
	);
}
