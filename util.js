function getHTML(options = {}) {

    

    return `
        <!DOCTYPE html>
        <html>
            ${getHead()}
            <body>
                <h1>Star Wars API Demo</h1>
                <p>This page demonstrates fetching data from the Star Wars API.</p>
                <p>Check your console for the API results.</p>
                <button onclick="fetchData()">Fetch Star Wars Data</button>
                <div id="results"></div>
                ${getScript()}
                ${getFooter(options)}
            </body>
        </html>
    `;
}

function getScript() {
    return `
        <script>
            function fetchData() {
                document.getElementById('results').innerHTML = '<p>Loading data...</p>';
                fetch('/api')
                    .then(res => res.text())
                    .then(text => {
                        alert('API request made! Check server console.');
                        document.getElementById('results').innerHTML = '<p>Data fetched! Check server console.</p>';
                    })
                    .catch(err => {
                        document.getElementById('results').innerHTML = '<p>Error: ' + err.message + '</p>';
                    });
            }
        </script>
    `;
}

function getFooter(options) {
    return `
        <div class="footer">
            <p>API calls: ${options.fetch_count} | Cache entries: ${Object.keys(options.cache).length} | 
            Errors: ${options.err_count}</p>
            <pre>Debug mode: ${options.debug_mode ? "ON" : "OFF"} | Timeout: ${options.timeout}ms</pre>
        </div>
    `;
}

function getHead(){
    return `
     <head>
                    <title>Star Wars API Demo</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #FFE81F; background-color: #000; padding: 10px; }
                        button { background-color: #FFE81F; border: none; padding: 10px 20px; cursor: pointer; }
                        .footer { margin-top: 50px; font-size: 12px; color: #666; }
                        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
                    </style>
                </head>
                `;
}

module.exports = { getHTML };
