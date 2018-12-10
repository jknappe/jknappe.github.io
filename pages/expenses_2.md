---
layout: default
title: Expense Tracker
#image: 170712-CharynCanyon.jpg
---

<FORM id="expenses" action="https://script.google.com/macros/s/AKfycbydrwmhU3oWKqieyXqedAsAz8825CKjaFh9PboC0Jx0IchSk8Y/exec">
  Value:   
    <input type="number" name="value" min="0" step="0.01" style="width:200px" required> 
  <br>
  Category:
  <br>
  Paid by: 
    <input type="radio" name="paid_by" value="Jan" checked> Jan
    <input type="radio" name="paid_by" value="Celia"> Celia
  <br>
  Date: 
    <input type="date" name="date">
  <br>
  <input type="submit" id="expenses" value="Submit Expenses">  
  <input type="reset">
</FORM>

<span id="myConf"></span></p>


<FORM>
<INPUT TYPE="button" onClick="history.go(0)" VALUE="Refresh">
</FORM>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>

<script type="text/javascript">
$(document).ready(function(){
    // References:
    var $form = $('#expenses');
    var $conf = $('#myConf');
    var $subm = $('#mySubmit');	
    var $impt = $form.find(':input').not(':button, :submit, :reset, :hidden');
    // Submit function:
    $form.submit(function(){
        $.post($(this).attr('action'), $(this).serialize(), function(response){
     // On success, clear all inputs;      $impt.val('').attr('value','').removeAttr('checked').removeAttr('selected');
     // Write a confirmation message:
            $conf.html("Submitted");			
            alert("Submitted.");
     // Disable the submit button:
            $subm.prop('disabled', true);
        },'json');
        return false;
    });
});
</script>




