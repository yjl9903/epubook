import fs from 'node:fs/promises';
import path from 'node:path';

import { breadc } from 'breadc';
import {
  Cover,
  EpubPublication,
  Image,
  Navigation,
  StyleSheet,
  XHTML,
  getImageMediaType
} from '@epubook/core';
import { bundle } from '@epubook/bundler';

const language = 'zh-CN';
const baseUrl = 'https://lnovel.animes.garden';

const imgSrcRe = /<img[^>]+src=(["'])([^"']+)\1[^>]*>/gi;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${url} (${res.status})`);
  }
  return res.json();
}

async function fetchBinary(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${url} (${res.status})`);
  }
  const buffer = await res.arrayBuffer();
  return new Uint8Array(buffer);
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeAuthors(input) {
  if (!input) return { creator: null, contributors: [] };
  const list = Array.isArray(input) ? input : [input];
  const normalized = list
    .map((entry) => {
      if (typeof entry === 'string') {
        const name = entry.trim();
        return name ? { name, position: 'author' } : null;
      }
      if (typeof entry === 'object') {
        const name =
          typeof entry.name === 'string'
            ? entry.name.trim()
            : typeof entry.author === 'string'
              ? entry.author.trim()
              : '';
        if (!name) return null;
        return { name, position: entry.position || entry.role || '' };
      }
      return null;
    })
    .filter(Boolean);

  const creator =
    normalized.find((item) => item.position === 'author') ||
    normalized.find((item) => item.position === 'writer') ||
    normalized[0] ||
    null;
  const contributors = normalized.filter((item) => item !== creator);
  return { creator, contributors };
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeXhtml(html) {
  if (!html) return '';
  const withBreaks = html.replace(/<br\s*\/?>/gi, '<br/>');
  const withCenter = withBreaks
    .replace(/<center\b[^>]*>/gi, '<p class="center">')
    .replace(/<\/center>/gi, '</p>');
  return withCenter.replace(/<img([^>]*?)(?<!\/)>/gi, '<img$1/>');
}

function buildXhtml({ title, bodyHtml, cssHref, lang }) {
  const safeTitle = escapeXml(title);
  const stylesheet = cssHref ? `<link href="${cssHref}" rel="stylesheet" type="text/css" />` : '';
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${lang}" xml:lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  ${stylesheet}
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

async function localizeImages(html, rendition, imageCache) {
  const urls = new Set();
  let match = null;
  while ((match = imgSrcRe.exec(html)) !== null) {
    urls.add(match[2]);
  }

  for (const url of urls) {
    if (imageCache.has(url)) continue;
    try {
      const data = await fetchBinary(url);
      const pathname = new URL(url).pathname;
      const ext = path.extname(pathname) || '.jpg';
      const index = String(imageCache.size + 1).padStart(3, '0');
      const filename = `images/image-${index}${ext}`;
      const mediaType = getImageMediaType(filename) || getImageMediaType('image.jpg');
      if (!mediaType) {
        continue;
      }
      const image = new Image(filename, mediaType, data);
      rendition.addResource(image);
      imageCache.set(url, filename);
    } catch (error) {
      console.warn(`Failed to download image: ${url}`);
      console.warn(error);
      imageCache.set(url, null);
    }
  }

  return html.replace(imgSrcRe, (raw, quote, url) => {
    if (!imageCache.has(url)) return raw;
    const local = imageCache.get(url);
    if (!local) return '';
    return raw.replace(url, local);
  });
}

async function main(novelId, volumeId, options) {
  const volumeUrl = `${baseUrl}/bili/novel/${novelId}/vol/${volumeId}`;
  const chapterBaseUrl = `${baseUrl}/bili/novel/${novelId}/chapter/`;

  const volume = await fetchJson(volumeUrl);
  if (!volume.ok) {
    throw new Error('Volume request failed');
  }
  const volumeData = volume.data;
  const { creator, contributors } = normalizeAuthors(volumeData.authors ?? volumeData.author);

  const updatedAt = volumeData.updatedAt ? new Date(volumeData.updatedAt) : new Date();
  const epub = EpubPublication.create('OEBPS/content.opf', {
    title: volumeData.name || 'Unknown',
    language,
    description: stripHtml(volumeData.description || ''),
    source: volumeUrl,
    date: updatedAt,
    lastModified: updatedAt,
    creator: { name: creator?.name || 'BiliNovel', uid: 'creator' },
    contributor: contributors.map((item) => ({ name: item.name }))
  });
  const rendition = epub.rootfile;
  rendition.setIdentifier(volumeUrl, 'url');

  const stylesheet = new StyleSheet(
    'styles/style.css',
    [
      'p.center { text-align: center; }'
    ].join('\n')
  );
  rendition.addResource(stylesheet);

  const imageCache = new Map();
  if (volumeData.cover) {
    try {
      const coverData = await fetchBinary(volumeData.cover);
      const coverPathname = new URL(volumeData.cover).pathname;
      const coverExt = path.extname(coverPathname) || '.jpg';
      const coverFilename = `images/cover${coverExt}`;
      const coverMediaType = getImageMediaType(coverFilename) || getImageMediaType('cover.jpg');
      if (coverMediaType) {
        const coverImage = new Cover(coverFilename, coverMediaType, coverData);
        rendition.setCover(coverImage);
        imageCache.set(volumeData.cover, coverFilename);

        const coverContent = buildXhtml({
          title: 'Cover',
          lang: language,
          cssHref: 'styles/style.css',
          bodyHtml: `<div class="cover"><img src="${coverFilename}" alt="cover" /></div>`
        });
        const coverPage = new XHTML('cover.xhtml', { title: 'Cover', language }, coverContent);
        rendition.addResource(coverPage);
        rendition.spine.push(coverPage.itemref());
      }
    } catch (error) {
      console.warn('Failed to download cover image');
      console.warn(error);
    }
  }

  const navItems = [];
  for (const [index, chapterInfo] of volumeData.chapters.entries()) {
    const chapter = await fetchJson(`${chapterBaseUrl}${chapterInfo.cid}`);
    if (!chapter.ok) {
      console.warn(`Skip chapter ${chapterInfo.cid}`);
      continue;
    }
    const chapterData = chapter.data;
    const title = chapterData.title || `Chapter ${index + 1}`;
    const rawContent = normalizeXhtml(chapterData.content || '');
    const contentWithImages = await localizeImages(rawContent, rendition, imageCache);
    const chapterHtml = buildXhtml({
      title,
      lang: language,
      cssHref: 'styles/style.css',
      bodyHtml: `<h1>${escapeXml(title)}</h1>\n${contentWithImages}`
    });

    const filename = `chapter-${String(index + 1).padStart(3, '0')}.xhtml`;
    const page = new XHTML(filename, { title, language }, chapterHtml);
    rendition.addResource(page);
    rendition.spine.push(page.itemref());
    navItems.push({ title, resource: page });

    console.log(`Fetched chapter cid:${chapterInfo.cid}: ${title}`);
  }

  const navigation = new Navigation('nav.xhtml', navItems, {
    title: 'Table of Contents'
  });
  rendition.setNavigation(navigation);

  const outputPath = path.join(options.output || '.', volumeData.name + '.epub');
  const data = await bundle(epub);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, data);
  console.log(`EPUB generated: ${outputPath}`);
}

const cli = breadc('lnovel', {
  description: 'Generate EPUB from lnovel API'
});

cli
  .command('bili <nid> <vid>', 'Fetch chapters and bundle EPUB')
  .option('-o, --output <file>', 'Output EPUB file')
  .action(async (nid, vid, options) => {
    await main(nid, vid, options);
  });

cli.run(process.argv.slice(2)).catch((err) => console.error(err));
