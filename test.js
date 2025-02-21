const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

app.get('/', async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'Thiếu tham số url' });
        }

        const response = await axios.post(
            'https://getvidfb.com/',
            new URLSearchParams({
                'url': url,
                'lang': 'en',
                'type': 'redirect'
            }),
            {
                headers: {
                    'authority': 'getvidfb.com',
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'cache-control': 'max-age=0',
                    'origin': 'https://getvidfb.com',
                    'referer': 'https://getvidfb.com/',
                    'sec-fetch-mode': 'navigate',
                    'sec-fetch-site': 'same-origin',
                    'sec-fetch-user': '?1',
                    'upgrade-insecure-requests': '1',
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36'
                }
            }
        );


        // Load HTML vào Cheerio
        const $ = cheerio.load(response.data);
        let filteredLinks = [];

        // Lấy nội dung của thẻ h3 bên trong class "snaptikmiddle"
        let title = $('h3').text().trim() || "Không tìm thấy tiêu đề";

        // Tìm tất cả các thẻ <a> và lọc link có định dạng mong muốn
        $('a').each((index, element) => {
            let href = $(element).attr('href');
            if (href && (href.startsWith('https://scontent') || href.startsWith('https://video'))) {
                // Xóa `&dl=1&dl=1` nếu có
                href = href.replace(/&dl=1(&dl=1)?$/, '');
                filteredLinks.push(href);
            }
        });

        res.json({
            title: title,
            filtered_links: filteredLinks.length ? filteredLinks : "Không tìm thấy link phù hợp"
        });

    } catch (error) {
        res.status(500).json({ error: 'Có lỗi xảy ra', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});