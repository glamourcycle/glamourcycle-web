#!/usr/bin/env python3
"""Export approved, available outfit records and copy photos for GitHub Pages.
No credentials or private donor fields are written to the website.
"""
import json
import os
from pathlib import Path
import re
import tempfile
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
FIELDS = ['Catalog number', 'Title', 'Category', 'Size', 'Description', 'Condition', 'Photos', 'Status', 'Approved for website']
MAX_PHOTO_BYTES = 12 * 1024 * 1024


def main():
    token = os.environ.get('AIRTABLE_TOKEN', '')
    base = os.environ.get('AIRTABLE_BASE_ID', '')
    table = os.environ.get('AIRTABLE_TABLE_ID', '')
    if not token or not re.fullmatch(r'app[A-Za-z0-9]+', base) or not re.fullmatch(r'tbl[A-Za-z0-9]+', table):
        raise SystemExit('Set AIRTABLE_TOKEN, AIRTABLE_BASE_ID (app...), and AIRTABLE_TABLE_ID (tbl...) as GitHub secrets.')
    query = [('filterByFormula', "AND({Approved for website}=1,{Status}='Available')"), ('pageSize', '100')]
    query += [('fields[]', field) for field in FIELDS]
    records, offset = [], None
    while True:
        params = query + ([('offset', offset)] if offset else [])
        req = Request(f'https://api.airtable.com/v0/{base}/{table}?{urlencode(params)}', headers={'Authorization': f'Bearer {token}'})
        with urlopen(req, timeout=30) as response:
            page = json.load(response)
        records.extend(page['records'])
        offset = page.get('offset')
        if not offset:
            break
    items, seen = [], set()
    # Complete all validation and downloads before replacing the public catalog.
    with tempfile.TemporaryDirectory() as scratch:
        staging = Path(scratch)
        for record in records:
            f = record['fields']
            identifier = str(f.get('Catalog number', '')).strip()
            if not re.fullmatch(r'[A-Za-z0-9_-]{1,64}', identifier) or identifier in seen:
                raise ValueError('Approved records must have unique catalog numbers using letters, numbers, hyphens, or underscores.')
            seen.add(identifier)
            title = str(f.get('Title', '')).strip()
            photos = f.get('Photos', [])
            if not title or not photos:
                raise ValueError(f'{identifier}: add a Title and at least one Photo before approving.')
            if f.get('Category') not in ('Lehenga', 'Kurta set', 'Dress', 'Skirt set'):
                raise ValueError(f'{identifier}: choose one of the documented categories.')
            url = photos[0]['url']
            parsed = urlparse(url)
            if parsed.scheme != 'https' or not (parsed.hostname or '').endswith('.airtableusercontent.com'):
                raise ValueError(f'{identifier}: unexpected attachment host.')
            with urlopen(url, timeout=45) as response:
                mime = response.headers.get_content_type()
                extension = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp'}.get(mime)
                if not extension:
                    raise ValueError(f'{identifier}: upload a JPEG, PNG, or WebP photo.')
                photo = response.read(MAX_PHOTO_BYTES + 1)
                if len(photo) > MAX_PHOTO_BYTES:
                    raise ValueError(f'{identifier}: first photo exceeds 12 MB; resize it before publishing.')
            filename = f'airtable-{identifier}.{extension}'
            (staging / filename).write_bytes(photo)
            description = str(f.get('Description', '')).strip()
            condition = str(f.get('Condition', '')).strip()
            if condition:
                description += (' ' if description else '') + f'Condition: {condition}.'
            items.append({'id': identifier, 'title': title, 'category': f['Category'], 'size': str(f.get('Size', 'Ask our team')), 'image': f'assets/{filename}', 'status': 'Available', 'description': description, 'verified': True})
        for p in staging.iterdir():
            (ROOT / 'assets' / p.name).write_bytes(p.read_bytes())
        (ROOT / 'data/outfits.json').write_text(json.dumps(items, indent=2) + '\n')
        config = ROOT / 'config.js'
        config.write_text(re.sub(r'catalogSource:\s*[\'"](?:original|airtable)[\'"]', 'catalogSource: "airtable"', config.read_text()))
        keep = {Path(item['image']).name for item in items}
        for p in (ROOT / 'assets').glob('airtable-*'):
            if p.name not in keep:
                p.unlink()
    print(f'Published catalog prepared: {len(items)} approved, available outfits.')


if __name__ == '__main__':
    main()
