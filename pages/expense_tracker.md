---
layout: standalone
title: Expense Tracker
# 
---

<script type="text/javascript">  
	var subcategory = {
		Food: ["Nokia","Redmi","Samsung"],
		Purchases: ["Nokia","Redmi","Samsung"],
		Transportation: ["Nokia","Redmi","Samsung"],
		Entertainment: ["Nokia","Redmi","Samsung"],
		Travel: ["Nokia","Redmi","Samsung"],
		Fixed Payments: ["Nokia","Redmi","Samsung"],
		Others: ["Shirt","Pant","T-shirt"]
	}
	function makeSubmenu(value) {
		if(value.length==0) document.getElementById("categorySelect").innerHTML = "<option></option>";
		else {
			var citiesOptions = "";
			for(categoryId in subcategory[value]) {
				citiesOptions+="<option>"+subcategory[value][categoryId]+"</option>";
			}
			document.getElementById("categorySelect").innerHTML = citiesOptions;
		}
	}
	function displaySelected() { 
		var country = document.getElementById("category").value;
		var city = document.getElementById("categorySelect").value;
		alert(country+"\n"+city);
	}
	function resetSelection() {
		document.getElementById("category").selectedIndex = 0;
		document.getElementById("categorySelect").selectedIndex = 0;
	}
</script>

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
    <select id="category" size="1" onchange="makeSubmenu(this.value)">
	  <option value="" disabled selected>Choose Category</option>
	  <option>Mobile</option>
	  <option>Clothes</option>
    </select>
    <select id="subcategory" size="1" >
      <option value="" disabled selected>Choose Subcategory</option>
	  <option></option>
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




