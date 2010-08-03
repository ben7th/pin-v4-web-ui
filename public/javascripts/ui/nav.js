(function($) {
  $(document).ready(function() {
    $('[original-title]').tipsy({html:true});
    $('[tip]').tipsy({html:true,title:'tip'});
  });
})(jQuery);