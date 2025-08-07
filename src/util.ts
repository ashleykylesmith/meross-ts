import chalk from "chalk";
import { appendFileSync } from "node:fs";

// Utility function to delay execution for a specified number of milliseconds
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Log to file utility
// This is a simple utility to log messages to a file for debugging purposes.
const filePath = "./log.txt";
export const logToFile = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`;
    appendFileSync(filePath, log);
};

// Generic log helper
const logHelper = (
    level: 'log' | 'error',
    colorFn: (msg: string) => string,
    message: string,
    data?: any
) => {
    const formattedMsg = colorFn(message);
    const formattedData = data ? JSON.stringify(data, null, 2) : '';
    console[level](formattedMsg, formattedData);
};

export const log = (message: string, data?: any) => logHelper('log', chalk.white, message, data);
export const logWaiting = (message: string, data?: any) => logHelper('log', chalk.magenta.bold, message, data);
export const logInfo = (message: string, data?: any) => logHelper('log', chalk.blue.bold, message, data);
export const logSuccess = (message: string, data?: any) => logHelper('log', chalk.green.bold, message, data);
export const logError = (message: string, data?: any) => logHelper('error', chalk.red.bold, message, data);