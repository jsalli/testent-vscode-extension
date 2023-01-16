module.exports = function capitalizeFirstLetter(text) {
	return text.charAt(0).toUpperCase() + text.slice(1);
}

const emailMatcher =
	/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
module.exports =  function validateEmail(emailString) {
	if (emailString.length > 320) {
		return false;
	}
	return emailMatcher.test(emailString);
}
