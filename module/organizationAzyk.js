const OrganizationAzyk = require('../models/organizationAzyk');
module.exports.startSubCategoryAzyk = async()=>{
    let subCategoryyUndefined = await SubCategoryAzyk.findOne({name: 'Не задано'});
    if(!subCategoryyUndefined) {
        let categoryUndefined = await CategoryAzyk.findOne({name: 'Не задано'});
        let _object = new SubCategoryAzyk({
            category: categoryUndefined._id,
            name: 'Не задано',
            status: 'active'
        });
        subCategoryyUndefined = await SubCategoryAzyk.create(_object)
    }
    subCategoryUndefinedId = subCategoryyUndefined._id
}


module.exports.getSubCategoryUndefinedId = () => {
    return subCategoryUndefinedId
}