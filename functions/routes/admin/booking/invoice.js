const express = require('express')
let app = express.Router()
const session = require('express-session');
const admin = require('firebase-admin');
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Set secure: true if using HTTPS
    maxAge: 3600000 // Set the session to expire in 1 hour
  } 
}));
const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment-timezone');
const bodyParser = require('body-parser');
const cors = require('cors');
const bucket = admin.storage().bucket();
// Configure middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
const path = require('path');
const rootFolder = process.cwd();
const {
  getBooking,
  updateInvoiceBooking
} = require(path.join(rootFolder, "/controllers/admin/bookingController"));

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.redirect('/admin/login');
    }
  };

app.use(function(req, res, next) {
  req.breadcrumbs = get_breadcrumbs(req.originalUrl);
  next();
});
  
app.get('/:id', isLoggedIn, async (req,res) =>{
    var adminUser = req.session.user;
    var currentUrl = req.originalUrl;
    const id = req.params.id;
    var data = await getBooking(id);
    data = data[0];
    var total = 0;
    var applicationFee = data.service.price/100*10;
    total = parseInt(data.service.price) + parseInt(applicationFee);
    
    res.render('./admin/booking/invoice',{
        adminUser, 
        currentUrl, 
        pageName: "Invoice",
        title: global.title,
        breadcrumbs: req.breadcrumbs,
        id: data.service.serviceId,
        bookingId: id,
        data: data,
        applicationFee: applicationFee,
        total: total
    });
});

app.get('/export/:id', isLoggedIn, async (req, res) => {
  const bookingId = req.params.id;
  var data = await getBooking(bookingId);
  data = data[0];
  const rootPath = path.join(__dirname, '../../../../');
  if(data.booking.invoiceURL.empty){

    const pdfFilePath = `${rootPath}/public/invoices/invoice_${data.service.serviceId}.pdf`;
    const htmlContent = generateInvoiceHtml(bookingId, data); 
    const pdfBuffer = await exportPDF(htmlContent);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(500).send('Error generating PDF data');
    }

    // Ensure that parent directories of the PDF file exist
    const parentDirs = path.dirname(pdfFilePath);
    if (!fs.existsSync(parentDirs)) {
      fs.mkdirSync(parentDirs, { recursive: true });
    }

    // Write the PDF buffer to a file
    const pdfStream = fs.createWriteStream(pdfFilePath);
    pdfStream.write(pdfBuffer);
    pdfStream.on('finish', async () => {
      // Upload the PDF file to Firebase Storage
      const fileUploadResult = await bucket.upload(pdfFilePath, {
        destination: `invoices/invoice_${data.service.serviceId}.pdf`
      });

      // Delete the PDF file from the local filesystem
      //fs.unlinkSync(pdfFilePath);

      // Get the public URL for the uploaded file
      const file = fileUploadResult[0];
      const url = await file.getSignedUrl({
        action: 'read',
        expires: '03-31-2024' // Set the expiration date of the URL
      });

      res.download(pdfFilePath);
      await updateInvoiceBooking(bookingId, url[0]);
      console.log(`PDF file has been exported, uploaded to Firebase Storage, and downloaded. URL: ${url}`);

    });
    pdfStream.end();
  } else {
    const pdfFilePath = `${rootPath}/public/invoices/invoice_${data.service.serviceId}.pdf`;
    res.download(pdfFilePath);
  }

  
});

async function exportPDF(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const element = await page.waitForSelector('#invoice');
  const boundingBox = await element.boundingBox();
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px',
    },
    clip: {
      x: boundingBox.x,
      y: boundingBox.y,
      width: boundingBox.width,
      height: boundingBox.height,
    },
  });
  await browser.close();
  return pdfBuffer;
}

function generateInvoiceHtml(bookingId, data) {
  var total = 0;
  var applicationFee = data.service.price/100*10;
  total = parseInt(data.service.price) + parseInt(applicationFee);
  const timeZone = 'America/New_York';
  const today = moment().tz(timeZone).format('MMMM DD, YYYY');
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>INVOICE #${data.service.serviceId}</title>

        <style>
          .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            font-size: 16px;
            line-height: 24px;
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #555;
          }

          .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
          }

          .invoice-box table td {
            padding: 5px;
            vertical-align: top;
          }

          .invoice-box table tr td:nth-child(2) {
            text-align: right;
          }

          .invoice-box table tr.top table td {
            padding-bottom: 20px;
          }

          .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
          }

          .invoice-box table tr.information table td {
            padding-bottom: 40px;
          }

          .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
          }

          .invoice-box table tr.details td {
            padding-bottom: 20px;
          }

          .invoice-box table tr.item td {
            border-bottom: 1px solid #eee;
          }

          .invoice-box table tr.item.last td {
            border-bottom: none;
          }

          .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
          }

          @media only screen and (max-width: 600px) {
            .invoice-box table tr.top table td {
              width: 100%;
              display: block;
              text-align: center;
            }

            .invoice-box table tr.information table td {
              width: 100%;
              display: block;
              text-align: center;
            }
          }

          /** RTL **/
          .invoice-box.rtl {
            direction: rtl;
            font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
          }

          .invoice-box.rtl table {
            text-align: right;
          }

          .invoice-box.rtl table tr td:nth-child(2) {
            text-align: left;
          }
        </style>
      </head>

      <body>
        <div class="invoice-box" id="invoice">
          <table cellpadding="0" cellspacing="0">
            <tr class="top">
              <td colspan="2">
                <table>
                  <tr>
                    <td class="title">
                      <img src="https://firebasestorage.googleapis.com/v0/b/fir-dd2bd.appspot.com/o/logo.png?alt=media&token=6b06ac79-04a6-40f8-a2fb-dec7bdad0ce4" style="width: 100%; max-width: 300px" />
                    </td>

                    <td>
                      <strong>INVOICE #: ${data.service.serviceId}</strong><br />
                      Date: ${today}<br />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr class="information">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                      <strong>${data.vendor.firstName} ${data.vendor.firstName}</strong><br />
                      ${data.vendor.email}<br />
                      ${data.vendor.contactNumber}<br />
                    </td>

                    <td>
                    <strong>${data.client.firstName} ${data.client.firstName}</strong><br/>
                      ${data.client.email}<br />
                      ${data.client.contactNumber}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr class="heading">
              <td>Location for service</td>

              <td></td>
            </tr>

            <tr class="details">
              <td>${data.address.address}</td>

              <td></td>
            </tr>

            <tr class="heading">
              <td>DESCRIPTION</td>

              <td>PRICE</td>
            </tr>

            <tr class="item">
              <td>${data.service.serviceTitle}</td>

              <td>$${data.service.price}</td>
            </tr>

            <tr class="item">
              <td>APPLICATION FEE(10%)</td>

              <td>$${applicationFee}</td>
            </tr>
            <tr class="total">
              <td>TOTAL:</td>
              <td>$${total}</td>
            </tr>
          </table>
        </div>
      </body>
    </html>

  `;
  const invoiceDiv = document.getElementById('invoice');
  return invoiceDiv.innerHTML;
}

module.exports = app
