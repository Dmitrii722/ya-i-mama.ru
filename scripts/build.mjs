import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify as minifyHtml } from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import { minify as minifyJs } from 'terser';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const HTML_PAGES = ['index.html', 'montessori.html', 'logorhythmics.html'];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyAndOptimizeImages() {
  const srcImg = path.join(SRC, 'assets', 'images');
  const distImg = path.join(DIST, 'assets', 'images');
  await ensureDir(distImg);

  const files = await fs.readdir(srcImg);
  for (const file of files) {
    if (!/\.(webp|png|jpe?g)$/i.test(file)) continue;
    const input = path.join(srcImg, file);
    const base = path.parse(file).name;

    await sharp(input)
      .webp({ quality: 82, effort: 4 })
      .toFile(path.join(distImg, `${base}.webp`));

    await sharp(input)
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(distImg, `${base}.jpg`));
  }
}

async function buildCss() {
  const mainCss = await fs.readFile(path.join(SRC, 'css', 'main.css'), 'utf8');
  const minified = new CleanCSS({ level: 2 }).minify(mainCss);
  await ensureDir(path.join(DIST, 'css'));
  await fs.writeFile(path.join(DIST, 'css', 'main.css'), minified.styles);
}

async function buildJs() {
  const js = await fs.readFile(path.join(SRC, 'js', 'app.js'), 'utf8');
  const result = await minifyJs(js, { compress: true, mangle: true });
  await ensureDir(path.join(DIST, 'js'));
  await fs.writeFile(path.join(DIST, 'js', 'app.js'), result.code);
}

async function buildHtml() {
  for (const page of HTML_PAGES) {
    let html = await fs.readFile(path.join(SRC, page), 'utf8');

    html = html.replace(
      /src="assets\/images\/([^"]+)\.webp"/g,
      (_, name) => `src="assets/images/${name}.jpg"`
    );

    html = html.replace(
      /<picture>\s*<source srcset="assets\/images\/([^"]+)\.webp" type="image\/webp">\s*<img/g,
      (_, name) =>
        `<picture><source srcset="assets/images/${name}.webp" type="image/webp"><source srcset="assets/images/${name}.jpg" type="image/jpeg"><img`
    );

    const minified = await minifyHtml(html, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
    });

    await fs.writeFile(path.join(DIST, page), minified);
  }
}

async function copyMeta() {
  const files = ['CNAME', 'robots.txt'];
  for (const f of files) {
    const src = path.join(ROOT, f);
    try {
      await fs.copyFile(src, path.join(DIST, f));
    } catch {
      /* optional */
    }
  }
}

async function main() {
  console.log('Building ya-i-mama...');
  await fs.rm(DIST, { recursive: true, force: true });
  await ensureDir(DIST);
  await copyAndOptimizeImages();
  await buildCss();
  await buildJs();
  await buildHtml();
  await copyMeta();
  console.log('Build complete -> dist/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
