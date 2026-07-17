import io
import urllib.request

import numpy as np
from PIL import Image

img = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8), "RGB")
buf = io.BytesIO()
img.save(buf, "JPEG")

boundary = "----boundary"
body = (
    b"--"
    + boundary.encode()
    + b'\r\nContent-Disposition: form-data; name="image"; filename="t.jpg"\r\nContent-Type: image/jpeg\r\n\r\n'
    + buf.getvalue()
    + b"\r\n--"
    + boundary.encode()
    + b"--\r\n"
)

url = "http://localhost:8083/classify"
req = urllib.request.Request(
    url,
    data=body,
    headers={"Content-Type": "multipart/form-data; boundary=" + boundary},
)
resp = urllib.request.urlopen(req)
print(resp.read().decode())
