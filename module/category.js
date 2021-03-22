const CategoryOsSupara = require('../models/category');

module.exports.createCategoryOther = async() => {
    let category = await CategoryOsSupara.findOne({name: 'Прочие'})
    if(!category) {
        category = new CategoryOsSupara({
            name: 'Прочие',
            suppliers: []
        });
        await CategoryOsSupara.create(category)
    }
    category = await CategoryOsSupara.findOne({name: 'Автозакуп'})
    if(!category) {
        category = new CategoryOsSupara({
            name: 'Автозакуп',
            suppliers: []
        });
        await CategoryOsSupara.create(category)
    }
}