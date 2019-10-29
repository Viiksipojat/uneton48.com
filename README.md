# Uneton

Hello this is the tasty Ghost theme for [uneton48.com](https://uneton48.com), loosely based on [Casper](https://github.com/TryGhost/Casper).

![uneton48.com landing screenshot 2019](./assets/screenshot.png?raw=true)


# First time using a Ghost theme?

First you need to [set up a local copy](https://ghost.org/docs/install/local/) of [Ghost](https://github.com/TryGhost/Ghost). Then clone this repository into `GHOST_INSTALL_DIR/content/themes/` directory.

Ghost uses a simple templating language called [Handlebars](http://handlebarsjs.com/) for its themes. Go to [theme API documentation](https://themes.ghost.org) for you everyday theme development.

**The main files are:**

- `default.hbs` - The main template file
- `index.hbs` - Used for the home page
- `post.hbs` - Used for individual posts
- `page.hbs` - Used for individual pages
- `tag.hbs` - Used for tag archives
- `author.hbs` - Used for author archives


# Theme development

Casper styles are compiled using Gulp/PostCSS to polyfill future CSS spec. You'll need [Node](https://nodejs.org/) (and npm) installed globally. After that, from the theme's root directory:

```bash
$ npm install
$ gulp
```

Now edits to `css`, `js` and `hbs` files will be live reloaded in browser. Files in `assets/css/` and `assets/js/` will be compiled to `/assets/built/` automatically.

The `zip` Gulp task packages the theme files into `dist/uneton.zip`, which you can then upload to your site.

```bash
$ gulp zip
```

## PostCSS Features Used

- [Autoprefixer](https://github.com/postcss/autoprefixer) - Don't worry about writing browser prefixes of any kind, it's all done automatically with support for the latest 2 major versions of every browser.
- [Variables](https://github.com/postcss/postcss-custom-properties) - Simple pure CSS variables
- [Color Function](https://github.com/postcss/postcss-color-function)
- [Nested](https://github.com/postcss/postcss-nested) - Sass/SCSS style nesting
- [SCSS](https://github.com/postcss/postcss-scss) - // Inline comments for css 😅


## SVG Icons

Casper uses inline SVG icons, included via Handlebars partials. You can find all icons inside `/partials/icons`. To use an icon just include the name of the relevant file, eg. To include the SVG icon in `/partials/icons/rss.hbs` - use `{{> "icons/rss"}}`.

You can add your own SVG icons in the same manner.


# Copyright & License

Viiksipojat 2019. MIT
