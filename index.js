import * as util from 'util'
import { writeFile } from 'fs'

import cheerio from 'cheerio'
import got from 'got'
import * as win1251 from 'windows-1251'

/*
<TITLE>Мультфильм &quot;Приключения Стремянки и Макаронины (часть 2)&quot; (Чехословакия, 1989 г.) (Приключения Стремянки и Макаронины)</TITLE>
<META property="og:type" content="video">
<META property="og:image" content="https://mults.info/screen/staflik_a_spagetka.jpg">
<META property="og:video" content="https://mults.info/mp4/staflik_a_spagetka.mp4">
<META property="og:video:type" content="video/mp4">
<META property="og:duration" content="5658">
<META property="og:title" content="">
<META property="og:description" content="13 серий:&lt;BR&gt;
1. Правильный тон&lt;BR&gt;
..
13. Наконец-то хороший поступок">
*/

class Scraper {

    async scrape(url) {
        let extract = await this.parsePage(url)
        //console.log(JSON.stringify(extract))
        return extract
    }

    async parsePage(url){
        const body = await got(url, {
            resolveBodyOnly: true,
            responseType: 'buffer'
        });
        const html = win1251.decode(body.toString('binary'))

        const $ = cheerio.load(html)

        const extract = {
            type:   $('META[property="og:type"]').attr('content'),
            title:  $('TITLE').prop('innerText'),
            description:  $('META[property="og:description"]').attr('content'),
            image:  $('META[property="og:image"]').attr('content'),
            video:  $('META[property="og:video"]').attr('content')
        }

        return extract
    }
}



// scrape site
const MAIN_PAGE = 'https://mults.info/mults/?id=%s'
const numPages = 1000
const scraper = new Scraper()
const result = {
    page: {
        url: MAIN_PAGE
    },
    items: []
}

for(let id = 1; id < numPages + 1; id++){
    console.log(`Processing page ${id} / ${numPages}`)
    result.items.push(await scraper.scrape(util.format(MAIN_PAGE, id)))
}
console.log(result)

await writeFile('test.json', JSON.stringify(result), 'utf8', () => {
    console.log('file saved.')
});
