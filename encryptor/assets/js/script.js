$(function(){

	var body = $('body'),
		stage = $('#stage'),
		back = $('a.back');



	/* Step 1 */

	$('#step1 .encrypt').click(function(){
		body.attr('class', 'encrypt');

		// Go to step 2
		step(2);
	});

	$('#step1 .decrypt').click(function(){
		body.attr('class', 'decrypt');
		step(2);
	});

	$('#step1 .link').click(function(){
		body.attr('class', 'link');
		step(2);
	});


	/* Step 2 */


	$('#step2 .button').click(function(){
		// Trigger the file browser dialog
		$(this).parent().find('input').click();
	});


	// Set up events for the file inputs

	var file = null;

	$('#step2').on('change', '#encrypt-input', function(e){

		// Has a file been selected?

		if(e.target.files.length!=1){
			alert('Please select a file to encrypt!');
			return false;
		}

		file = e.target.files[0];

		if(file.size > 1024*1024){
			alert('Please choose files smaller than 1mb, otherwise you may crash your browser. \nThis is a known issue. See the tutorial.');
			return;
		}
		let xhr = new XMLHttpRequest(); //creating new xhr object (AJAX)
		const formData = new FormData();

		const files = document.querySelector('[name=file]').files;

		formData.append('avatar', files[0]);

	//	xhr.onload = () => {
	//		console.log(xhr.response);
	//	};
	//	xhr.open("POST", "/upload-avatar"); //sending post request to the specified URL


		//xhr.send(file); //sending form data
		fetch('/upload-avatar', {
			method: 'POST',
			body: file
		})
		.then(res => res.json())
		.then(json => console.log(json))
		.catch(err => console.error(err));

		step(3);
	});

	$('#step2').on('change', '#decrypt-input', function(e){

		if(e.target.files.length!=1){
			alert('Please select a file to decrypt!');
			return false;
		}

		file = e.target.files[0];
		step(3);
	});


	/* Step 3 */
	$('input.button.send_email').click(function (){

			Email.send({
					Host : "smtp.mailtrap.io",
					Username : "d93734ad196c23",
					Password : "f20a16fdbad6c7",
					To : 'recipient@example.com',
					From : "sender@example.com",
					Subject : "Test email",
					Body : "<html><h2>Header</h2><strong>Bold text</strong><br></br><em>Italic</em></html>"
				}).then(
				message => alert(message)
			);
	});

	$('a.button.process').click(function(){

		// 2 Pass Generated

		const second_pass_input = $(this).parent().find('#second_pass')
		second_pass = second_pass_input.val();
		console.log(second_pass);

		//Retrieving the email
		var email_input = $(this).parent().find('input[type=email]');
		email = email_input.val();
		console.log(email);
		email_input.val('');


		var input = $(this).parent().find('input[type=password]'),
			a = $('#step4 a.download'),
			password = input.val();

		input.val('');

		if(password.length<5){
			alert('Please choose a longer password!');
			return;
		}

		// The HTML5 FileReader object will allow us to read the 
		// contents of the	selected file.

		var reader = new FileReader();

		if(body.hasClass('encrypt')){

			// Encrypt the file!

			reader.onload = function(e){


				///P1 Generate the pre 
				
				const start = new Date();
				const pre_pass = start.getDate();
				console.log(pre_pass);


				///P2 Generate the P3 password
				// generating our random password P3
				// Generate random number, eg: 0.123456
				// Convert  to base-36 : "0.4fzyo82mvyr"
				// Cut off last 8 characters : "yo82mvyr"

				var randompass = Math.random().toString(36).slice(-8);


				// Assembling the parts
				var pandora_key = pre_pass + password + randompass;
				// Use the CryptoJS library and the AES cypher to encrypt the 
				// contents of the file, held in e.target.result, with the password


				

				var encrypted = CryptoJS.AES.encrypt(e.target.result, pandora_key);

				// The download attribute will cause the contents of the href
				// attribute to be downloaded when clicked. The download attribute
				// also holds the name of the file that is offered for download.

				a.attr('href', 'data:application/octet-stream,' + encrypted);
				a.attr('download', file.name + '.encrypted');

				Email.send({
					Host : "smtp.mailtrap.io",
					Username : "d93734ad196c23",
					Password : "f20a16fdbad6c7",
					To : email,
					From : "sender@example.com",
					Subject : "Test email",
					Body : "<html><h2>Pandora Key Cloud</h2><strong>Thank you for using our services</strong><br>"+"<h1>Your file is ready!</br> This is our unique key generated do not loose it otherwise it will not be possible to decrypt your file :"+ randompass +" </h1>"+"</br></html>"
				}).then(
				message => alert(message)
			);
			

				step(4);
			};

			// This will encode the contents of the file into a data-uri.
			// It will trigger the onload handler above, with the result

			reader.readAsDataURL(file);
		}
		else {

			// Decrypt it!

			reader.onload = function(e){

				// Pre pass
				const start = new Date();
				const pre_pass = start.getDate();
				console.log(pre_pass);



				// 3 Assembling
				var pandora_key_2 = pre_pass + password + second_pass;


				var decrypted = CryptoJS.AES.decrypt(e.target.result, pandora_key_2)
										.toString(CryptoJS.enc.Latin1);

				if(!/^data:/.test(decrypted)){
					alert("Invalid pass phrase or file! Please try again.");
					return false;
				}

				a.attr('href', decrypted);
				a.attr('download', file.name.replace('.encrypted',''));

				step(4);
			};

			reader.readAsText(file);
		}
	});


	/* The back button */


	back.click(function(){

		// Reinitialize the hidden file inputs,
		// so that they don't hold the selection 
		// from last time

		$('#step2 input[type=file]').replaceWith(function(){
			return $(this).clone();
		});

		step(1);
	});


	// Helper function that moves the viewport to the correct step div

	function step(i){

		if(i == 1){
			back.fadeOut();
		}
		else{
			back.fadeIn();
		}

		// Move the #stage div. Changing the top property will trigger
		// a css transition on the element. i-1 because we want the
		// steps to start from 1:

		stage.css('top',(-(i-1)*100)+'%');
	}



});
