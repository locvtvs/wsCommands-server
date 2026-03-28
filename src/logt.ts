import readline from "readline";
import * as fs from "fs/promises";
import * as path from "path";



export const defaultLocale:Intl.LocalesArgument = 'en-US';
let readlineInterface: readline.Interface;




export function setReadlineInterfaceLogt(ri: readline.Interface) {
		readlineInterface = ri;
}




const stdoutWrite = process.stdout.write.bind(process.stdout);
const stderrWrite = process.stdout.write.bind(process.stderr);




export async function appendToLogFile(message: string) {
		const ENV_LOG_FILES_ENABLED = process.env.LOG_FILES_ENABLED?.toLowerCase().trim().replaceAll(` `,``);
		if (process.env.LOG_FILES_ENABLED && (ENV_LOG_FILES_ENABLED == 'true' || ENV_LOG_FILES_ENABLED == '1')) {
				const dir = path.join(process.cwd(), "logs");
				const file = path.join(dir, `wsc-log-${convertDate(defaultLocale, String(Date.now()))}.txt`);
				await fs.mkdir(dir, { recursive: true });
				await fs.appendFile(file, `${message}\n`, 'utf-8');
		}
}




process.stdout.write = (chunk: any, encoding?: any, callback?: any) => {
		if (chunk.toString().replaceAll(`\n`,``) !== "> " && chunk.toString().trim().replaceAll(` `,``).replaceAll(`\n`,``).length > 0) {
				appendToLogFile(chunk.toString().replace(/\n+$/g, "")).catch(() => {});
		}
		return stdoutWrite(chunk, encoding, callback);
}




process.stderr.write = (chunk: any, encoding?: any, callback?: any) => {
		if (chunk.toString().replaceAll(`\n`,``) !== "> " && chunk.toString().trim().replaceAll(` `,``).replaceAll(`\n`,``).length > 0) {
				appendToLogFile(chunk.toString().replace(/\n+$/g, "")).catch(() => {});
		}
		return stderrWrite(chunk, encoding, callback);
}




export const APP_VERSION = process.env.npm_package_version || '-1';




export default function logt(
		tag: string, 
		firstMessage: string, 
		secondMessage?: any, 
		options?: {
				enabled?: boolean,
				locale?: Intl.LocalesArgument,
		},
): void {
		readlineInterface?.pause();
		if (typeof options?.enabled === 'boolean' && !options?.enabled) return;
		if (typeof secondMessage !== "undefined") {
			console.log(`[${APP_VERSION}] [${logTime({ locale: options?.locale })}] ${tag}: ${firstMessage}`, secondMessage);
		} else {
			console.log(`[${APP_VERSION}] [${logTime({ locale: options?.locale })}] ${tag}: ${firstMessage}`);
		}
		readlineInterface?.prompt();
}




export function	logTime( options?: { locale: Intl.LocalesArgument } ): string {
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




function convertDate(locale: Intl.LocalesArgument, timestamp: string): string {
	let timestamp_1 = Number(timestamp);
	const timestampDate = new Date(timestamp_1);
	const date = timestampDate.getDate();
	let month = fixDateNumber(Number(timestampDate.getMonth()) + 1);
	let day = fixDateNumber(date);
	let year = fixDateNumber(timestampDate.getFullYear());
	return `${year}-${month}-${day}`;
}




function fixDateNumber(value:string|number) {
		return String(value).length < 2 ? `0${value}` : value;
}
