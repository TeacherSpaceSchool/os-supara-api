const InvoiceAzyk = require('../models/invoiceAzyk');

module.exports.reductionInvoices = async() => {
    let invoices = await InvoiceAzyk.find({$or:[{organization: null}, {adss: null}]})
        .populate({
            path: 'orders',
            populate : {
                path : 'item',
            }
        })
    console.log('reductionInvoices:',invoices.length)
    for (let i = 0; i < invoices.length; i++) {
        if(invoices[i].organization==undefined)
            invoices[i].organization = invoices[i].orders[0].item.organization
        if(invoices[i].adss==undefined)
            invoices[i].adss = []
        invoices[i].save()
    }
}