$(document).ready(function() {


	$("#form").hide();

	$("#showForm").click( function(){
		
		 $(".header").animate({height:"300px"});
		$("#form" ).slideDown( "slow", function() {});
		 $(this).hide("fast");

		

	});


	


});