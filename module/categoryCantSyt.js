const CategoryCantSyt = require('../models/categoryCantSyt');

module.exports.createCategoryOther = async() => {
    let category = await CategoryCantSyt.findOne({name: 'Прочие'})
    if(!category) {
        category = new CategoryCantSyt({
            term: 1,
            name: 'Прочие',
            suppliers: []
        });
        await CategoryCantSyt.create(category)
    }

}