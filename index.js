const Nightmare = require('nightmare')
const nightmare = Nightmare()
const opn = require('opn');

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
            process.exit(0);
        }
    } catch (e) {
        console.error(`${new Date().toISOString()} - ${e}`);
    }
}

main();
setInterval(async () => await main(), 5 * 1000 * 60)

