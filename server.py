import os
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

DATA_DIR = 'data'
PORT = 8000


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='.', **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith('/api/data/'):
            key = parsed.path.split('/api/data/')[1]
            self.send_data(key)
        else:
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith('/api/data/'):
            key = parsed.path.split('/api/data/')[1]
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            data = json.loads(body.decode()) if body else {}
            self.save_data(key, data)
        else:
            self.send_error(404)

    def send_data(self, key):
        os.makedirs(DATA_DIR, exist_ok=True)
        filepath = os.path.join(DATA_DIR, f'{key}.json')
        try:
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                data = {}
        except Exception as e:
            print('Error reading data:', e)
            data = {}

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def save_data(self, key, data):
        os.makedirs(DATA_DIR, exist_ok=True)
        filepath = os.path.join(DATA_DIR, f'{key}.json')
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            response = {'status': 'saved'}
        except Exception as e:
            print('Error writing data:', e)
            response = {'status': 'error', 'message': str(e)}

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))


if __name__ == '__main__':
    os.makedirs(DATA_DIR, exist_ok=True)
    data_path = os.path.abspath(DATA_DIR)
    server = HTTPServer(('localhost', PORT), Handler)
    print(f'Server running at http://localhost:{PORT}')
    print(f'All data is saved here: {data_path}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down server...')
        server.shutdown()
