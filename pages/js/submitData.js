$(document).ready(function(){
    // References:
    var $form = $('#myForm');
    var $conf = $('#myConf');
    var $subm = $('#mySubmit');
    var $impt = $form.find(':input').not(':button, :submit, :reset, :hidden');
 // Submit function:
    $form.submit(function(){
        $.post($(this).attr('action'), $(this).serialize(), function(response){
      // On success, clear all inputs;
            $impt.val('').attr('value','').removeAttr('checked').removeAttr('selected');
   // Write a confirmation message:
            $conf.html("Submitted!");
   // Disable the submit button:
            $subm.prop('disabled', true);
        },'json');
        return false;
    });
});