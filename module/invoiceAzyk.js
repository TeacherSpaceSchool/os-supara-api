const InvoiceAzyk = require('../models/invoiceAzyk');

module.exports.reductionInvoices = async() => {
    let invoices = await InvoiceAzyk.find({
        distributer: {$ne: null},
        sale: null
    })
    console.log('reductionInvoices:',invoices.length)
    for (let i = 0; i < invoices.length; i++) {
        if(invoices[i].distributer)
            invoices[i].sale = invoices[i].distributer
        invoices[i].save()
    }
}