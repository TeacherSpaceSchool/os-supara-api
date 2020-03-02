const InvoiceAzyk = require('../models/invoiceAzyk');

module.exports.reductionInvoices = async() => {
    let invoices = await InvoiceAzyk.find({organization: null})
        .populate({
            path: 'orders',
            populate : {
                path : 'item',
            }
        })
    console.log('reductionInvoices:',invoices.length)
    for (let i = 0; i < invoices.length; i++) {
        invoices[i].organization = invoices[i].orders[0].item.organization
        invoices[i].save()
    }
}