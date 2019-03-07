require('dotenv').config();

const Nightmare = require('nightmare')
const nightmare = Nightmare()
const opn = require('opn');

const client = require('twilio')(process.env.TWILIO_ACC_ID, process.env.TWILIO_AUTH_TOKEN);

const BASE_URL = `http://www.guardamirimlondrina.org.br/editais-de-contratacao-2019/`;
const LAST_PDF = 'http://www.guardamirimlondrina.org.br/Agendamento_Entrevistas_AssProjetos00619.pdf';

function pool() {
    return new Promise((resolve, reject) => {
        nightmare
            .goto(BASE_URL)
            .wait(`.spb_toggle`)
            .evaluate(() => document.querySelector('a[href$=pdf]').href)
            .then(async (result) => {
                if (result !== LAST_PDF) {
                    resolve({
                        changed: true,
                        url: result
                    });

                } else {
                    reject("Sem Mudanças");
                }
            })
            .catch(reject)
    });
}

async function main() {
    try {
        console.info(`${new Date().toISOString()} - Polling site`)
        let result = await pool();
        if (result.changed) {
            await opn(result.url)
            console.info(`${new Date().toISOString()} - Opening new content and exiting!`)
            let sendTo = process.env.SEND_TO.split(',');
            for (let to of sendTo) {
                await sendMessage(to, result.url);
            }
            clearInterval(interval);
            process.exit(0)

        }
    } catch (e) {
        console.error(`${new Date().toISOString()} - ${e}`);
    }
}

async function sendMessage(to, url) {
    return new Promise(async resolve => {
        await client.messages
            .create({
                body: 'Resultado saiu! Veja: ' + url,
                from: 'whatsapp:+14155238886',
                to: `${to}`
            })
            .then((mesage) => {
                resolve()
                console.info(`${new Date().toISOString()} - Message sent to ${to}!`);
            });
    })
}

var interval = setInterval(async () => await main(), parseInt(process.env.POLLING_INTERVAL_MIN) * 1000 * 60)
main();

