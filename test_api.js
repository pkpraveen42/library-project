const http = require('http');

http.get('http://localhost:3008/api/books', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const books = JSON.parse(data);
            console.log(`Successfully received ${books.length} books.`);
            if (books.length > 0) {
                console.log('First book titles:', books.map(b => b.title));
            }
        } catch (e) {
            console.error('Failed to parse JSON:', e.message);
            console.log('Raw data received:', data);
        }
    });
}).on('error', (err) => {
    console.error('Connection error:', err.message);
});
