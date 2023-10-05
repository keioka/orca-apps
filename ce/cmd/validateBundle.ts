const fs = require('fs');
const path = require('path');

const env = process.argv[2];

const DIRECTORY_PATHS = {
  dev: path.join(__dirname, '../build/chrome-mv3-dev'),
  stg: path.join(__dirname, '../build/chrome-mv3-staging')
};

const UNWANTED_CODE = 'document.createElement("script")';

function validateFile(filePath, code = UNWANTED_CODE) {
  const fileContent = fs.readFileSync(filePath, 'utf8');

  if (fileContent.includes(code)) {
    console.error(`❌ Error: Unwanted code found in the file \n ${filePath}. \n`);
    return false
  }

  return true
}

function validateAllFiles(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  let validationPassed = true;
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && filePath.endsWith('.js')) {
      if (!validateFile(filePath)) {
        validationPassed = false;
      }
    }
  }

  if (!validationPassed) {
    console.log(`❌❌❌ Validation failed for ${env} environment: Unwanted code found in the files. ❌❌❌`);
  } else {
    console.log(`✅ Validation passed for ${env} environment: No unwanted code found in the files.`);
  }
}

if (DIRECTORY_PATHS[env]) {
  console.log(`Validating files in the directory ${DIRECTORY_PATHS[env]}...`);
  validateAllFiles(DIRECTORY_PATHS[env]);
} else {
  console.log(`Unknown environment: ${env}. Skipping validation.`);
}

module.exports = {
  validateFile
};
