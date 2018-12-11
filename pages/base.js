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


  var category = {
  Expense: ["Food", "Purchases", "Transportation", "Entertainment", "Travel", "Fixed", "Others"],
  Income: ["Salary", "Cash", "Gifts", "Investment", "Sales", "Others"]
  }
  var subcategory = {
    Food: ["Groceries","Eating Out","Alcohol"],
	Purchases: ["Books","Clothes","Grooming","Electronica","Software","Household","Hobby","Office","Gifts","Other"],
	Transportation: ["Local Transport","Flights","Distance Transport","Bicycle", "Car", "Taxi"],
	Entertainment: ["Cinema","Theatre","Concert","Museum","Others"],
	Travel: ["Accommodation","Flights","Souvenirs","Other"],
	Fixed: ["Mobile Phone","Rent","Utilities", "Subscriptions", "Insurance"],
	Others: ["Charity","Lending","Mediacl","Incidental Expenses", "Other"],
	Salary: ["Regular", "One-off", "Others"],
	Cash: ["Found", "Others"],
	Gifts: ["Birthday", "Christmas", "Others"],
	Investment: ["Interest", "Others"],
	Sales: ["Clothes", "Household", "Others"],
	Others: ["---"]
  }
  function makeSubmenu(value) {
    if(value.length==0) document.getElementById("categorySelect").innerHTML = "<option></option>";
    else {
      var catOptions = "";
      for(categoryId in category[value]) {
        catOptions+="<option>"+category[value][categoryId]+"</option>";
      }
    document.getElementById("categorySelect").innerHTML = catOptions;
    }
  }
  function makeSubsubmenu(value) {
    if(value.length==0) document.getElementById("subCategorySelect").innerHTML = "<option></option>";
    else {
      var catOptions = "";
      for(categoryId in subcategory[value]) {
        catOptions+="<option>"+subcategory[value][categoryId]+"</option>";
      }
    document.getElementById("subCategorySelect").innerHTML = catOptions;
    }
  }
  
function start(){
    makeSubmenu("Expense");
	makeSubsubmenu("Food");
}

function typeChange(value){
    makeSubmenu(value);
	makeSubsubmenu(makeSubmenu(value));
}