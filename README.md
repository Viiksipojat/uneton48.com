# Uneton

The default theme for [uneton48.com](http://uneton48.com). Loosely based to [Casper](https://github.com/TryGhost/Casper).

![screenshot-desktop](https://user-images.githubusercontent.com/120485/27221326-1e31d326-5280-11e7-866d-82d550a7683b.jpg)


# First time using a Ghost theme?

Ghost uses a simple templating language called [Handlebars](http://handlebarsjs.com/) for its themes.

We've documented our default theme pretty heavily so that it should be fairly easy to work out what's going on just by reading the code and the comments. Once you feel comfortable with how everything works, we also have full [theme API documentation](https://themes.ghost.org) which explains every possible Handlebars helper and template.

**The main files are:**

- `default.hbs` - The main template file
- `index.hbs` - Used for the home page
- `post.hbs` - Used for individual posts
- `page.hbs` - Used for individual pages
- `tag.hbs` - Used for tag archives
- `author.hbs` - Used for author archives

One really neat trick is that you can also create custom one-off templates just by adding the slug of a page to a template file. For example:

- `page-about.hbs` - Custom template for the `/about/` page
- `tag-news.hbs` - Custom template for `/tag/news/` archive
- `author-ali.hbs` - Custom template for `/author/ali/` archive


# Development

Casper styles are compiled using Gulp/PostCSS to polyfill future CSS spec. You'll need [Node](https://nodejs.org/) (and npm) installed globally. After that, from the theme's root directory:

```bash
$ npm install
$ gulp
```

Now you can edit `/assets/css/` and `/assets/js/` files, which will be compiled to `/assets/built/` automatically.

The `zip` Gulp task packages the theme files into `dist/<theme-name>.zip`, which you can then upload to your site.

```bash
$ gulp zip
```

# PostCSS Features Used

- [Autoprefixer](https://github.com/postcss/autoprefixer) - Don't worry about writing browser prefixes of any kind, it's all done automatically with support for the latest 2 major versions of every browser.
- [Variables](https://github.com/postcss/postcss-custom-properties) - Simple pure CSS variables
- [Color Function](https://github.com/postcss/postcss-color-function)
- [Nested](https://github.com/postcss/postcss-nested) - Sass/SCSS style nesting
- [SCSS](https://github.com/postcss/postcss-scss) - // Inline comments for css 😅

# SVG Icons

Casper uses inline SVG icons, included via Handlebars partials. You can find all icons inside `/partials/icons`. To use an icon just include the name of the relevant file, eg. To include the SVG icon in `/partials/icons/rss.hbs` - use `{{> "icons/rss"}}`.

You can add your own SVG icons in the same manner.


# Copyright & License

Viiksipojat 2019. MIT
