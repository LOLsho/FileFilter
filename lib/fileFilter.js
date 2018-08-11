const fs = require('fs');
const path = require('path');
const regexpForDirName = new RegExp('[а-яА-ЯёЁa-zA-Z0-9]');



const fileFilter = {};


fileFilter.filesCounter = 0;
fileFilter.startingDir = '';
fileFilter.destBaseDir = '';


fileFilter.filter = (initialDir, options) => {
    try {
        let files = fs.readdirSync(initialDir);
        files.forEach((item) => {
            let localBase = path.join(initialDir, item);
            let state = fs.statSync(localBase);

            if (state.isDirectory()) {
                fileFilter.filter(localBase, options);

            } else {
                ++fileFilter.filesCounter;

                let firstLetterIndex = item.search(regexpForDirName),
                    firstLetter = item[firstLetterIndex],
                    alphabeticDir = path.join(fileFilter.destBaseDir, firstLetter),
                    destPathToFile = path.join(alphabeticDir, item);

                if (!fs.existsSync(alphabeticDir)) { // TODO Можно сделать чтобы созданные папки добавлялись в массив и проверять их существование через него, мне кажется так компьютеру бедут немного проще
                    fs.mkdirSync(alphabeticDir);
                }

                if (options.deleteDir) {
                    fileFilter.copyFile(localBase, destPathToFile);
                    fileFilter.deleteFile(localBase);
                } else {
                    fileFilter.copyFile(localBase, destPathToFile);
                }
            }
        });
    } catch (e) {
        console.log('Error reading starting directory');
    }
    if (options.deleteDir) {
        fileFilter.deleteDir(initialDir);
    }
};



fileFilter.deleteDir = (pathToDir) => {
    try {
        fs.rmdirSync(pathToDir);
    } catch (e) {
        console.log(e.message);
    }
};

fileFilter.deleteFile = (pathToFile) => {
    try {
        fs.unlinkSync(pathToFile);
    } catch (e) {
        console.log(e.message);
    }
};

fileFilter.copyFile = (pathToFile, destPath) => {
    try {
        fs.copyFileSync(pathToFile, destPath);
    } catch (e) {
        console.log(e.message);
    }
};




const filter = {};

filter.start = (initialDir, destinationDir, options) => {
    console.log('Подождите немного, сортирую...');

    fileFilter.startingDir = initialDir;
    fileFilter.destBaseDir = destinationDir;

    if (!fs.existsSync(fileFilter.destBaseDir)) {
        fs.mkdirSync(fileFilter.destBaseDir);
    }

    fileFilter.filter(fileFilter.startingDir, options);
    console.log('\x1b[32m%s\x1b[0m', `Ура! Сортировка завершена.\nФайлов отсортировано - ${fileFilter.filesCounter}`);
    process.exit(0);
};


module.exports = filter;