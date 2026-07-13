# Editing the website text

Most of the website copy is in `index.html`. Search for `EDIT` to find the sections intended for customization:

- Main introduction: the `.hero-copy` section
- About section: the `.about-text` section
- Footer: the `.footer-inner` section

To change a heading or paragraph, edit only the words between the HTML tags. For example:

```html index.html
<p>Replace this sentence with your own text.</p>
```

The rating descriptions and questionnaire questions are also written directly in `index.html` and `script.js` respectively. If you change questionnaire answers, keep the point values and rating limits in `script.js` unless you also want to change how scoring works.

The color palette is defined at the top of `style.css` as CSS variables:

- Black: `#000000`
- Light gray: `#DBDEDD`
- Gray: `#6F686D`
- Orange: `#FCA311`
- Dark orange: `#D98324`
