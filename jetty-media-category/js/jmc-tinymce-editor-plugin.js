(function() {
    function jmcCategory(){

    }
    function jmcTag(){

    }
    tinymce.PluginManager.add('jmc_tinymce_button', function(editor, url) {
        editor.addButton('jmc_tinymce_button', {
            icon: false,
            text: "Jetty Media Category",
            onclick: function() {
                editor.windowManager.open({
                    title: "Insert Jetty Media Category Shortcode",
                    width: 465,
                    height: 418,
                    body: [
                    {
                        type: 'listbox',
                        name: 'jmctypeshortcode',
                        label: 'Type of Shortcode',
                        'values': [
                            {text: 'Media', value: 'media'},
                            {text: 'Video', value: 'video'},
                        ]
                    },
                    {
                        type: 'listbox',
                        name: 'jmcpublishdate',
                        label: 'Display publish date ?',
                        'values': [
                            {text: 'Yes', value: 'true'},
                            {text: 'No', value: 'false'},
                        ]
                    },
                    {
                        type: 'listbox',
                        name: 'jmcprivatepost',
                        label: 'Display private post ?',
                        'values': [
                            {text: 'Yes', value: 'true'},
                            {text: 'No', value: 'false'},
                        ]
                    },
                    {
                        type: 'textbox',
                        subtype: 'number',
                        name: 'jmcpostperpage',
                        label: 'Posts per page',
                        value: 0
                    },
                    {
                        type: 'textbox',
                        name: 'jmcslider',
                        placeholder: 'excerpt,full, or number of characters',
                        label: 'Slider',
                        value: ''
                    },
                    {
                        type: 'textbox',
                        name: 'jmccategory',
                        placeholder: 'multiple slug using comma separate',
                        label: 'Category Slug',
                        value: ''
                    },
                    {
                        type: 'textbox',
                        name: 'jmctag',
                        placeholder: 'multiple slug using comma separate',
                        label: 'Tag Slug',
                        value: ''
                    },
                    {
                        type: 'textbox',
                        name: 'jmcexcludetag',
                        placeholder: 'multiple Slug using comma separate',
                        label: 'Exclude Tag Slug',
                        value: ''
                    },
                    {
                        type: 'listbox',
                        name: 'jmclayout',
                        label: 'Layout for Video type',
                        'values': [
                            {text: 'Vertical', value: 'vertical'},
                            {text: 'Horizontal', value: 'horizontal'},
                        ]
                    },
                    {
                        type: 'listbox',
                        name: 'jmcexcerpt',
                        label: 'Show Excerpt for Video type',
                        'values': [
                            {text: 'No', value: 'false'},
                            {text: 'Yes', value: 'true'},
                        ]
                    }],
                    onsubmit: function(e) {
                        var typeShortcode = e.data.jmctypeshortcode;
                        var bollPublishDate = e.data.jmcpublishdate;
                        var bollPrivatePost = e.data.jmcprivatepost;
                        var postPerPage = (e.data.jmcpostperpage <= 0) ? 0 : e.data.jmcpostperpage;
                        var sliderOption = (e.data.jmcslider) ? 'slider='+e.data.jmcslider : '';
                        var catSlug = (e.data.jmccategory) ? 'category_slugs='+e.data.jmccategory : '';
                        var tagSlug = (e.data.jmctag) ? 'tag_slugs='+e.data.jmctag : '';
                        var excludeTag = (e.data.jmcexcludetag) ? 'exclude_tag='+e.data.jmcexcludetag : ''; 
                        var videoLayout = e.data.jmclayout;
                        var videoExcerpt = e.data.jmcexcerpt;

                        var shortCode = '';

                        if("media" === typeShortcode){
                            shortCode = '[media-listing '+catSlug+' '+tagSlug+' private='+bollPrivatePost+' '+sliderOption+' '+excludeTag+' display_date='+bollPublishDate+' number='+postPerPage+']';
                        } else {
                            shortCode = '[video-listing '+catSlug+' '+tagSlug+' private='+bollPrivatePost+' '+sliderOption+' '+excludeTag+' show_excerpt='+videoExcerpt+' layout='+videoLayout+' display_date='+bollPublishDate+' number='+postPerPage+']';
                        }
                        editor.insertContent(shortCode);
                    }
                });
            }
        });
    });
})();