"use strict";

/* SOME CONSTANTS */
let endpoint01 = "https://7pp0p4s3xg.execute-api.us-east-1.amazonaws.com/default/meadowsproject2";

//let endpoint02 = "";

let html5QrcodeScanner; 

/* SUPPORTING FUNCTIONS */

let fixUnixtimestamp = (d) => {
    d = d * 1000;
    let newdate = new Date(d);
    if (newdate.toLocaleDateString() == "Invalid Date"){
        return "Invalid Date";
    }
    return newdate.toLocaleDateString() + ' ' + newdate.toLocaleTimeString();
}

let onScanSuccess = (qrCodeMessage) => {
	//html5QrcodeScanner.stop(); //stop scanning now
	// handle on success condition with the decoded message
	$("#div-output").show();
	$("#eventcode").val(qrCodeMessage);
	stopCamera();
	scanController();
}

let onScanError = (errorMessage) => {

}

let startCamera = async () => {
	await html5QrcodeScanner.render(onScanSuccess,onScanError);	
	await $("#reader").show();
}

let stopCamera = async () => {
	await html5QrcodeScanner.clear();	
	await $("#reader").hide();
}

let historyController = () => {
	//clear any previous messages
	$('#history_message').html("");
	$('#history_message').removeClass();


	//serialize the data
	let the_serialized_data = $("#form-scan").serialize();
	console.log(the_serialized_data);

	//ajax call follows...
	$.ajax({
		url: endpoint01 + "/history",
		data: the_serialized_data,
		method: "GET",
		success: (results) => {

		let historytableheader = `<tr>
			<th>Event name</th>
			<th>Date & Time</th>
		</tr>`;

		$("#table-history").html(historytableheader);

			for(let i = 0; i < results.length; i++){
				let eventname = results[i]["eventname"];
				let eventdate = fixUnixtimestamp( results[i]["scandate_epoch"] );

				let historytablerow = `<tr>
				<td>${eventname}</td>
				<td>${eventdate}</td>
				</tr>`; 

				$("#table-history").append(historytablerow);
			}
		},
		error: (data) => {
			console.log(data);
		}
	});
};

					
let scanController = ()=>{
	//clear any previous messages
	$('#scan_message').html("");
	$('#scan_message').removeClass();
	let the_serialized_data = $("#form-scan").serialize();
	console.log(the_serialized_data);
	/////ajax call
	
	$.ajax({
		url: endpoint01 + "/scancheck",
		data: the_serialized_data,
		method: "GET",
		success:(results)=>{
			//// if it works for to cinfirnation tab
			console.log(results);
			$(".content-wrapper").hide();
			$("#div-confirm").show();
		},
		error:(data)=>{
			console.log(data);
			$("#scan_message").html("The scan failed. Try Again");
			$("#scan_message").addClass("alert alert-danger");
			startCamera();
	

		},

	});


}

let signupController = () => {
	//clear any previous messages
	$('#signup_message').html("");
	$('#signup_message').removeClass();

	//first, let's do some client-side 
	//error trapping.
	let newusername = $("#newusername").val();
	let newpassword = $("#newpassword").val();
	let newpassword2 = $("#newpassword2").val();
	let email = $("#email").val();
	

	if (newpassword.length < 8){
		$('#signup_message').html('Password is too short. Please try again.');
		$('#signup_message').addClass("alert alert-danger text-center");
		return; //quit the function now!   		
	}
	
	if (newpassword != newpassword2){
		$('#signup_message').html('The passwords do not match. Please try again.');
		$('#signup_message').addClass("alert alert-danger text-center");
		return; //quit the function now!   		
	}
	////ajax request to create new record in database 
	///if all error traps come up clean
	let the_serialized_data = $("#form-signup").serialize();
	console.log(the_serialized_data);
	////ajax call now
	$.ajax({
		url: endpoint01 + "/users",
		data: the_serialized_data,
		method: "POST",
		success:(results)=>{
			console.log(results);
			$("#username").val(newusername);
			$("#password").val(newpassword);	
			$(".content-wrapper").hide();
			$("#div-login").show();		
		},
		error: (data) => {
			console.log(data);
			$('#signup_message').html(data['responseJSON']);
			$('#signup_message').addClass("alert alert-danger text-center");
			return; 
	

		},

	});


}



let loginController = () => {
	//clear any previous messages
	$('#login_message').html("");
	$('#login_message').removeClass();

	//client-side 
	//error trapping.
	let username = $("#username").val();
	let password = $("#password").val();
	if (username == "" || password == ""){
		$('#login_message').html('The user name and password are both required.');
		$('#login_message').addClass("alert alert-danger text-center");
		return; //quit the function now!   
	}
	//// get the data off the form

	let the_serialized_data = $("#form-login").serialize();
	console.log(the_serialized_data);



	///


$.ajax({
	url:  endpoint01 + "/auth",
	data: the_serialized_data,
	method: "GET",
	success: (results)=>{
		console.log(results);

		//login succeeded.  Set userid.
		localStorage.userid = results[0]['userid'];
		$("#userid").val(localStorage.userid);

		//manage the appearence 
		$('#login_message').html('');
		$('#login_message').removeClass();
		$('.secured').removeClass('locked');
		$('.secured').addClass('unlocked');
		$('#div-login').hide(); 
		$('#div-scan').show();  
		startCamera();  


	},
	error:(theerrordata)=>{
		console.log(theerrordata);
		localStorage.removeItem("userid");
		$('#login_message').html("Login Failed. Try again.");
		$('#login_message').addClass("alert alert-danger text-center");
	},
})

	

	//scroll to top of page
	$("html, body").animate({ scrollTop: "0px" });
};

$(document).ready( () => {

	html5QrcodeScanner = new Html5QrcodeScanner(
		"reader", 
		{ 
			fps: 10,
			qrbox: {width: 200, height: 200},
			experimentalFeatures: {},
			rememberLastUsedCamera: false,
			aspectRatio: 1,
        	showZoomSliderIfSupported: true,
        	defaultZoomValueIfSupported: 2
		});


    
	if (localStorage.userid){
		$("#div-scan").show();
		$(".secured").removeClass("locked");		
		$(".secured").addClass("unlocked");
		$("#userid").val(localStorage.userid);
		startCamera();
	}
	else {
		$("#div-login").show();
		$(".secured").removeClass("unlocked");
		$(".secured").addClass("locked");
	}

	///force the page to be https until start camera?????????  
	let loc = window.location.href+'';
    if (loc.indexOf('http://')==0){
	   window.location.href = loc.replace('http://','https://');
   }




    /* ------------------  basic navigation -----------------*/	
   
	/* what happens if the link-histroy anchor tag is clicked? */
	$('#link-history').click( () => {
		$(".content-wrapper").hide(); 	/* hide all content-wrappers */
		$("#div-history").show(); /* show the chosen content wrapper */
		historyController();
	});
		

	/* what happens if any of the navigation links are clicked? */
	$('.nav-link').click( () => {
		$("html, body").animate({ scrollTop: "0px" }); /* scroll to top of page */
		$(".navbar-collapse").collapse('hide'); /* explicitly collapse the navigation menu */
	});

	/* what happens if the login button is clicked? */
	$('#btnLogin').click( () => {
		loginController();
	});

	$('#link-logout').click( () => {
		// First ... remove userid from localstorage
		localStorage.removeItem("userid");
		// Now force the page to refresh
		window.location = "./index.html";
	});
	

	/* what happens if the logout link is clicked? */
	$('#link-logout').click( () => {
		// First ... remove userid from localstorage
		localStorage.removeItem("userid");
		// Now force the page to refresh
		window.location = "./index.html";
	});

	$('#btnSignup').click( () => {
		$(".content-wrapper").hide(); 
		$("#div-signup").show(); 
	});
	
	$('#btnMakeaccount').click( () => {
		
		signupController();
});
	$('#btnCancelMakeaccount').click( () => {
		$(".content-wrapper").hide(); 
		$("#div-login").show();
	});
	$('#btnBacktoScan').click( () => {
		$(".content-wrapper").hide(); 	
		$("#div-scan").show(); 
	});
	$('#btnDone').click( () => {
		$(".content-wrapper").hide(); 
		$("#div-login").show(); 
	});
	$('#btnSignOut').click( () => {
		$(".content-wrapper").hide(); 
		$("#div-login").show(); 
	});

	

	$('#btnScanplaceholder').click( () => {
		scanController();
	} );


}); /* end the document ready event*/