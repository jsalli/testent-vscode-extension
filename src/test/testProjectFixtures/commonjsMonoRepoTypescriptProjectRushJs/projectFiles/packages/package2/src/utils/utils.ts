export function capitalizeFirstLetter(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

const emailMatcher =
	/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export function validateEmail(emailString: string): boolean {
	if (emailString.length > 320) {
		return false;
	}
	return emailMatcher.test(emailString);
}
