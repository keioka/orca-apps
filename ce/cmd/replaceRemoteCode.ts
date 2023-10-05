const fs = require('fs');
const path = require('path');
const validateFile = require('./validateBundle.ts').validateFile;

const env = process.argv[2]; // Get the environment from the command line arguments

let DIRECTORY_PATH;
if (env === 'dev') {
  DIRECTORY_PATH = path.join(__dirname, '../build/chrome-mv3-dev');
} else if (env === 'stg') {
  DIRECTORY_PATH = path.join(__dirname, '../build/chrome-mv3-staging');
} else {
  console.error("❌ Unknown environment specified. Use 'dev' or 'stg'.");
  process.exit(1);
}


const CODE_TO_REMOVE = `
function _loadJS(url) {
    // TODO: consider adding timeout support & cancellation
    return new Promise((resolve, reject)=>{
        const el = document.createElement("script");
        el.setAttribute("src", url);
        el.onload = resolve;
        el.onerror = (e)=>{
            const error = _createError("internal-error" /* AuthErrorCode.INTERNAL_ERROR */ );
            error.customData = e;
            reject(error);
        };
        el.type = "text/javascript";
        el.charset = "UTF-8";
        getScriptParentElement().appendChild(el);
    });
}
`;

const NEW_CODE = `
function _loadJS(url: string) {
  return new Promise((resolve, reject) => {
    reject();
  });
}
`;

function replaceInFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  if (fileContent.includes(CODE_TO_REMOVE)) {
    console.log(`Replacing code in ${filePath}...`);
    const updatedContent = fileContent.replace(CODE_TO_REMOVE, NEW_CODE);
    fs.writeFileSync(filePath, updatedContent);
  }
}

// Get all .js files in the directory and replace content in them
const files = fs.readdirSync(DIRECTORY_PATH);
files.forEach(file => {
  if (path.extname(file) === '.js') {
    console.log(`Checking code in ${file} files...`);
    replaceInFile(path.join(DIRECTORY_PATH, file));
  }
});
