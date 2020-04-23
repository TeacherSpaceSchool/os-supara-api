const InvoiceAzyk = require('../models/invoiceAzyk');

module.exports.reductionInvoices = async() => {
    let invoices = await InvoiceAzyk.find({
        $or:[
            {returnedPrice: null},
        ]})
    console.log('reductionInvoices:',invoices.length)
    for (let i = 0; i < invoices.length; i++) {
        if(invoices[i].returnedPrice==undefined)
            invoices[i].returnedPrice = 0
        invoices[i].save()
    }
}