(function ($) {
  'use strict'
  
  function update_display_as(){
    tippy('.jmc_on_tolltip');
    
    $('.display_as_dropdown').change(function(event) {
      var $option = $(this).find('option:selected');
      var value = $option.val();

      if(value === "video-listing"){
        $('div#just_for_video_listing').show();
      } else {
        $('div#just_for_video_listing').hide();
      }
    });
  }

  $(document).on('widget-updated', function(event, widget){
      update_display_as();
  });
  $(document).on('widget-added', function(event, widget){
      update_display_as();
  });
  $(document).ready(function( $ ){
  	  update_display_as();
	});
})(jQuery)
