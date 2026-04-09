const fs = require('fs');
const path = require('path');

const fileDirectory = path.join(__dirname, './../.data/');
// console.log(fileDirectory);
lib = {};

lib.create = (dir, file, data, callback) => {
  fs.open(
    `${fileDirectory}${dir}/${file}.json`,
    'wx',
    (err1, fileDescriptor) => {
      if (!err1 && fileDescriptor) {
        const stringData = JSON.stringify(data);
        fs.writeFile(fileDescriptor, stringData, (err2) => {
          if (!err2) {
            fs.close(fileDescriptor, (err3) => {
              if (!err3) {
                callback(false);
              } else {
                callback('error while closing the file: ', err3);
              }
            });
          } else {
            callback('error while writing inside file: ', err2);
          }
        });
      } else {
        callback(err1);
      }
    }
  );
};

lib.read = (dir, file, callback) => {
  fs.readFile(`${fileDirectory}${dir}/${file}.json`, 'utf-8', (err, data) => {
    callback(err, data);
  });
};
lib.update = (dir, file, data, callback) => {
  fs.open(
    `${fileDirectory}${dir}/${file}.json`,
    'r+',
    (err1, fileDescriptor) => {
      if (!err1 && fileDescriptor) {
        const stringData = JSON.stringify(data);
        fs.ftruncate(fileDescriptor, (err2) => {
          if (!err2) {
            fs.write(fileDescriptor, stringData, (err3) => {
              if (!err3) {
                fs.close(fileDescriptor, (err4) => {
                  if (!err4) {
                    callback(false);
                  } else {
                    callback('error while closing updated file: ', err4);
                  }
                });
              } else {
                callback('error while writing in file for update :', err3);
              }
            });
          } else {
            callback('error while truncating: ', err2);
          }
        });
      } else {
        callback('error while updating file: ', err1);
      }
    }
  );
};

lib.delete = (dir, file, callback) => {
  fs.unlink(`${fileDirectory}${dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('error while deleting file:', err);
    }
  });
};

lib.list = (dir, callback) => {
  fs.readdir(`${fileDirectory}${dir}`, (err, allFiles) => {
    if (!err && allFiles && allFiles.length > 0) {
      const fileArrayWithoutExtension = allFiles.map((file) => {
        return file.replace('.json', '');
      });
      callback(false, fileArrayWithoutExtension);
    } else {
      callback('no file in that directory');
    }
  });
};

module.exports = lib;
