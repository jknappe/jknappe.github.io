---
layout: standalone
title: Expense Tracker
# http://ordrespontane.blogspot.com/2018/01/html-form-to-google-sheet.html
---

# Expense Tracker

<FORM id="myForm" action="https://script.google.com/macros/s/AKfycbxpE4LM1f_-t8h1Zd-WWl4UXNCLirSi55lWxlcWeACqlCvGLBak/exec">
  Type: 
    <input type="radio" name="type" value="Expense" checked> Expense
    <input type="radio" name="type" value="Income"> Income
  <br>Value:   
    <input type="number" name="value" min="0" step="0.01" style="width:200px" required> 
  <br>
  Category:
    <input type="text" name="category" list="category_list" required>
      <datalist id="category_list">
        <option>Food</option>
        <option>Purchases</option>
        <option>Transportation</option>
        <option>Entertainment</option>
        <option>Travel</option>
        <option>Fixed Payments</option>		
        <option>Others</option>
      </datalist>
  <br>
  Paid by: 
    <input type="radio" name="paid_by" value="Jan" checked> Jan
    <input type="radio" name="paid_by" value="Celia"> Celia
  <br>
  Date: 
    <input type="date" name="date">
  <br>
  <input type="submit" id="mySubmit" value="Submit Expenses">  
  <input type="reset">
</FORM>

<p><span id="myConf">This is where the confirmation message will appear after submission.</span></p>


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
</script>




