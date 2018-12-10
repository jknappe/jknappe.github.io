---
layout: default
title: Expense Tracker
#image: 170712-CharynCanyon.jpg
---

<form id="expenses" action="https://script.google.com/macros/s/AKfycbydrwmhU3oWKqieyXqedAsAz8825CKjaFh9PboC0Jx0IchSk8Y/exec">
  <table>
    <tr> <th>
       Value: </th> <th>
	   <input type="number" name="value", min = 0 style="width:200px" required>
	</th> </tr>	
    <tr> <th>
       Category: </th> <th>
	    <input list="category" name="category">
		  <datalist id="category">
            <option value="Internet Explorer">
			<option value="Firefox">
			<option value="Chrome">
			<option value="Opera">
			<option value="Safari">
		  </datalist>
	</th> </tr>
    <tr> <th>
       Paid by: </th> <th>
	   <input type="radio" name="paid_by" value="Jan" checked> Jan<br>
       <input type="radio" name="paid_by" value="Celia"> Celia<br>
	</th> </tr>
	</table>
    <input type="submit" id="expenses" value="Submit Expenses">
</form>


<FORM>
<INPUT TYPE="button" onClick="history.go(0)" VALUE="Refresh">
</FORM>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>

<script type="text/javascript">
$(document).ready(function(){
    // References:
    var $form = $('#myForm');
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




