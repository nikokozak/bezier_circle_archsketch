// GENERAL UTILITY FUNCTION

export const setDefaultFunction = (paramToCheck: any, defaultFunction: Function) => {
	if (paramToCheck) { return paramToCheck }
	else { return defaultFunction }
}
