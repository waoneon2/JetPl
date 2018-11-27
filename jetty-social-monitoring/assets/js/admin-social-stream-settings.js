(function ( $ ) {
	"use strict";

	$(function () {

	});

	$(document).ready(function( $ ){
		$("span#social-term-help").click(function(e) {
			e.preventDefault();
			var SocialName = $(this).data('social');
			$("div.jetty_smm_"+SocialName+"_help").toggle("slow");
		});
	});

}(jQuery));