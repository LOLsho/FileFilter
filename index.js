const cli = require('./lib/cli');

const app = {};


app.init = (callback) => {
    callback('Приложение запущено.');
    cli.init();
};

app.init((phrase) => {
    console.log('\x1b[34m%s\x1b[0m', phrase);
});