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


const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_MAILER_CLIENT_ID = '384103339430-27qqhu0at6qnh5of61onuvicaf1094kg.apps.googleusercontent.com'
const GOOGLE_MAILER_CLIENT_SECRET = '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'
const GOOGLE_MAILER_REFRESH_TOKEN = '1//04hMr66cGLALOCgYIARAAGAQSNwF-L9IrDapDARzYOx-pZV964EdVepXqqLMVYhpU3QVIJKzA9VPX_5bqLgdA3htPTq_Ywe__3IA'
const ADMIN_EMAIL_ADDRESS = 'bookit032023@gmail.com'

const myOAuth2Client = new OAuth2Client(
GOOGLE_MAILER_CLIENT_ID,
GOOGLE_MAILER_CLIENT_SECRET
)
myOAuth2Client.setCredentials({
refresh_token: GOOGLE_MAILER_REFRESH_TOKEN
})

app.post('/export', async (req, res) => {
    const { id } = req.body
    console.log(req.body.id);
    //var data = await getBooking(bookingId);
    //data = data[0];
    //res.json(bookingId);
  });


app.post('/email/send/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        var data = await getBooking(bookingId);
        data = data[0];
        email = data.client.email;
        emailCC = data.vendor.email;
        subject =  'Invoice #' + data.service.serviceId;
        content =  generateInvoiceContent(bookingId, data);

        const myAccessTokenObject = await myOAuth2Client.getAccessToken()
        const myAccessToken = myAccessTokenObject?.token
        const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: ADMIN_EMAIL_ADDRESS,
            clientId: GOOGLE_MAILER_CLIENT_ID,
            clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
            refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
            accessToken: myAccessToken
        }
        })
        const mailOptions = {
            to: email,
            cc: emailCC,
            subject: subject,
            html: content,
            headers: {
                'Content-Type': 'text/html'
            }
        };
        await transport.sendMail(mailOptions)
        res.status(200).json({ message: 'Email sent successfully.' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ errors: error.message })
    }
})

function generateInvoiceContent(bookingId, data) {
    var total = 0;
    var applicationFee = data.service.price/100*10;
    total = parseInt(data.service.price) + parseInt(applicationFee);
    const timeZone = 'America/New_York';
    const today = moment().tz(timeZone).format('MMMM DD, YYYY');
    return `
    <div id="invoice">
        <div class="aHl"></div>
        <div id=":4ob" tabindex="-1"></div>
        <div id=":4lr" class="ii gt" jslog="20277; u014N:xr6bB; 1:WyIjdGhyZWFkLWY6MTc2MTczODQ4OTMxMjM5MDg3NSIsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsW11d; 4:WyIjbXNnLWY6MTc2MTc5MzE5OTE0MzI4Mjg0NiIsbnVsbCxbXV0.">
        <div id=":4ls" class="a3s aiL msg-2308682559127387126">
            <u></u>
            <div style="background-color:#d6d6d5;margin:0;min-width:100%;padding:0;width:100%">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#d6d6d5;border:none;border-collapse:collapse;border-spacing:0;width:100%" bgcolor="#d6d6d5">
                <tbody>
                <tr>
                    <td align="center">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;max-width:700px;width:100%">
                        <tbody>
                        <tr>
                            <td style="background-color:#fff" align="center">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;margin:auto;max-width:700px;width:100%">
                                <tbody>
                                <tr>
                                    <td align="center">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#fff;border:none;border-collapse:collapse;border-spacing:0;margin:auto;width:100%" bgcolor="#ffffff">
                                        <tbody>
                                        <tr>
                                            <td align="center">
                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                <tbody>
                                                <tr>
                                                    <td align="center" style="background-color:#fff">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                        <tbody>
                                                        <tr>
                                                            <td>
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td bgcolor="#ffffff">
                                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                        <tbody>
                                                                        <tr>
                                                                            <td align="left" style="direction:ltr;text-align:left">
                                                                            <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                <tbody>
                                                                                <tr>
                                                                                    <td bgcolor="#c6daff" style="direction:ltr;text-align:left">
                                                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                        <tbody>
                                                                                        <tr>
                                                                                            <td width="14" style="direction:ltr;text-align:left">&nbsp;</td>
                                                                                            <td align="left" style="direction:ltr;text-align:left">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                <tbody>
                                                                                                <tr>
                                                                                                    <td align="center">
                                                                                                    <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t11of12" align="center" style="border:none;border-collapse:collapse;border-spacing:0;max-width:616px;width:100%">
                                                                                                        <tbody>
                                                                                                        <tr>
                                                                                                            <td align="center" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important">
                                                                                                            <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t10of12" align="center" style="border:none;border-collapse:collapse;border-spacing:0;max-width:560px;width:100%">
                                                                                                                <tbody>
                                                                                                                <tr>
                                                                                                                    <td width="12" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">&nbsp;</td>
                                                                                                                    <td style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">
                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                        <tbody>
                                                                                                                        <tr>
                                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                                <tbody>
                                                                                                                                <tr>
                                                                                                                                    <td class="m_-2308682559127387126logo" align="left" style="padding-top:45px;padding-bottom:40px;direction:ltr;text-align:left" valign="middle">
                                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                                        <tbody>
                                                                                                                                        
                                                                                                                                        </tbody>
                                                                                                                                    </table>
                                                                                                                                    </td>
                                                                                                                                </tr>
                                                                                                                                </tbody>
                                                                                                                            </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                    </td>
                                                                                                                    <td width="12" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">&nbsp;</td>
                                                                                                                </tr>
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                            </td>
                                                                                            <td width="14" style="direction:ltr;text-align:left">&nbsp;</td>
                                                                                        </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                    </td>
                                                                                </tr>
                                                                                </tbody>
                                                                            </table>
                                                                            </td>
                                                                        </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <span class="im">
                                                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                        <tbody>
                                                                            <tr>
                                                                            <td align="left" style="direction:ltr;text-align:left">
                                                                                <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                <tbody>
                                                                                    <tr>
                                                                                    <td bgcolor="#c6daff" width="700" valign="top" style="background-repeat:no-repeat;background-position:100% 100%;direction:ltr;text-align:left">
                                                                                        <div>
                                                                                        <div style="font-size:0;line-height:0">
                                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                <td width="14" style="direction:ltr;text-align:left">&nbsp;</td>
                                                                                                <td align="left" style="direction:ltr;text-align:left">
                                                                                                    <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                        <td align="center">
                                                                                                            <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t11of12" align="center" style="border:none;border-collapse:collapse;border-spacing:0;max-width:616px;width:100%">
                                                                                                            <tbody>
                                                                                                                <tr>
                                                                                                                <td align="center" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important">
                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t10of12" align="center" style="border:none;border-collapse:collapse;border-spacing:0;max-width:560px;width:100%">
                                                                                                                    <tbody>
                                                                                                                        <tr>
                                                                                                                        <td width="12" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">&nbsp;</td>
                                                                                                                        <td style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">
                                                                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                            <tbody>
                                                                                                                                <tr>
                                                                                                                                <td style="direction:ltr;text-align:left">
                                                                                                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                                    <tbody>
                                                                                                                                        <tr>
                                                                                                                                        <td align="left" style="font-size:0;direction:ltr;text-align:left">
                                                                                                                                            <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t7of12" style="border:none;border-collapse:collapse;border-spacing:0;display:inline-block;max-width:392px;vertical-align:bottom;width:100%">
                                                                                                                                            <tbody>
                                                                                                                                                <tr>
                                                                                                                                                <td style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">
                                                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                                                    <tbody>
                                                                                                                                                        <tr>
                                                                                                                                                        <td class="m_-2308682559127387126Uber18_p3 m_-2308682559127387126header_h3" style="color:#000;font-family:uber18-medium,Helvetica,Arial,sans-serif;font-size:34px;line-height:38px;padding-bottom:13px;direction:ltr;text-align:left">Thanks for your service, ${data.client.firstName} ${data.client.firstName}</td>
                                                                                                                                                        </tr>
                                                                                                                                                        <tr>
                                                                                                                                                        <td class="m_-2308682559127387126Uber18_text_p1" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;direction:ltr;text-align:left">
                                                                                                                                                            <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t6of12" align="left" style="border:none;border-collapse:collapse;border-spacing:0;max-width:308px;width:100%">
                                                                                                                                                            <tbody>
                                                                                                                                                                <tr>
                                                                                                                                                                <td style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">
                                                                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                                                    <tbody>
                                                                                                                                                                        <tr>
                                                                                                                                                                        </tr>
                                                                                                                                                                    </tbody>
                                                                                                                                                                    </table>
                                                                                                                                                                </td>
                                                                                                                                                                </tr>
                                                                                                                                                            </tbody>
                                                                                                                                                            </table>
                                                                                                                                                        </td>
                                                                                                                                                        </tr>
                                                                                                                                                    </tbody>
                                                                                                                                                    </table>
                                                                                                                                                </td>
                                                                                                                                                </tr>
                                                                                                                                            </tbody>
                                                                                                                                            </table>
                                                                                                                                        </td>
                                                                                                                                        </tr>
                                                                                                                                    </tbody>
                                                                                                                                    </table>
                                                                                                                                </td>
                                                                                                                                </tr>
                                                                                                                            </tbody>
                                                                                                                            </table>
                                                                                                                        </td>
                                                                                                                        <td width="12" style="font-size:1px;height:1px;line-height:1px;padding-left:0!important;padding-right:0!important;direction:ltr;text-align:left">&nbsp;</td>
                                                                                                                        </tr>
                                                                                                                    </tbody>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                                </tr>
                                                                                                            </tbody>
                                                                                                            </table>
                                                                                                        </td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                    </table>
                                                                                                </td>
                                                                                                <td width="14" style="direction:ltr;text-align:left">&nbsp;</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                        </div>
                                                                                    </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                                </table>
                                                                            </td>
                                                                            </tr>
                                                                        </tbody>
                                                                        </table>
                                                                    </span>
                                                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%;margin-bottom:20px">
                                                                        <tbody>
                                                                        <tr>
                                                                            <td align="center">
                                                                            <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                <tbody>
                                                                                <tr>
                                                                                    <td align="center">
                                                                                    <table class="m_-2308682559127387126receipt_body" width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%" bgcolor="#ffffff">
                                                                                        <tbody>
                                                                                        <tr>
                                                                                            <td align="left" bgcolor="#ffffff" style="padding:45px 14px 0;direction:ltr;text-align:left">
                                                                                            <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                <tbody>
                                                                                                <tr>
                                                                                                    <td align="center">
                                                                                                    <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t10of12" style="border:none;border-collapse:collapse;border-spacing:0;max-width:560px;width:100%">
                                                                                                        <tbody>
                                                                                                        <tr>
                                                                                                            <td style="padding-left:0;padding-right:0">
                                                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                <tbody>
                                                                                                                <tr>
                                                                                                                    <td align="left" style="padding-left:12px;padding-right:12px">
                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                        <tbody>
                                                                                                                        <tr>
                                                                                                                            <td class="m_-2308682559127387126Uber18_p3 m_-2308682559127387126total_head" valign="top" align="left" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:44px;line-height:44px;padding-right:12px;direction:ltr;text-align:left">Total</td>
                                                                                                                            <td class="m_-2308682559127387126Uber18_p3 m_-2308682559127387126total_head" valign="top" align="right" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:44px;line-height:44px;text-align:right;direction:ltr">CA$ ${total}</td>
                                                                                                                        </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                <tbody>
                                                                                                                <tr>
                                                                                                                    <td align="left" style="padding-left:12px;padding-right:12px">
                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                        <tbody>
                                                                                                                        <tr>
                                                                                                                            <td style="padding-top:26px;padding-bottom:26px">
                                                                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                <tbody>
                                                                                                                                <tr>
                                                                                                                                    <td valign="top" align="left" style="font-size:1px;line-height:1px;background-color:#009eb7">&nbsp;</td>
                                                                                                                                </tr>
                                                                                                                                </tbody>
                                                                                                                            </table>
                                                                                                                            </td>
                                                                                                                        </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                <tbody>
                                                                                                                <tr>
                                                                                                                    <td align="left" style="padding-left:12px;padding-right:12px">
                                                                                                                    <span class="im">
                                                                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                            <td class="m_-2308682559127387126Uber18_text_p3" valign="top" align="left" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:12px;padding-top:5px;direction:ltr;text-align:left">${data.service.serviceTitle}</td>
                                                                                                                            <td class="m_-2308682559127387126Uber18_text_p3" valign="top" align="right" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-top:5px;text-align:right;direction:ltr">CA$ ${data.service.price}</td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                        </table>
                                                                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                            <td class="m_-2308682559127387126Uber18_text_p1" valign="top" align="left" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:12px;padding-top:5px;direction:ltr;text-align:left">Application Fee (10%)
                                                                                                                            </td>
                                                                                                                            <td class="m_-2308682559127387126Uber18_text_p1" valign="top" align="right" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:28px;padding-bottom:5px;padding-right:0;padding-top:5px;text-align:right;direction:ltr">CA$ ${applicationFee}</td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                        </table>
                                                                                                                    </span>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                            
                                                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                <tbody>
                                                                                                                <tr>
                                                                                                                    <td style="padding-top:26px;padding-bottom:26px">
                                                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                        <tbody>
                                                                                                                        <tr>
                                                                                                                            <td valign="top" align="left" style="font-size:1px;line-height:1px;background-color:#bdbdbd">&nbsp;</td>
                                                                                                                        </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                                </tbody>
                                                                                                            </table>
                                                                                                            <span class="im">
                                                                                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border:none;border-collapse:collapse;border-spacing:0;direction:rtl;width:100%">
                                                                                                                <tbody>
                                                                                                                    <tr>
                                                                                                                    <td valign="top" align="left" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:0;line-height:28px;padding:5px 12px;text-align:left;direction:ltr">
                                                                                                                        <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;width:100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                                <table border="0" cellpadding="0" cellspacing="0" class="m_-2308682559127387126t7of12" style="border:none;border-collapse:collapse;border-spacing:0;direction:ltr;display:inline-block;max-width:392px;vertical-align:top;width:100%">
                                                                                                                                <tbody>
                                                                                                                                    <tr>
                                                                                                                                    <td style="padding:6px 0;direction:ltr;text-align:left">
                                                                                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" align="left" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:fixed;width:100%">
                                                                                                                                        <tbody>
                                                                                                                                            <tr>
                                                                                                                                            <td style="direction:ltr;text-align:left">
                                                                                                                                                <table border="0" cellpadding="0" cellspacing="0" style="border:none;border-collapse:collapse;border-spacing:0;table-layout:auto;width:100%">
                                                                                                                                                <tbody>
                                                                                                                                                    <tr>
                                                                                                                                                    <td align="left" class="m_-2308682559127387126Uber18_text_p2" style="color:#000;font-family:UberMoveText,open sans,helvetica neue,Helvetica,sans-serif;font-size:16px;line-height:20px;text-align:left;direction:ltr">
                                                                                                                                                        <a href="${data.booking.invoiceURL}" style="text-decoration:none;color:#276ef1" target="_blank">Download PDF</a>
                                                                                                                                                    </td>
                                                                                                                                                    </tr>
                                                                                                                                                </tbody>
                                                                                                                                                </table>
                                                                                                                                            </td>
                                                                                                                                            </tr>
                                                                                                                                        </tbody>
                                                                                                                                        </table>
                                                                                                                                    </td>
                                                                                                                                    </tr>
                                                                                                                                </tbody>
                                                                                                                                </table>
                                                                                                                            </td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                        </table>
                                                                                                                    </td>
                                                                                                                    </tr>
                                                                                                                </tbody>
                                                                                                                </table>
                                                                                                            </span>
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                    </td>
                                                                                </tr>
                                                                                </tbody>
                                                                            </table>
                                                                            </td>
                                                                        </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
            <div class="yj6qo"></div>
            <div class="adL"></div>
        </div>
        </div>
        <div id=":4n3" class="ii gt" style="display:none">
        <div id=":4n4" class="a3s aiL "></div>
        </div>
        <div class="hi"></div>
    </div>
  
    `;
    const invoiceDiv = document.getElementById('invoice');
    return invoiceDiv.innerHTML;
}

app.get('/invoice/export/:id', async (req, res) => {
    const bookingId = req.params.id;
    var data = await getBooking(bookingId);
    data = data[0];
    await exportPDF(bookingId, data, res);
});

async function exportPDF(bookingId, data, res){
    console.log(data);
    const rootPath = path.join(__dirname, '../../../../');
    if(!data.booking.hasOwnProperty('invoiceURL')){
        const pdfFilePath = `${rootPath}/public/invoices/invoice_${data.service.serviceId}.pdf`;
        const htmlContent = generateInvoiceHtml(bookingId, data); 
        const pdfBuffer = await createPDF(htmlContent);
    
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
}
  
async function createPDF(htmlContent) {
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
