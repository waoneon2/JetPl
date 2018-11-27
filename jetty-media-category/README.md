### Shortcode

Our shorcode name is **media-listing** and **video-listing**, accept parameter category and tag. So ```[media-listing category=category_id]```, category_id can be single category or
lists of category id separated by comma. The syntax to display tag is same.

You can combine parameter category and tag, but it will shows posts/media which have both the mentioned tag and category instead. In other words we use ```AND``` relationship rather than ```OR``` to perform the DB query.

#### Cheatsets
- ```[media-listing category=17]``` to display posts/media on category id 17
- ```[media-listing tag=10]``` to display posts/media on tag id 10
- ```[media-listing category=17 tag=10]``` to display posts/media on tag id 10 and have category 17. So, if one post on category 17, but it not tagged on tag 10, it will not displayed.
- ```[media-listing category=17 posts_per_page=10]``` to display posts/media on category id 17 and paginated with 10 items per page.
- ```[media-listing category=17 display_date=false]``` to display posts/media on category id 17 and not display publish dates.
- ```[media-listing category_slugs=lorem-ipsum]``` to display posts/media on category slug **lorem ipsum**.
- ```[media-listing tag_slugs=sit-doler-at-me]``` to display posts/media on tag slug **sit doler at me**.
- ```[media-listing category_slugs=lorem-ipsum number=2]``` to display posts/media on category slug **lorem ipsum** and display 2 posts/items per page.
- ```[media-listing category_slugs=lorem-ipsum number=2 pagination="false"]``` to display posts/media on category slug **lorem ipsum** and display 2 posts/items then no pagination number.
- ```[media-listing category=17 featured=true]``` to display full text of posts on category 17.
- ```[media-listing category=17 private=true]``` to include private post in the list.
- ```[media-listing category=17 slider=excerpt]``` to display posts on category **17** with display **excerpt** of a post.
- ```[media-listing category=17 slider=full]``` to display posts on category **17** with display **full text** of a post.
- ```[media-listing category=17 slider=25]``` to display posts on category **17** with display **the number of characters** (ex.25 characters) of a post.
- ```[media-listing category=17 exclude_tag=private slider=excerpt]``` to display posts on category **17** with display **excerpt** of a post and will exclude any posts/media with tag **private**.
- ```[video-listing category_slugs=lorem-ipsum]``` to display posts/media on on category slug **lorem ipsum**.
- ```[video-listing category_slugs=lorem-ipsum layout=vertical]``` to use vertical layout, possible value of layout is **vertical** and **horizontal**.
- ```[video-listing category_slugs=lorem-ipsum layout=vertical show_excerpt=true]``` to include an excerpt from the post.

### Settings

By default media/attachment will share same categories and tag with post type. But if want to use  media specific categories, you can go to settings > media. And Search media category settings. You simply check that checkbox option and we will use that custom taxonomy.