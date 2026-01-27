import readline from "readline";




const defaultLocale:Intl.LocalesArgument = 'en-US';
let readlineInterface: readline.Interface;




export function setReadlineInterfaceLogt(ri: readline.Interface) {
		readlineInterface = ri;
}




export default function logt(
		tag: string, 
		firstMessage: string, 
		secondMessage?: any, 
		options?: {
				enabled?: boolean,
				locale?: Intl.LocalesArgument,
		},
): void {
		if (typeof options?.enabled === 'boolean' && !options?.enabled) return;
		if (typeof secondMessage !== "undefined") {
			console.log(`[${logTime({ locale: options?.locale })}] ${tag}: ${firstMessage}`, secondMessage);
		} else {
			console.log(`[${logTime({ locale: options?.locale })}] ${tag}: ${firstMessage}`);
		}
		readlineInterface?.prompt();
}




function	logTime( options?: { locale: Intl.LocalesArgument } ): string {
		return	convertDateTime(
				options?.locale ? options?.locale : defaultLocale, 
				String(Date.now())
		);
}




function convertDateTime(locale: Intl.LocalesArgument, timestamp: string): string {
	let timestamp_1 = Number(timestamp);
	const timestampDate = new Date(timestamp_1);
	const date = timestampDate.getDate();
	let time = timestampDate.toLocaleString(locale, {
			hour:		'numeric'	,
			minute:	'numeric'	,
			second:	'numeric'	,
			hour12:	false			,
	});


	let month = fixDateNumber(Number(timestampDate.getMonth()) + 1);
	let day = fixDateNumber(date);
	let year = fixDateNumber(timestampDate.getFullYear());


	let str = `${year}-${month}-${day} ${time}`;
	return str;
}




function fixDateNumber(value:string|number) {
		return String(value).length < 2 ? `0${value}` : value;
}