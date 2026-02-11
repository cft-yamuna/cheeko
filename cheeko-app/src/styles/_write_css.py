
import sys, os, base64

# Read the base64 encoded CSS from stdin
b64data = sys.stdin.read()
css_bytes = base64.b64decode(b64data)
css_text = css_bytes.decode('utf-8')

path = r'C:\Users\abrah\Desktop\all-activities\cheeko-new-website\cheeko-app\src\styles\LandingPage.css'
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, 'w', encoding='utf-8') as f:
    f.write(css_text)
print(f'Written {len(css_text)} characters to {path}')
