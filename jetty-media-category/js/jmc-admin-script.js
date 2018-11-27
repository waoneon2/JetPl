(function ($) {
  'use strict'
  $(document).ready(function( $ ){
  	if($('#bulk-action-selector-top').length !== 0){
  		var om = $('#bulk-action-selector-top option[value=-1]');
  		om.last().css({
  			"color":"#000",
  			"font-size":"15px",
  			"font-weight": "bold"
  		}).attr('disabled', true);
		}
	});
	
	$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
    if (originalOptions.data && originalOptions.data.action === 'save-attachment-compat') {
      var id = originalOptions.data.id;
      var data = {};
      var omit = [ 'attachments[' + id + '][category]'
                 , 'attachments[' + id + '][media_category]'
                 , 'attachments[' + id + '][media_tag]'
                 , 'attachments[' + id + '][post_tag]'
                 ];
      for (var key in originalOptions.data) {
        if ({}.hasOwnProperty.call(originalOptions.data, key)) {
          if (omit.indexOf(key) === -1) {
            data[key] = originalOptions.data[key];
          }
        }
      }
      options.data = buildQuery(data);
    }
  });

  function buildQuery(obj) {
    var args = []
    for (var key in obj) {
      destructure(key, obj[key])
		}
		

    return args.join("&")

    function destructure(key, value) {
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
          destructure(key + "[" + i + "]", value[i])
        }
      }
      else if (Object.prototype.toString.call(value) === "[object Object]") {
        for (var i in value) {
          destructure(key + "[" + i + "]", value[i])
        }
      }
      else args.push(encodeURIComponent(key) + (value != null && value !== "" ? "=" + encodeURIComponent(value) : ""))
    }
  }
})(jQuery)
