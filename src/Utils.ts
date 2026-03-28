export function sleep(seconds:number) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {resolve(null); },seconds * 1000);
	});
}




export interface FormatPlaceholderFuncArgListItem {
	placeholder: string,
	value: string|number,
};




export function formatPlaceholder(initialValue: string, list: FormatPlaceholderFuncArgListItem[]) {
	let result = initialValue;
	for(let i=0; i<list.length; i++) {
		result = result.replaceAll(list[i].placeholder, list[i].value.toString());
	}
	return result;
}
