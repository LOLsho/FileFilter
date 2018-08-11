const events = require('events');
class _events extends events{}
const e = new _events();
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const fileFilter = require('./fileFilter');


const _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});



cli = {};
cli.inputInfo = {
    'startingDir': '',
    'distDir': './SortedMusic',
    'deleteDir': false
};

cli.init = () => {

    console.log('\x1b[32m%s\x1b[0m', `CLI запущен.\nПо умолчанию файлы отсортируются в папку "SortedMusic" в директории этой программы, но Вы можете это изменить.\nПеред сортировкой убедитесь, что в сортируемой папке нет никаких лишних файлов, иначе они тоже будут отсортированы.\nДля помощи введите 'help' или 'manual'.`);

    _interface.prompt();

    _interface.on('line', (str) => {
        cli.processInput(str);
        _interface.prompt();
    });

    _interface.on('close', () => {
        process.exit(0);
    });
};

cli.processInput = (str) => {
    str = typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : false;
    if (str) {
        const uniqueInputs = [
            'start',
            '--path',
            '--dest-path',
            '--delete',
            'manual',
            'help',
            'exit'
        ];

        let matchFound = uniqueInputs.some((input) => {
            if (str.toLowerCase().indexOf(input) > -1) {
                e.emit(input, str);
                return true;
            }
        });

        // If no match is found, tell the user to try again
        if (!matchFound) {
            console.log(`К сожалению такой команды нет, попробуте снова. Для помощи введите 'help' или 'manual'`);
        }
    }
};




e.on('start', (str) => {
    cli.responders.startFilter(str);
});

e.on('--path', (str) => {
    cli.responders.setPath(str);
});

e.on('--dest-path', (str) => {
    cli.responders.setDestPath(str);
});

e.on('--delete', (str) => {
    cli.responders.setToDelete(str);
});

e.on('manual', (str) => {
    cli.responders.help();
});

e.on('help', (str) => {
    cli.responders.help();
});

e.on('exit', (str) => {
    cli.responders.exit();
});




cli.responders = {};

cli.responders.startFilter = (str) => {
    if (cli.inputInfo.startingDir) {
        _interface.question(`Путь к сортируемой папке - ${cli.inputInfo.startingDir}\nПуть к папке назначения - ${cli.inputInfo.distDir}\nУдалить сортируемую папку после сортировки - ${cli.inputInfo.deleteDir}\nВсе верно? Начинаем сортировку? [y/n]\n> `, (answer) => {
            if (answer.toLowerCase() === 'y') {
                fileFilter.start(cli.inputInfo.startingDir, cli.inputInfo.distDir, {
                    deleteDir: cli.inputInfo.deleteDir
                });
            } else {
                console.log('\x1b[35m%s\x1b[0m', 'Сортировка отменена');
            }
        });

    } else {
        console.log('\x1b[31m%s\x1b[0m', 'Не задан путь к сортируемой папке! Задайте его командой --path={pathToDir}');
        console.log('\x1b[32m%s\x1b[0m', 'Для помощи введите \'help\' или \'manual\'');
    }
};

cli.responders.setPath = (str) => {
    let enteredPath = path.normalize(str.slice(str.indexOf('=') + 1));
    enteredPath = enteredPath.length > 0 && enteredPath !== '.' ? enteredPath : false;
    if (fs.existsSync(enteredPath)) {
        if (fs.statSync(enteredPath).isDirectory()) {
            cli.inputInfo.startingDir = enteredPath;
            console.log('\x1b[35m%s\x1b[0m', 'Путь к сортируемой папке задан!');
        } else {
            console.log('Введен путь к файлу, необходима папка');
        }
    } else {
        console.log('Папка по указанному пути не найдена, попробуйте снова');
    }
};

cli.responders.setDestPath = (str) => {
    let enteredDestPath = path.normalize(str.slice(str.indexOf('=') + 1));
    enteredDestPath = enteredDestPath.length > 0 && enteredDestPath !== '.' ? enteredDestPath : false;
    if (fs.existsSync(enteredDestPath)) {
        if (fs.statSync(enteredDestPath).isDirectory()) {
            cli.inputInfo.distDir = enteredDestPath;
            console.log('Путь к папке, в которую попадут отсортированные файлы, задан!');
        } else {
            console.log('Введен путь к файлу, необходима папка');
        }
    } else {
        cli.inputInfo.distDir = enteredDestPath;
        console.log('\x1b[35m%s\x1b[0m', 'Путь к папке, в которую попадут отсортированные файлы, задан!');
    }
};

cli.responders.setToDelete = (str) => {
    cli.inputInfo.deleteDir = str.slice(str.indexOf('=') + 1) === 'true';
    let phrase = cli.inputInfo.deleteDir ? `Внимание! После окончания сортировки, сортируемая папка будет удалена!.. И не говорите что Вас не предупреждали ;)`
        : `Сортируемая папка останется невредимой`;
    cli.inputInfo.deleteDir ? console.log('\x1b[31m%s\x1b[0m', phrase) : console.log('\x1b[35m%s\x1b[0m', phrase);
};

cli.responders.help = () => {
    const commands = {
        'start': 'Начинает работу фильтра. Не начнется, если не заданы корректные пути к папкам',
        '--path={pathToYourDir}': 'Задает абсолютный путь к папке, которую нужно отсортировать',
        '--dest-path={pathToYourDestDir}': 'Задает абсолютный путь к папке, в которую попадут отсортированные файлы',
        '--delete={false/true}': 'Поставьте true, если хотите удалить изначальную папку. По умолчанию - false',
        'help': 'Показывает эту страницу помощи',
        'manual': 'То же самое, что и help',
        'exit': 'Выход и завершение программы'
    };

    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
            const value = commands[key];
            let line = '\x1b[33m' + key + '\x1b[0m';
            const padding = 60 - line.length;
            for (let i = 0; i < padding; i++) {
                line += ' ';
            }
            line += value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);

    cli.horizontalLine();
};

cli.responders.exit = () => {
    console.log('Рад что заглянули ;)');
    process.exit(0);
};



cli.horizontalLine = () => {
    const width = process.stdout.columns;

    let line = '';
    for (let i = 0; i < width; i++) {
        line += '-';
    }
    console.log(line);
};

cli.centered = (str) => {
    str = typeof(str) === 'string' && str.trim().length > 0 ? str.trim() : '';

    const width = process.stdout.columns;

    const leftPadding = Math.floor((width - str.length) / 2);

    let line = '';
    for (let i = 0; i < leftPadding; i++) {
        line += ' ';
    }
    line += str;
    console.log(line);
};

cli.verticalSpace = (lines) => {
    lines = typeof(lines) === 'number' && lines > 0 ? lines : 1;
    for (let i = 0; i < lines; i++) {
        console.log('');
    }
};




module.exports = cli;