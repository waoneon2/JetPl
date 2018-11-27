(function ( $ ) {
	"use strict";

	$(function () {
	});

	$(document).ready(function( $ ){
		function jsReqAjax(){
			$('button.btn_on_inquiry').click(function(e){
				e.preventDefault();
				var postTitle = '';
				var sourcePost = '';
				var sourceTitle = '';
				var postContent = '';

				var updateText = $(this).find('.text_inquiry');

				var parentElement = $(this).parent().parent();
				var findTarget = $(parentElement).find('.inner');
				var text = $(findTarget).find('.section-text');
				var title = $(findTarget).find('.section-title');
				if(title.length !== 0){
					postTitle = $(title).text();
				} else {
					postTitle = $(text).text();
				}

				postContent = $(findTarget).html();

				sourcePost = parentElement.attr('class');

				if(sourcePost.match(/twitter/gi) !== null){
					sourceTitle = 'TWITTER';
				}

				if(sourcePost.match(/facebook/gi) !== null){
					sourceTitle = 'FACEBOOK';
				}

				if(sourcePost.match(/youtube/gi) !== null){
					sourceTitle = 'YOUTUBE';
				}

				if(sourcePost.match(/rss/gi) !== null){
					sourceTitle = 'RSS';
				}

				if(sourcePost.match(/instagram/gi) !== null){
					sourceTitle = 'INSTAGRAM';
				}

				$.ajax({
					url : ass_ajax_action.ajax_url,
					type : 'post',
					data : {
						action : 'HandleAjaxRequest',
						post_content : postContent,
						post_title : postTitle,
						source_title : sourceTitle
					},
					beforeSend : function(){
						$(updateText).html('Creating Inquiry'+'<img class="img-ajax-loading" src="'+imgurl+'">');
					},
					success : function( response ) {
						setTimeout(function(){
							$(updateText).text('Inquiry Created');
						}, 4000);
					}
				});
			});
		}

		setTimeout(function(){
			jsReqAjax();
		}, 4000);
	});
}(jQuery));