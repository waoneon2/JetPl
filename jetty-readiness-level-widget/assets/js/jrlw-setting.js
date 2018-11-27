jQuery(document).ready(function($) {
    jrlw_hide_remove();
    // add pejabat
    $(document).on("click", ".jrlw-addmore", function(e) {
        e.preventDefault();
        jrlw_addmore();
    });
    // remove pejabat
    $(document).on("click", ".jrlw-remove", function(e) {
        e.preventDefault();
        jrlw_remove();
    });

    // FUNCTION
    function jrlw_addmore() {
        var count_html  = $(".jrlw-form-count");
        if(isNaN($(".jrlw-form-count").val())) {
            var count = 1;
        } else {
            var count = parseInt($(".jrlw-form-count").val());
        }

        var count_next  = count + 1;

        $(".jrlw-form-level"+count_next).show();
        $(".jrlw-form-level"+count_next+" .jrlw-inputs").removeAttr('disabled', 'disabled');

        //console.log(count);
        if (count_next > 20) {
            count_html.val(20);
        } else {
            count_html.val(count_next);
        }
        jrlw_hide_remove();
    }

    function jrlw_remove() {
        var count_html  = $(".jrlw-form-count");
        var count       = parseInt($(".jrlw-form-count").val());
        var count_prev  = count - 1;

        $(".jrlw-form-level"+count).hide();
        $(".jrlw-form-level"+count+" .jrlw-inputs").attr('disabled', 'disabled');


        if (count_prev < 1) {
            count_html.val(0);
        } else {
            count_html.val(count_prev);
        }
        jrlw_hide_remove();
    }

    function jrlw_hide_remove() {
        var count       = parseInt($(".jrlw-form-count").val());

        if (count <= 1) {
            $(".jrlw-remove").hide();
        }

        if (count > 1) {
            $(".jrlw-remove").show();
        }
    }
});
