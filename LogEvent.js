// dep modules
const {format} = require('date-fns');
const {v4: uuidv4} = require('uuid');
// common core modules
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuidv4()}\t${uuid()}\t${message}\n`;
    try {
        if(!fs.existsSync(path.join(__dirname, 'logs'))) 
            await fsPromises.mkdir(path.join(__dirname,'logs',logName));
        await fsPromises.appendFile(
            path.join(__dirname, 'logs', logName),
            logItem
        );
    } catch (err) {
        console.error(`Error writing to log file: ${err}`);
    }
}

module.exports = logEvents;
