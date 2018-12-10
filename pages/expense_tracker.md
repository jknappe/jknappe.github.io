---
layout: standalone
title: Expense Tracker
# 
---

<FORM id="myForm" action="https://script.google.com/macros/s/AKfycbxpE4LM1f_-t8h1Zd-WWl4UXNCLirSi55lWxlcWeACqlCvGLBak/exec">
  Type: 
    <input type="radio" name="type" value="Expense" checked> Expense
    <input type="radio" name="type" value="Income"> Income
  <br>
  Paid by: 
    <input type="radio" name="paid_by" value="Jan" checked> Jan
    <input type="radio" name="paid_by" value="Celia"> Celia
  <br>
  <hr>  
    <input type="number" name="value" min="0" step="0.01" placeholder="Value in EUR" required> 
  <br>
    <select name="category" placeholder="Category" required>
      <option value="Food">Food</option>
      <option value="Purchases">Purchases</option>
      <option value="Transportation">Transportation</option>
      <option value="Entertainment">Entertainment</option>
      <option value="Travel">Travel</option>
      <option value="Fixed Payments">Fixed Payments</option>
      <option value="Others">Others</option>
    </select>
  <br>
    <input type="date" name="date">
  <br>
  <hr>
  <input type="submit" id="mySubmit" value="Submit">  
  <input type="reset" value="Clear">
  <INPUT TYPE="button" onClick="history.go(0)" VALUE="Add New">
  <hr>
</FORM>

<p><span id="myConf"></span></p>


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




