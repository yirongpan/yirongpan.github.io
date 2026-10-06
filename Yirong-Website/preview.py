"""Serve the local website without retaining stale preview pages."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        suffix = Path(urlsplit(self.path).path).suffix.lower()
        if suffix in {".jpg", ".jpeg", ".png", ".webp", ".svg"}:
            self.send_header("Cache-Control", "public, max-age=3600")
        elif suffix == ".css":
            self.send_header("Cache-Control", "no-cache")
        else:
            self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    directory = Path(__file__).resolve().parent / "dist"
    handler = partial(PreviewHandler, directory=str(directory))
    with ThreadingHTTPServer(("127.0.0.1", 8001), handler) as server:
        print("Preview: http://127.0.0.1:8001", flush=True)
        server.serve_forever()
