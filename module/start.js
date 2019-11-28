const { startCategoryAzyk } = require('../module/categoryAzyk');
const { startSubCategoryAzyk } = require('../module/subCategoryAzyk');

let start = async () => {
    await startCategoryAzyk()
    await startSubCategoryAzyk()
}

module.exports.start = start;
