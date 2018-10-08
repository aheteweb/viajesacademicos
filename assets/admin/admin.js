//Getting content from github (data is returned)
	//$.trim(data.split('---')[2]) //get the content without the yaml
	//$.trim(data.split('---')[1].split('---')[0]) //get the yaml
/*
	Global vars 
*/
	var gOwner         = 'aheteweb';//Repo owner
	var gRepo          = 'viajesacademicos';//Repo name
	var imagesUrl      = 'https://boiling-depths-79304.herokuapp.com/';
	var selectedImages = [];//Store the images that will be inserted from the imagesModal
	var imageTarget; //Element where a selected image will be placed

/*
	Session logout and change password
*/
	function logOut(){
		loading('body');
		firebase.auth().signOut().then(function() {
		  window.location.replace(baseUrl);
		})
	}

	if($('#admin-page').length !== 0){
		$('input.update-pass').attr('disabled', true);
	}
	function updatePass(event){
		event.preventDefault();
		$('.new-pass-error, .new-pass-success, .old-pass-error').addClass('d-none');
		toggleUpdatePassButtonText('Please wait');
		$('input.update-pass').attr('disabled', true);
		
		var userEmail   = firebase.auth().currentUser.email;
		var currentPass = $('#oldpass').val();
		var newPass     = $('#newpass').val();

		var credential = firebase.auth.EmailAuthProvider.credential(
	    userEmail,
	    currentPass
	  );
		
		firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(credential).then(function(msg) {
			firebase.auth().currentUser.updatePassword(newPass).then(function(msg) {
			  $('.new-pass-success').removeClass('d-none').text('Your password have been updated')
			  clearPasswordFields();
			  toggleUpdatePassButtonText('Update')
			}, function(error) {
				$('.new-pass-error').removeClass('d-none').text(error)
				clearPasswordFields();
				toggleUpdatePassButtonText('Update')
			});
		}).catch(function(error) {
		  $('.old-pass-error ').removeClass('d-none').text(error.message);
		  clearPasswordFields();
		  toggleUpdatePassButtonText('Update')
		});
		
	}
	$( "#oldpass, #newpass" ).keyup(function() {
	  if($('#oldpass').val().length >= 6 && $('#newpass').val().length >= 6){
	  	$('input.update-pass').attr('disabled', false);
	  }else{
	  	$('input.update-pass').attr('disabled', true);
	  }
	});
	function toggleUpdatePassButtonText(text){
		$('input.update-pass').attr('value', text);
	}
	function clearPasswordFields(){
		$('#oldpass, #newpass').val('');
	}

/*
	Firebase database read
*/
	var dbRead = function(par){
		firebase.database().ref(par.path).once('value').then(function(snapshot) {
		  par.action(snapshot);
		}, function(error){
			par.error(error)
		});
	}	

//Load admin files
	loading('body');//Display a loading screen until all admin files has ben loaded
	//Load css
		function loadCss(src){
			var Head  = document.getElementsByTagName('head')[0];
	    var Link  = document.createElement('link');
	    Link.rel  = 'stylesheet';
	    Link.type = 'text/css';
	    Link.href = src;
	    Link.media = 'all';
	    Head.appendChild(Link);
		}
		loadCss(baseUrl + 'assets/admin/contenttools/content-tools.min.css');	
		loadCss(baseUrl + 'assets/admin/admin.css?' + new Date());
		loadCss('https://cdnjs.cloudflare.com/ajax/libs/dropzone/4.3.0/min/dropzone.min.css');		
		loadCss('https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css');		
	
	//Load js & html
			$.getScript(baseUrl + 'assets/admin/contenttools/content-tools-custom.js?' + new Date(), function() {
			  $.getScript('https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js', function(){
					$.getScript(baseUrl + 'assets/admin/github.js?' + new Date(), function(){
						$.getScript(baseUrl + 'assets/admin/yaml.js?' + new Date(), function(){
							$.getScript('https://cdnjs.cloudflare.com/ajax/libs/dropzone/4.3.0/min/dropzone.min.js', function(){
								$.get(baseUrl + 'assets/admin/variables.html?' + new Date(), function( variables ) {
				  				$.get(baseUrl + 'assets/admin/admin.html?' + new Date(), function( admin ) {
				  					$('#mhContent, [data-mhsection="columns_2"] > .container > .row > div, [data-mhsection="columns_3"] > .container > .row > div').addClass('sortable');
				  					loading('body');//
				  					mH = JSON.parse(variables);//store the variables in a var
				  					$('body').append(admin);//Include the admin HTML
							  		populateSidebar();//Populate the sidebar with the sections
							  		showPreview();//if mhContent is empty show an explanation of how to add content
							  		if($('body').attr('data-permalink') === '/admin/'){
							  			var x = $('.session-actions');
							  			$('.session-actions').remove();
											$('.user-actions').html(x[0]);
										}							  		
							  	});						  		
						  	});
				  		});		  			
						});		  		
			 		});		  	
			  });
			});	

//Init dropzone
	function initDropZone(){
		Dropzone.autoDiscover = false;
		var myDropzone = new Dropzone('#dropzone-area', {
			uploadMultiple: false,
			acceptedFiles:'.jpg,.png,.jpeg,.gif',
			parallelUploads: 6,
			maxFilesize: 1,
			addRemoveLinks: true,
			//Change the default "drop files here to upload" text
			dictDefaultMessage: 'Arrastra las imágenes de tu computador \n ó \n Haz click aqui para buscar.',
			//If the browser is not supported, the default message will be replaced with this text. Defaults to "Your browser does not support drag'n'drop file uploads."
			dictFallbackMessage: 'Navegador no soportado, porfavor cambia a chrome',
			//If addRemoveLinks is true, the text to be used for the cancel upload link.
			dictCancelUpload: 'Cancelar carga',
			dictCancelUploadConfirmation: 'Seguro que deseas cancelar esta carga?',

			url: 'https://api.cloudinary.com/v1_1/viajesacademicosve/image/upload'
			//url: '#'
		});

		var myfile, myresponse;
		myDropzone.on('sending', function (file, xhr, formData) {
			var myCustomName = "mh_" + file.name.replace(/ /g, "-");
			var uploadPath = $('#mhAdminpage .input-group-text').text() + $('#mhAdminpage #uploadPath').val();
			formData.append('api_key', '543697144334978');
			formData.append('timestamp', Date.now() / 1000 | 0);
			formData.append('upload_preset', 'syzaiok2');
			formData.append('folder', uploadPath);
			formData.append('public_id', myCustomName);
		});
		myDropzone.on('success', function (file, response) {
			myfile = file;
			myresponse = response;
			$('.hide-dropzone').addClass('reload');
		});	
		myDropzone.on('error', function (par1, par2, par3) {
			console.log(par1)
			console.log(par2)
			console.log(par3)
		});
	}	

//Make strings URL friendly (Used to save the pages names in case they content latin characters like á, ñ etc)
	function formatThis (str, type) {
		var defaultDiacriticsRemovalMap = [
	    {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
	    {'base':'AA','letters':/[\uA732]/g},
	    {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
	    {'base':'AO','letters':/[\uA734]/g},
	    {'base':'AU','letters':/[\uA736]/g},
	    {'base':'AV','letters':/[\uA738\uA73A]/g},
	    {'base':'AY','letters':/[\uA73C]/g},
	    {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
	    {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
	    {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
	    {'base':'DZ','letters':/[\u01F1\u01C4]/g},
	    {'base':'Dz','letters':/[\u01F2\u01C5]/g},
	    {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
	    {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
	    {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
	    {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
	    {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
	    {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
	    {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
	    {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
	    {'base':'LJ','letters':/[\u01C7]/g},
	    {'base':'Lj','letters':/[\u01C8]/g},
	    {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
	    {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
	    {'base':'NJ','letters':/[\u01CA]/g},
	    {'base':'Nj','letters':/[\u01CB]/g},
	    {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
	    {'base':'OI','letters':/[\u01A2]/g},
	    {'base':'OO','letters':/[\uA74E]/g},
	    {'base':'OU','letters':/[\u0222]/g},
	    {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
	    {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
	    {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
	    {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
	    {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
	    {'base':'TZ','letters':/[\uA728]/g},
	    {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
	    {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
	    {'base':'VY','letters':/[\uA760]/g},
	    {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
	    {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
	    {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
	    {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
	    {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
	    {'base':'aa','letters':/[\uA733]/g},
	    {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
	    {'base':'ao','letters':/[\uA735]/g},
	    {'base':'au','letters':/[\uA737]/g},
	    {'base':'av','letters':/[\uA739\uA73B]/g},
	    {'base':'ay','letters':/[\uA73D]/g},
	    {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
	    {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
	    {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
	    {'base':'dz','letters':/[\u01F3\u01C6]/g},
	    {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
	    {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
	    {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
	    {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
	    {'base':'hv','letters':/[\u0195]/g},
	    {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
	    {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
	    {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
	    {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
	    {'base':'lj','letters':/[\u01C9]/g},
	    {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
	    {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
	    {'base':'nj','letters':/[\u01CC]/g},
	    {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
	    {'base':'oi','letters':/[\u01A3]/g},
	    {'base':'ou','letters':/[\u0223]/g},
	    {'base':'oo','letters':/[\uA74F]/g},
	    {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
	    {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
	    {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
	    {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
	    {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
	    {'base':'tz','letters':/[\uA729]/g},
	    {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
	    {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
	    {'base':'vy','letters':/[\uA761]/g},
	    {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
	    {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
	    {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
	    {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
	  ];

	  for(var i=0; i<defaultDiacriticsRemovalMap.length; i++) {
	    str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
	  }

	  if(type === 'url'){
	  	str = str.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')
	  }

	  return str;
	}

//Show content preview (if mhContent is empty show an explanation of how to add content)
	function showPreview(){
		if($('#mhContent > div').length === 0){
			$('#mhContent').append($('.mhPreview').clone());
		}
	}

//Convert content into UTF-8 as github will return a page build failure if any latin character is found, then encode it as base 64
	function encodeContent(content){
		return btoa(unescape(encodeURIComponent(content)));
		///
	}
	function decodeContent(content){
		return decodeURIComponent(escape(content));
		///
	}

//Save the variables.html file
	function updatemH(fn){
		updateFile({
			owner: gOwner,
			repo: gRepo,
			path: 'assets/admin/variables.html',
			content: encodeContent(JSON.stringify(mH)),
			message: 'commited from the website',
			branch: 'master',
			action: function(data, status, xhr){
				if(fn){
					fn();
				}
			}
		})			
	}

//Dragbar
	function populateSidebar(){
		$.each(mH.sections, function( key, pair ) {
		  var section = '<div class="section">';
			section 	 += '	<div class="title">' + pair.name + '</div>';
			section 	 += '	<div class="draggable" data-mhcallsection="' + key + '">'
			section 	 += '		<img src="' + pair.image + '" class="img-thumbnail img-fluid">'
			section 	 += '	</div>'
			section 	 += '</div>'
			
			$('#mhDragbar .sections').append(section);
			dragNdrop();
		});
	}
	function toggleDragBar(ev){
		$('#mhDragbar').toggleClass('show');
		//ev.type may be click or dragstart, we only hide content tools when the dragbar is open by a click, then show it again when drag has stopped
		if(ev.type === 'click'){
		}			
	}
	function dragNdrop(){
		$( ".sortable" ).sortable({
      revert: true,
      connectWith: '.sortable',
      handle: ".mhOptions .move",
      start: function(event, ui){
      	$('.sortable').addClass('sorting');
      },
      stop: function(event, ui){
      	$('.sortable').removeClass('sorting');
      },
      receive: function(event, ui){
      	//Remove the preview section (shown when the page content is empty)
	      	if ($(".mhPreview").length !== 0){
					  $(".mhPreview").remove();
					}   						
				//Get the element where the section was dropped
					var receiver = event.target;
      		var receiverId = $(receiver)[0].id;				
      	//Get the dropped element and the section it's calling
      		var received = $('[data-mhcallsection]');
      		var section = $(received).attr('data-mhcallsection');		      	
				//Replace the dropped element with the desired content
      		$(received)[0].outerHTML = mH.sections[section].html;
      	//Append the options bar
      		$('#mhReceived[data-options]').prepend($('#adminHtml .mhOptions').clone());
				//Create a unique name for the data-editable area so ContentTools can target it
					if ($('#mhReceived [data-editable]').length !== 0){
						var timestamp = + new Date();
						$($('#mhReceived [data-editable]')).each(function(index) {
							var identifier = timestamp + index;
							$(this).attr('data-name', identifier );
						});
					}		      	

				//Apply js to new elements
					//Slider
						if(section === 'header_slider' || section === 'slider')	{
							initSlider('#mhReceived .slider');
						}
					//Gallery
						if(section === 'gallery_text'){
							var galid = 'g' + + new Date();
							$('#mhReceived .mhgallery').attr('id', galid );
							lightGallery(document.getElementById(galid));
						}
					//Products list
						if(section === 'products_preview'){
							var columnProducts = Object.keys(mH.products).length / 2;
							var printedProducts = 0;
							$.each(mH.products, function( index, value ) {
								printedProducts += 1;
								var identifier = timestamp + printedProducts;
								var product = jsyaml.load(decodeContent($.trim(atob(value).split('---')[1])));
								var pTitle = pageLang === 'en' ? product.title : product.titulo;
								var content  = '<li data-lang="' + pageLang + '" data-slide="n' + printedProducts + '" data-scientific="' + product.scientific + '" data-img="' + product.image + '">';
										content += 		pTitle + ' <i class="fas fa-search-plus"></i>';
										content += '</li>';
								if(printedProducts <= columnProducts){
							  	$('#mhReceived .js-content .first-half ul').append(content);
							  }else{
							  	$('#mhReceived .js-content .second-half ul').append(content);
							  }
							});
						}
						if(section === 'products'){
							$.each(mH.products, function( index, value ) {
								var product = jsyaml.load(decodeContent($.trim(atob(value).split('---')[1])));
								var pTitle = pageLang === 'en' ? product.title : product.titulo;
								var scient = pageLang === 'en' ? "Scientific name" : "Nombre cientifico";
								var content  = '<div class="col-lg-3 col-md-4 col-sm-6">';
										content += '	<div class="card">';
										content += '		<div class="card-header">' + pTitle + '</div>';
										content += '		<div class="card-body">';
										content += '			<img src="' + product.image + '" class="img-fluid" alt="' + pTitle + '">';
										content += '		</div>';
										content += '		<div class="card-footer">';
										content += '			<p><b>' + scient + ': </b>' + product.scientific + '</p>';
										content += '		</div>';
										content += '	</div>';
										content += '</div>';
								$('#mhReceived .js-content .row').append(content);
							});
						}						
					//Contact details
						if(section === 'contact_data'){
							$.each(mH.config.address, function( index, value ) {
								var item  = '<div><i class="fas fa-map-marker-alt"></i> ' + value + '</div>';
								$('#mhReceived .js-content address .address').append(item);
							});
							$.each(mH.config.phones, function( index, value ) {
								var item  = '<div><i class="fas fa-phone-volume"></i> <a href="tel: ' + value + '">' + value + '</a></div>';
								$('#mhReceived .js-content address .phone').append(item);
							});	
							$.each(mH.config.emails, function( index, value ) {
								var item  = '<div><i class="fas fa-envelope"></i> ' + value + '</div>';
								$('#mhReceived .js-content address .mail').append(item);
							});														
						}
					//Page title
						if(section === 'page_title'){
							var pageTitle = $('body').attr('data-title');
							$('#mhReceived .js-content').html('<h1>' + pageTitle + '</h1>');
						}
					//Columns
						//detach draggable and sortable and init it again
						if(section === 'columns_2' || section === 'columns_3'){
							dragNdrop();
						}

      	//After all manipulation have been done to the dropped element, remove it's #mhReceived attribute used before to manipulate it. Then start the editor again
      		$('#mhReceived').removeAttr('id');
      },
      revert: function(valid){
				if(valid === false){
      		$('.sortable').removeClass('sorting');
      	}      	
      },
      out: function(){
      	$('.sortable [data-mhsection]').removeClass('pad');
      },
      over: function(){
      	$('.sortable [data-mhsection]').addClass('pad');
      }
    });
    $( ".draggable" ).draggable({
      connectToSortable: ".sortable",
      helper: "clone",
      appendTo: "#mhContent",
      cursor: "crosshair",
      start: function(event, ui){
      	toggleDragBar(event);
      },
      stop: function(event, ui){
      },
			revert: function(valid){
				//This function return false if the element was dropped outside the allowed section in "connectToSortable" if it was droped outside I must init the content editor paused on dragstart, otherwise it'll be inited on element receive in the sortable function
      	if(valid === false){
      		//Do something if element was droped outside allowed place
      	}
      }
    });
	}	
	//Toggle the drag bar con clicking its arrows
		$(document).on('click', '#mhDragbar .puller', function(e){
			toggleDragBar(e);
			///
		});		

//Admin page
	//On click on any item open the admin page in the section selected to edit
		$(document).on('click', '#mhAdminbar a[data-tab], #mhAdminpage .fa-window-close', function(){
			$('html').toggleClass('admin-open');//To remove body overflow
			if($(this).attr('data-tab')){
				var showTab = $(this).attr('data-tab');
				$('#mhAdminpage .nav-tabs .active').removeClass('active').removeClass('show');
				$('#mhAdminpage .tab-content .active').removeClass('active').removeClass('show');
				$('#' + showTab).addClass('active').addClass('show');
				$('#' + showTab + '-tab').addClass('active').addClass('show');
			}else if($('.nav-pages').hasClass('ui-sortable')){
				$( ".nav-pages" ).sortable('destroy');
				$( ".all-pages li" ).draggable('destroy');
			}
		});		
	
	//General Options (_config.yml)
		function populateConfig(){
			var content = mH.config;
			$('#title').val(content.title);
			$('#desc').val(content.description);
			$('.mail-list, .phone-list, .address-list').empty();
			$.each(content.emails, function( index, value ) {
			  $('.mail-list').append('<span class="repeated short"><span class="mail">' + value + ' </span><span class="rm text-danger"><i class="far fa-times-circle"></i></span></span>');
			});
			$.each(content.phones, function( index, value ) {
			  $('.phone-list').append('<span class="repeated short"><span class="phone">' + value + ' </span><span class="rm text-danger"><i class="far fa-times-circle"></i></span></span>');
			});
			$.each(content.address, function( index, value ) {
			  $('.address-list').append('<span class="repeated long"><span class="address">' + value + '</span><span class="rm text-danger"><i class="far fa-times-circle"></i></span></span>');
			});		
			$('#facebook').val(content.facebook);
			$('#twitter').val(content.twitter);
			$('#instagram').val(content.instagram);
		}
		$(document).on('click', '.repeated .rm', function(){
			$(this).closest('.repeated').remove();
			///
		});
		$(document).on('click', '.mails .add', function(){
			if($('#mhConfigMail').val()){
				var mail = $('#mhConfigMail').val();
				$('.mail-list').append('<span class="repeated short"><span class="mail">' + mail + ' <span class="rm text-danger"><i class="far fa-times-circle"></i></span></span></span>');
			}
			$('#mhConfigMail').val('')
		});
		$(document).on('click', '.addresses .add', function(){
			if($('#mhConfigAddress').val()){
				var address = $('#mhConfigAddress').val();
				address = address.replace(/(?:\r\n|\r|\n)/g, '<br>')
				$('.address-list').append('<span class="repeated long"><span class="address">' + address + '</span><span class="rm text-danger"><i class="far fa-times-circle"></i></span></span>');
			}
			$('#mhConfigAddress').val('');
		});	
		$(document).on('click', '.phones .add', function(){
			if($('#mhConfigPhone').val()){
				var phone = $('#mhConfigPhone').val();
				$('.phone-list').append('<span class="repeated short"><span class="phone">' + phone + '<span class="rm text-danger"><i class="far fa-times-circle"></i></span></span></span>');
			}
			$('#mhConfigPhone').val('');
		});
		$(document).on('click', '.save-config', function(){
			loading('body');
			mH.config.title.en = $.trim($('#title-en').val());
			mH.config.title.es = $.trim($('#title-es').val());
			mH.config.description.en = $.trim($('#desc-en').val());
			mH.config.description.es = $.trim($('#desc-es').val());
			mH.config.emails = [];
			mH.config.phones = [];
			mH.config.address = [];
			$('.mail-list .mail').each(function(i,val){
	    	mH.config.emails.push($.trim($(val).text()));
			});
			$('.phone-list .phone').each(function(i,val){
	    	mH.config.phones.push($.trim($(val).text()));
			});
			$('.address-list .address').each(function(i,val){
	    	mH.config.address.push($.trim($(val).html()));
			});
			mH.config.facebook = $('#facebook').val();	
			mH.config.twitter = $('#twitter').val();	
			mH.config.instagram = $('#instagram').val();

			updateFile({
				owner: gOwner,
				repo: gRepo,
				path: '_config.yml',
				content: encodeContent(jsyaml.dump(mH.config)),
				message: 'commited from the website',
				branch: 'master',
				action: function(data, status, xhr){
					updatemH(function(){
						loading('body', true);
					})
				}
			});				
		});
	
	//Manage internal pages
		function populateInternalPages(section){
			$('#mhAdminpage .list-pages').empty();
			$.each(mH.pages, function(key, pair){
				$('#mhAdminpage .list-pages').append('<li class="list-group-item">' + pair.title + '<div class="btn-group btn-group-sm float-right"><button type="button" class="btn xs btn-outline-secondary view" data-url="' + key + '"><i class="fas fa-eye"></i></button><button type="button" class="btn xs btn-outline-danger rm" data-page="' + key + '"><i class="fas fa-times-circle"></i></button></div></li>');
			});
		}
		$(document).on('click', '.create-page', function(){
			$('.create-page, .new-page').toggleClass('d-none');
			///
		});
		$(document).on('click', '.list-pages .view', function(){
			var urlTo = $(this).attr('data-url');
			window.open(urlTo, '_blank');
		});
		$(document).on('click', '.list-pages .rm', function(){
			var listitem = $(this).closest('li');
			var pageName = listitem[0].innerText.trim();
			var pagePath = $(this).attr('data-page');
			var pageUrl = pagePath + '.html';
			var del = confirm('Seguro que deseas eliminar la pagina ' + pageName + '?\n Esta accion no puede deshacerse.');
			if(del === true){
				loading('body');
				deleteFile({
					owner: gOwner,
					repo: gRepo,
					path: pageUrl,
					message: 'commited from the website',
					action: function(data, status, xhr){
						deleteFile({
							owner: gOwner,
							repo: gRepo,
							path: 'es/' + pageUrl,
							message: 'commited from the website',
							action: function(data, status, xhr){
								delete mH.pages[pagePath];
								updatemH(function(){
									if(mH.nav.includes(pagePath)){
										mH.nav.splice(mH.nav.indexOf(pagePath), 1);
									}
									if($('.create-page').hasClass('d-none')){
										$('.create-page, .new-page').toggleClass('d-none');
									}
									populateInternalPages('pages');
									loading('body', true);
								})
							}
						});
					}
				});
			}
		});
		$(document).on('click', '.save-page', function(){
			if(!$('#pagetitle').val()){
				alert('Debes indicar un nombre para la nueva pagina');
			}else{
				loading('body');
				var _title = $('#pagetitle').val();
				var _path = formatThis(_title, 'url');

				var _content  = '---\n';
						_content += 'layout: default\n';
						_content += 'title: ' + _title + '\n';
						_content += 'permalink: ' + _path + '\n';
						_content += '---\n';
						
				mH.pages[_path] = {
					title: _title
				}

				createFile({
					owner: gOwner,
					repo: gRepo,
					path: _path + '.html',
					content: encodeContent(_content),
					message: 'commited from the website',
					branch: 'master',
					action: function(data, status, xhr){
						updatemH(function(){
							populateInternalPages('pages');
							$('.create-page, .new-page').toggleClass('d-none');
							loading('body', true);
							$('#pagetitle').val('');
						})	
					}
				});
			}
		});		
	
	//Edit Navigation
		function populateNavigation(){
			$('#mhAdminpage .all-pages, #mhAdminpage .nav-pages').empty();
			$.each(mH.pages, function(i, v){
				$('#mhAdminpage .all-pages').append('<li class="list-group-item" data-permalink="' + i + '"  data-title="' + v.title + '">' + v.title + '<div class="btn-group btn-group-sm float-right"><span class="btn xs btn-outline-secondary move"><i class="fas fa-arrows-alt"></i></span><span class="btn xs btn-outline-danger rm"><i class="fas fa-times-circle"></i></span></div></li>');
			});			
			$.each(mH.nav, function(i, v){
				$('#mhAdminpage .nav-pages').append('<li class="list-group-item" data-permalink="' + v.permalink + '" data-title="' + v.title + '">' + v.title + '<div class="btn-group btn-group-sm float-right"><span class="btn xs btn-outline-secondary move"><i class="fas fa-arrows-alt"></i></span><span class="btn xs btn-outline-danger rm"><i class="fas fa-times-circle"></i></span></div></li>');
			});
			$( ".nav-pages" ).sortable({
		    revert: true,
		    handle: ".move",
		    start: function(event, ui){
		    	
		    },
		    stop: function(event, ui){
		    	
		    },
		    receive: function(event, ui){
		    	$(event.target).find('li[style]').removeAttr('style');
				}
		  });
		  $( ".all-pages li" ).draggable({
		    connectToSortable: ".nav-pages",
		    helper: "clone",
		    appendTo: ".nav-pages",
		    cursor: "crosshair",
		    handle: ".move",
		    start: function(event, ui){
		    	
		    },
		    stop: function(event, ui){
		    	
		    },
			});								
		}
		$(document).on('click', '#mhnav .nav-pages .rm', function(){
			$(this).closest('li').remove();
			///
		});
		$(document).on('click', '.save-nav', function(){
			loading('body');
			mH.nav = [];
			$('#mhnav .nav-pages li').each(function( index ) {
				var myObj = {};
				myObj.permalink_en = $(this).attr('data-permalink_en');
				myObj.permalink_es = $(this).attr('data-permalink_es');
				myObj.title_en = $(this).attr('data-title_en');
				myObj.title_es = $(this).attr('data-title_es');
				mH.nav.push(myObj)
			});
			
			updateFile({
				owner: gOwner,
				repo: gRepo,
				path: '_data/menu.yml',
				content: encodeContent(jsyaml.dump(mH.nav)),
				message: 'commited from the website',
				branch: 'master',
				action: function(data, status, xhr){
					updatemH(function(){
						loading('body', true);
					})
				}
			});				
		});
	
	//Handle images
		function openImages(par){
			var folder = par.folder;
			var element = par.element;
			var multiple = par.multiple;
			var action = par.action;
			console.log('Open: ' + folder)
			loading(element);
			if(selectedImages.length > 0){//Test wheter there is any selected image in order to show the "use this image" button
				$('#imagesModal .use').attr('style', 'visibility:visible');
			}else{
				$('#imagesModal .use').attr('style', 'visibility:hidden');
			}
			$(element + ' .mhImagesf .folderlist').empty();//Remove currently displayed folders and images
			$(element + ' .mhImagesI').empty();//Remove currently displayed folders and images
			$(element + ' .mhImagesf').attr('data-current-path', folder);//Update this attr. which is used to decide if the "back" button is displayed
			var prev = folder.substr(0, folder.lastIndexOf("/"));//The prev path is the current path without the last(current) folder
			$(element + ' .mhImagesf .prev').attr('data-path', prev);//Assign the value to the "back" button
			//Get the current folder (only the name of the folder, not the whole path)
			var n = folder.lastIndexOf('/');
			var currentFolder = folder.substring(n + 1);
			$(element + ' .current-folder').text(currentFolder);

			$.post(imagesUrl, { folder: folder },function(data, status){//Call heroku to ask Cloudinary for the images
				var myArray = JSON.parse(data);//Parse the received data to convert it to an array
				cloudFolders = myArray[0];//The first element in the array are the folders
				cloudImages = myArray[1];//And the second one are the images
				populateFolders(element);
				populateImages(element);
				if(action){
					action();
				}
				loading(element);
			});
		}
		function populateFolders(element){
			$.each(cloudFolders, function( index, value ) {//For each value create a clickable folder
				if(value.name !== 'admin'){
				  var item 	= '<span data-path="' + value.path + '">';
					item 			+= '	<i class="far fa-folder"></i> ';
					item 			+= value.name;
					item 			+= '</span>';
				
					$(element + ' .mhImagesf .folderlist').append(item);
				}
			});	
		}
		function populateImages(element){
			$.each(cloudImages, function( index, value ) {//for each value create an image thumbnail
			  var item 	= '<span class="image" data-publicid="' + value.public_id + '"><img src="' + value.url + '" class="img-thumbnail img-fluid"></span>';
				$(element + ' .mhImagesI').append(item);	
			});	
		}
		$(document).on('click', '.mhImagesf span', function(){//Navigating through the folders
			var goTo = $(this).attr('data-path');//The data-path attr. of the clicked element holds the folder path in cloudinary
			if($('#imagesModal').hasClass('show')){
				var element = '#imagesModal';
			}else{
				var element = '#mhAdminpage';
			}
			openImages({
				folder: goTo,
				element: element
			});//Display images and subfolders for the selected path
		});
		$(document).on('click', '#mhAdminpage .mhImagesI .image', function(){//Delete the image
			var image = $(this);
			var public_id = $(this).attr('data-publicid');
			var del = confirm('Seguro que deseas eliminar la imagen?');
			if(del === true){
				$.post(imagesUrl, { delete: public_id },function(data, status){//Call heroku to ask Cloudinary for the images
					if(data.startsWith('{"deleted":')){
						$(image).remove();
					}
				});		
			}
		});		
		$(document).on('click', '.upload-images', function(){
			if($('#dropzone-area').is(':empty')){
				initDropZone();
			}
			$('#uploadPath').val($('#mhAdminpage .mhImagesf').attr('data-current-path').replace('Home/', '').replace('Home', ''));
			$('.mhListImages, .mhUploadImages').toggleClass('d-none');
		});
		$(document).on('click', '.hide-dropzone', function(){
			if($(this).hasClass('reload')){
				var returnPath = $('#mhAdminpage .input-group-text').text() + $('#mhAdminpage #uploadPath').val();
				openImages({
					folder: returnPath.replace(/\/$/, ""),
					element: '#adminTabContent',
					action: function(){
						$('.hide-dropzone').removeClass('reload');
						$('.mhListImages, .mhUploadImages').toggleClass('d-none');
					}
				});
			}else{
				$('.mhListImages, .mhUploadImages').toggleClass('d-none');
			}
		});
		$(document).on('click', '.preview [data-image], #mhAdminpage [data-image]', function(){
			$('#imagesModal').modal('toggle');
			if($(this).attr('data-target')){
				imageTarget = $(this).attr('data-target');
			}else{
				imageTarget = $(this);
			}
		});
		$(document).on('click', '.preview .input-group-append .rm-image', function(){
			$('.preview .input-image').val('');
			imageTarget = $(this).attr('data-target');
			if($(imageTarget).hasClass('bg') || $(imageTarget).hasClass('slide')){
				$(imageTarget).removeAttr('style');
			}
			$('.preview [data-mhsection]').removeClass('bg-image');
		});						
		$(document).on('shown.bs.modal', '#imagesModal', function (e) {
			$('.ct-toolbox, .ct-inspector').hide();
			openImages({
				folder: 'Home',
				element: '#imagesModal'
			});
		});
		$(document).on('hidden.bs.modal', '#imagesModal', function (e) {
			$('.ct-toolbox, .ct-inspector').show();
			selectedImages = [];
			$('#imagesModal').removeClass('multiple');
			$('#imagesModal .use').removeClass('content-tools');
		});
		$(document).on('click', '#imagesModal img', function(){//handle the selection of images to use
			var imgUrl = $(this).attr('src');
			//$(this).toggleClass('uselected');//Toggle the "uselected" class on the image to reflect its status
			
			if($('#imagesModal').hasClass("multiple")){
				if($(this).hasClass('uselected')){
					$(this).removeClass('uselected');
					var thisIndex = selectedImages.indexOf(imgUrl);//Find its index in the "selectedImages" array
					selectedImages.splice(thisIndex, 1);//Remove it from the array					
				}else{
					$(this).addClass('uselected');
					selectedImages.push(imgUrl);//Insert it in the "selectedImages" array					
				}
			}else{
				if($(this).hasClass('uselected')){
					$(this).removeClass('uselected');
					selectedImages = [];//Empty the the "selectedImages" array				
				}else{
					selectedImages = [];//Empty the the "selectedImages" array
					$('.uselected').removeClass('uselected');
					$(this).addClass('uselected');
					selectedImages.push(imgUrl);//Insert it in the "selectedImages" array
				}
			}

			if(selectedImages.length > 0){//Test wheter there is any selected image in order to show the "use this image" button
				$('#imagesModal .use').attr('style', 'visibility:visible');
			}else{
				$('#imagesModal .use').attr('style', 'visibility:hidden');
			}
		});
		$(document).on('click', '#imagesModal .use:not(.content-tools)', function(){
			if($(imageTarget).hasClass('bg') || $(imageTarget).hasClass('slide')){
				$(imageTarget).attr('style', 'background-image: url(' + selectedImages[0] + ')');
				if(imageTarget === '.preview .bg'){
					$('.preview [data-mhsection]').addClass('bg-image');
				}
				$('.input-image')
			}
			if($(imageTarget).hasClass('mhgallery')){
				$('.mhgallery').empty();
				$.each(selectedImages, function( index, value ) {
					var galItem  = '<a class="card" href="' + value + '">';
							galItem += '  <span style="background-image: url(' + value + ')">';
							galItem += '		<span class="over"><i class="fas fa-search-plus"></i></span>';
							galItem += '  </span>';
							galItem += '</a>';
					$('.mhgallery').append(galItem);
				});
			}
			if(imageTarget === '.preview img'){
				$(imageTarget).attr('src', selectedImages[0]);
			}
			if(imageTarget === '.product-preview'){
				$(imageTarget).attr('src', selectedImages[0]);
				var imgName = selectedImages[0].lastIndexOf('/');
				imgName = selectedImages[0].substring(imgName + 1);					
				$('#pimage').val(imgName);				
			}
			if($(imageTarget).hasClass('bg') || $(imageTarget).hasClass('slide')){
				var imgName = selectedImages[0].lastIndexOf('/');
				imgName = selectedImages[0].substring(imgName + 1);					
				$('.preview .input-image').val(imgName);
			}
			$('#imagesModal').modal('toggle');
		});
		$(document).on('keyup', '#uploadPath', function(){
		  if(!$(".dz-default").is(":visible")){
		  	$('#dropzone-area').html('<div class="dz-default dz-message"><span>Arrastra las imágenes de tu computador ó Haz click aqui para buscar.</span></div>');
		  	$(".dz-default").show();
		  }
		});
	
	//Productsn
		function populateSpecials(_type){
			var listSelector = '#mh' + _type + ' ul';
			var editFunctionParams = '&quot edit&quot, &quot ' + _type + '&quot';
			$(listSelector).empty();
			$.each(mH[_type], function( index, value ) {
				var productDetails = jsyaml.load($.trim(decodeContent(atob(mH[_type][index])).split('---')[1]));
				var product  = '<li class="media" data-file="' + index + '">';
						product += '  <img class="mr-3 card" src="' + productDetails.image + '">';
						product += '  <div class="media-body">';
						product += '    <h5 class="mt-0 mb-1">';
						product += '    	<span class="title">';
						product += 					productDetails.title;
						product += '    	</span> / ';
						product += '    </h5> ';
						product += '		<div class="btn-group">';
						product += '		  <span class="btn btn-sm btn-danger" onclick="deleteSpecials(' + _type + ')">';
						product += '		    <i class="fas fa-times"></i> Eliminar';
						product += '		  </span>';
						product += '		  <span class="btn btn-sm btn-info" onclick="editSpecials('+ editFunctionParams + ', this)">';
						product += '		    <i class="fas fa-edit"></i> Editar';
						product += '		  </span>';
						product += '		</div>';
						product += '    <div>(<span class="scientific">' + productDetails.scientific + '</span>)</div>';
						product += '  </div>';
						product += '</li>';
			  $(listSelector).append(product);
			});
		}

		function editSpecials(_action, _type, _clicked){
			_action = _action.trim();
			_type = _type.trim();
			if(_action === 'create'){
				$('.product-edit').removeAttr('data-editing');
				$('#ptitle').val('');
				$('#pimage').val('');
				$('.product-preview').attr('src', '');
				toggleProducts(_type);
			}else{
				var fileName = $(_clicked).closest('.media').attr('data-file');
				var image    = $(_clicked).closest('.media').find('img').attr('src');
				var imgName  = image.lastIndexOf('/');
				imgName      = image.substring(imgName + 1);			
				var title    = $(_clicked).closest('.media').find('.title').text();
				var _path		 = $(_clicked).closest('.media').attr('data-file');
				var extraType = _type === 'camps' ? 'campamentos' : 'promociones';
				$('.product-edit.' + _type).attr('data-editing', fileName);
				$('.' + _type + ' #ptitle').val(title);
				$('.' + _type + ' #pimage').val(imgName);
				$('.' + _type + ' .product-preview').attr('src', image);
				$('.' + _type + ' .edit-page').attr('href', baseUrl + extraType + '/' + _path)
				toggleProducts(_type)
			}
		}
		function deleteProduct(clicked){
			var close = confirm('Seguro que deseas eliminar este producto? \nEsta accion no puede deshacerse.');
			if(close){
				loading('body');
				var fileName = $(clicked).closest('.media').attr('data-file');
				delete mH.products[fileName];
				deleteFile({
					owner: gOwner,
					repo: gRepo,
					path: '_products/' + fileName,
					message: 'commited from the website',
					action: function(data, status, xhr){
						updatemH(function(){
							populateProducts();
							loading('body', true);
						})
					}
				})			
			}			
		}		
		function toggleProducts(_type){
			$('.product-list.' + _type + ', .product-edit.' + _type).toggle();
			///
		}
		function saveProduct(_type, _clicked){
			var fileName = $(_clicked).closest('.product-edit').attr('data-editing');
			var title = $(_clicked).closest('.product-edit').find('#ptitle').val();
			var condensedType = _type === 'campamentos' ? 'camps' : 'promos';
			if($(_clicked).closest('.product-edit').attr('data-editing')){
				var fileName = $(_clicked).closest('.product-edit').attr('data-editing');
			}else{
				var fileName = formatThis(title, 'url') + '.html';
			}			
			var _path = _type + '/' + fileName;
			loading('body');
			getContents({
				owner: gOwner,
				repo: gRepo,
				path: _path,
				action: function(data, status, xhr){
					var content = atob(decodeContent(data.content));
					var contentSections = $.trim(content.split('---')[2])
					var title = $.trim($('.' + _type + ' #ptitle').val());
					var image = $('.' + _type + ' .product-preview').attr('src');
					
					var fileContent  = '---\n';
							fileContent += 'title: ' + title + '\n';
							fileContent += 'layout: default\n';
							fileContent += 'image: ' + image + '\n';
							fileContent += '---\n';
							fileContent += contentSections;
							fileContent = encodeContent(fileContent);

					if(_type === 'campamentos'){
						mH.camps[fileName] = fileContent;
					}else{
						mH.promos[fileName] = fileContent;
					}

					if($('.product-edit').attr('data-editing')){
						updateFile({
							owner: gOwner,
							repo: gRepo,
							path: _path,
							content: fileContent,
							message: 'commited from the website',
							branch: 'master',
							action: function(data, status, xhr){
								updatemH(function(){
									loading('body', true);
									populateSpecials(condensedType);
									toggleProducts(condensedType);
								})
							}
						});				
					}else{
						createFile({
							owner: gOwner,
							repo: gRepo,
							path: _path,
							content: fileContent,
							message: 'commited from the website',
							branch: 'master',
							action: function(data, status, xhr){
								updatemH(function(){
									loading('body', true);
									populateSpecials(condensedType);
									toggleProducts(condensedType);
								})								
							}
						});				
					}
				}
			})			
			// 
			// var title = $.trim($('.' + _type + ' #ptitle').val());
			// var image = $('.' + _type + ' .product-preview').attr('src');
			// if($('.product-edit.' + _type).attr('data-editing')){
			// 	var fileName = $('.product-edit.' + _type).attr('data-editing');
			// }else{
			// 	var fileName = formatThis(title, 'url') + '.html';
			// }
			// var fileContent  = '---\n';
			// 		fileContent += 'title: ' + titleEn + '\n';
			// 		fileContent += 'layout: default\n';
			// 		fileContent += 'image: ' + image + '\n';
			// 		fileContent += '---\n';
			// 		fileContent = encodeContent(fileContent);

			// mH.products[fileName] = fileContent;

			// if($('.product-edit').attr('data-editing')){
			// 	updateFile({
			// 		owner: gOwner,
			// 		repo: gRepo,
			// 		path: '_products/' + fileName,
			// 		content: fileContent,
			// 		message: 'commited from the website',
			// 		branch: 'master',
			// 		action: function(data, status, xhr){
			// 			updatemH(function(){
			// 				loading('body', true);
			// 				populateProducts();
			// 				toggleProducts();
			// 			})
			// 		}
			// 	});				
			// }else{
			// 	createFile({
			// 		owner: gOwner,
			// 		repo: gRepo,
			// 		path: '_products/' + fileName,
			// 		content: fileContent,
			// 		message: 'commited from the website',
			// 		branch: 'master',
			// 		action: function(data, status, xhr){
			// 			updatemH(function(){
			// 				loading('body', true);
			// 				populateProducts();
			// 				toggleProducts();
			// 			})								
			// 		}
			// 	});				
			// }
		}

//Start-Stop-Save
		function edit(){
			loading('body');
			$('html').attr('id', 'mhEditing');
			$('[data-options]').prepend($('#adminHtml .mhOptions').clone());
			//Sliders need to be destroyed, the slider js adds extra slides, this fucks up the sections that need to be found in the altPage code
				destroySlider('.slider');
			//We call the altPage and store it's contents on "altPage" var only if altPage isn't filled yet and if content is not empty (if content is empty I don't need to call it because the page is empty)
			initSlider('.slider');
				loading('body');
		}
		function stop(){
			$('html').removeAttr('id');
			$('[data-options] .mhOptions').remove();
		}
		function save(){
			stop();
			loading('body');
			//Destroy every element loaded by js
				//Slider
				if($('#mhContent .slider'.length !== 0)){
					destroySlider('#mhContent .slider');
				}
				//Gallery
				if($('.mhgallery'.length !== 0)){
					$('[lg-uid]').removeAttr('lg-uid');
					$('[lg-event-uid]').removeAttr('lg-event-uid');
				}

			//Save the contents of #mhContent inside the #toSave (2 copies, one for english and one for spanish)
			$('#toSave .en, #toSave .es').html($('#mhContent')[0].innerHTML);
			//Remove spanish content from english div and viceversa
			$('#toSave .en [data-lang=es]').remove();
			$('#toSave .es [data-lang=en]').remove();
			//Remove sortable classes
			$('#toSave .sortable').removeClass('sortable');
			//Re-Init js laoded sections
				//Slider
					if($('$mhContent .slider'.length !== 0)){
						initSlider('#mhContent .slider');
					}			
			//Convert js rendered products into jekyll sintax
				if($('#toSave .js-content').length > 0){
					$('#toSave .js-content').remove();
				}
			//Convert jeyll rendered content into jekyll sintax
				if($('#toSave [data-mhsection=contact_data]').length > 0){
					var address = '{% for item in site.address %}<div><i class="fas fa-map-marker-alt"></i> {{ item }}</div>{% endfor %}';
					var phone = '{% for item in site.phones %}<div><i class="fas fa-phone-volume"></i> <a href="tel: {{ item }}">{{ item }}</a></div>{% endfor %}';
					var mail = '{% for item in site.emails %}<div><i class="fas fa-envelope"></i> {{ item }}</div>{% endfor %}';
					$('#toSave [data-mhsection=contact_data] .address').html(address);
					$('#toSave [data-mhsection=contact_data] .phone').html(phone);
					$('#toSave [data-mhsection=contact_data] .mail').html(mail);
				}
				if($('#toSave [data-mhsection=products_preview]').length > 0){
					$('#toSave [data-mhsection=products_preview] .row').html($('.jekyll-products-preview').clone());
					$('#toSave .jekyll-products-preview > *').unwrap();
				}
				if($('#toSave [data-mhsection=page_title]').length > 0){
					$('#toSave [data-mhsection=page_title] .container').html('<h1 class="page-title">{{ page.title | upcase}}</h1>');
				}
				if($('#toSave [data-mhsection=products]').length > 0){
					$('#toSave [data-mhsection=products] .row').html($('.jekyll-products').clone());
					$('#toSave .jekyll-products > *').unwrap();
				}								

			//Create the content for the page (en & es)
			var fileName = $('body').attr('data-name');
			var pageName = fileName.replace('.html', '');
			var enHTML = '';
			var esHTML = '';
			$('#toSave .en > *').each(function(i, v) {
			  enHTML += $.trim(v.outerHTML)
			});
			$('#toSave .es > *').each(function(i, v) {
			  esHTML += $.trim(v.outerHTML)
			});			
			var enContent  = '---\n';
					enContent += 'layout: default\n';
					enContent += 'title: ' + mH.pages[pageName].title_en + '\n';
					enContent += 'alttitle: ' + mH.pages[pageName].title_es + '\n';
					enContent += 'permalink: ' + mH.pages[pageName].permalink_en + '\n';
					enContent += 'altpermalink: ' + mH.pages[pageName].permalink_es + '\n';
					enContent += 'lang: en\n';
					if(pageName === 'index'){
						enContent += 'checklang: true			\n';
					}
					enContent += '---\n';
					enContent += enHTML;
			var esContent  = '---\n';
					esContent += 'layout: default\n';
					esContent += 'title: ' + mH.pages[pageName].title_es + '\n';
					esContent += 'alttitle: ' + mH.pages[pageName].title_en + '\n';
					esContent += 'permalink: ' + mH.pages[pageName].permalink_es + '\n';
					esContent += 'altpermalink: ' + mH.pages[pageName].permalink_en + '\n';
					esContent += 'lang: es\n';
					esContent += '---\n';
					esContent += esHTML;
			//Save the pages
			updateFile({
				owner: gOwner,
				repo: gRepo,
				path: fileName,
				content: encodeContent(enContent),
				message: 'commited from the website',
				branch: 'master',
				action: function(data, status, xhr){
					updateFile({
						owner: gOwner,
						repo: gRepo,
						path: 'es/' + fileName,
						content: encodeContent(esContent),
						message: 'commited from the website',
						branch: 'master',
						action: function(data, status, xhr){
							$('#toSave .en, #toSave .es').empty();
							loading('body', true);
						}
					});
				}
			});
		}

//Init-Destroy sections on demand (needed to remove everything added by js plugins and save or access raw section html)
	//Slider
		function initSlider(slider){
			$(slider).slick({
				prevArrow: '<div class="prev"><i class="fas fa-chevron-circle-left left"></i></div>',
				nextArrow: '<div class="next"><i class="fas fa-chevron-circle-right right"></i></div>'
			});
		}
		function destroySlider(slider){
			$(slider).slick('unslick');
			$('.slide').removeAttr('tabindex role id aria-describedby');
		}

//Edit section's content
	//ContentTools editor
		function editorInit(parent, start){
			if($(parent + ' [data-editable').length !== 0){
				//Example to add style options for tags
					ContentTools.StylePalette.add([
					  new ContentTools.Style('Center', 'center', ['img'])
					]);
				//Init the editor
					editor = ContentTools.EditorApp.get();
					editor.init(parent + ' [data-editable]', 'data-name');
				//Start event
					editor.addEventListener('started', function (ev) {
						//Images added through the editor if resized when the editor is open they lose their size, this gives it to them
						$('.ce-element--type-image').each(function( index ) {
							var str = $( this ).attr('data-ce-size');
							var width = str.split('w ').pop().split(' ').shift();
							var height = str.split('h ').pop();
							$(this).attr('width', width);
							$(this).attr('height', height);
						});
					});
				//Stop event
					editor.addEventListener('stop', function (ev) {
					
					});
				//Save event
					editor.addEventListener('save', function (ev) {
						
					});

				if(start){
					editor.start();
				}
			}			
		}
	
	function editSection(section){
		//Open the editing area
		$('#mhSectionOptions .preview').empty();
		$('.mhOptions').addClass('d-none')
		$('html').toggleClass('sections-open');
		//Target section being edited
			editingSection = section;
			sectionType = $(editingSection)[0].getAttribute('data-mhsection');
		//Call the specific function for the type of section being edited	
		editFunctions[sectionType]();
		if(typeof editor !== 'undefined'){
			editor.start();
		}else{
			editorInit('#mhSectionOptions', true);
		}
		
	}
	
	function closeSection(){
		var close = confirm('Seguro que deseas cerrar esta ventana? \nLos cambios a la seccion se perderan.');
		if(close){
			$('html').toggleClass('sections-open');
			$('.mhOptions').removeClass('d-none')
			$('#mhSectionOptions .preview').empty();
			editor.stop(true);
		}
	}

	function saveSection(){
		$('.mhOptions').removeClass('d-none')
		$('html').toggleClass('sections-open');
		if(sectionType === 'header_slider' || sectionType === 'slider'){
			//Add a class so I can init the slider once appended to the mhContent
			$('.preview [data-options]').addClass('initSlider');
			//Remove the active class used to edit one slide at a time
			$('.preview .slide').removeClass('active');
		}
		if(sectionType === 'gallery_text'){
			var galleryId = $('.preview .mhgallery').attr('id');
		}
		if(sectionType === 'text_image'){
			$('.preview img').unwrap();
		}
		if(sectionType === 'destacados'){
			$('.card.active').removeClass('active');
		}		
		$(editingSection).replaceWith($('.preview [data-options]'));
		//If the editing section 
		if(sectionType === 'header_slider' || sectionType === 'slider'){
			initSlider('.initSlider .slider');
			$('.initSlider').removeClass('initSlider');					
		}
		if(sectionType === 'gallery_text'){
			lightGallery(document.getElementById(galleryId));
		}

		editor.stop(true);
	}

	function removeSection(section){
		var del = confirm('Seguro que deseas eliminar esta sección de la pagina?');
		if(del === true){
			$(section).remove();
		}		
	}
	
	var editFunctions = {
		slider: function(){
			//Insert slider options
			$('.preview').append($('.slider-edit').clone());
			$('.slider-edit .number').text('1');
			//Detach the slider so I can append the raw html to the preview
			var slider = $(editingSection).find('.slider');
			destroySlider($(slider));
			//Append the slider raw html to the preview
			$('.preview .slider-edit').append($(editingSection).clone());
			//Add the active class (so I can edit one slide at a time)
			$('#mhSectionOptions .slider-edit .slide:first-of-type').addClass('active');
			//get the slide image and place it like the input value
			var bgImg = $('#mhSectionOptions .slider-edit .slide:first-of-type .bg').css('background-image').replace('url("', '').replace('")', '');
			var imgName = bgImg.lastIndexOf('/');
			imgName = bgImg.substring(imgName + 1);	
			if(!bgImg.includes("picsum")){
				$('#mhSectionOptions .slider-edit input').val(imgName);
			}
			if($('.preview .slider').hasClass('container')){
				$('.preview input#content').prop('checked', true)
			}else{
				$('.preview input#full').prop('checked', true)
			}
			//Init the slider on the page again
			initSlider($(slider));
		},
		text_image: function(){
			//Insert gallery options
			$('.preview').append($('.image-text-edit').clone());			
			//Clone the section into the editing area
			$('#mhSectionOptions .preview').append(editingSection.clone());
			if($('.preview .text').hasClass('order-lg-2')){
				$('#derecha').prop("checked", true);
			}else{
				$('#izquierda').prop("checked", true);
			}
			if($('.preview .bg').attr('style')){
				var bgImg = $('.preview .bg').css('background-image').replace('url("', '').replace('")', '');
				var imgName = bgImg.lastIndexOf('/');
				imgName = bgImg.substring(imgName + 1);					
				$('.preview .input-image').val(imgName);				
			}
			$('.preview img').wrap('<div class="change-image" data-image data-target=".preview img"></div>');
		},
		gallery_text: function(){
			//Insert gallery options
			$('.preview').append($('.gallery-edit').clone());
			//Clone the section into the editing area
			$('#mhSectionOptions .preview').append(editingSection.clone());
			$('.preview [lg-uid]').removeAttr('lg-uid');
			$('.preview [lg-event-uid]').removeAttr('lg-event-uid');
			if($('.preview .text').hasClass('order-lg-2')){
				$('#derecha').prop("checked", true);
			}else{
				$('#izquierda').prop("checked", true);
			}
			if($('.preview .bg').attr('style')){
				var bgImg = $('.preview .bg').css('background-image').replace('url("', '').replace('")', '');
				var imgName = bgImg.lastIndexOf('/');
				imgName = bgImg.substring(imgName + 1);					
				$('.preview .input-image').val(imgName);				
			}
			if($('.preview .mhgallery').hasClass('big')){
				$('#destacada').prop("checked", true);
			}else{
				$('#normal').prop("checked", true);
			}
		},
		page_title: function(){
			//Insert page title options
			$('.preview').append($('.page-title-edit').clone());
			//Clone the section into the editing area
			$('#mhSectionOptions .preview').append(editingSection.clone());
		},
		destacados: function(){
			//Insert slider options
			$('.preview').append($('.destacados-edit').clone());
			$('.destacados-edit .number').text('1');			
			//Clone the section into the editing area
				$('.preview .destacados-edit').append(editingSection.clone());	
			//Add the active class (so I can edit one slide at a time)
			$('.destacados-edit [data-options] .row > div:first-of-type .card').addClass('active');
			//get the slide image and place it like the input value
			var bgImg = $('#mhSectionOptions .destacados-edit .card:first-of-type').css('background-image').replace('url("', '').replace('")', '');
			var imgName = bgImg.lastIndexOf('/');
			imgName = bgImg.substring(imgName + 1);	
			if(!bgImg.includes("picsum")){
				$('#mhSectionOptions .destacados-edit input').val(imgName);
			}							
		},
		products_preview: function(){
			//Insert slider options
			$('.preview').append($('.productos-edit').clone());	
			//Clone the section into the editing area
				$('.preview .productos-edit').append(editingSection.clone());
			if($('.preview .bg').attr('style')){
				var bgImg = $('.preview .bg').css('background-image').replace('url("', '').replace('")', '');
				var imgName = bgImg.lastIndexOf('/');
				imgName = bgImg.substring(imgName + 1);					
				$('.preview .input-image').val(imgName);				
			}									
		},
		map: function(){
			//Insert slider options
			$('.preview').append($('.map-edit').clone());	
			//Clone the section into the editing area
				$('.preview').append(editingSection.clone());
		},
		contact_data: function(){
			//Insert slider options
			$('.preview').append($('.contact-edit').clone());	
			//Clone the section into the editing area
				$('.preview').append(editingSection.clone());	
			if($('.preview .js-content').length !== 0){
				var addressContainer = $('.preview .js-content address');
			}else{
				var addressContainer = $('.preview address');
			}
			if($(addressContainer).find('.address').is(":visible")){
				document.getElementById("address-check").checked="true";
			}
			if($(addressContainer).find('.phone').is(":visible")){
				document.getElementById("phone-check").checked="true";
			}	
			if($(addressContainer).find('.mail').is(":visible")){
				document.getElementById("mail-check").checked="true";
			}						
		},
		text: function(){
			//Clone the section into the editing area
			$('#mhSectionOptions .preview').append(editingSection.clone());
		},		
	}

	//Individual sections options
		//Change text position in sections which display text + some media
			$(document).on('change', 'input[type=radio][name=position]', function(){
				if($(this).val() === 'left'){
					$('.preview [data-mhsection="gallery_text"] .text').removeClass('order-lg-2');
					$('.preview [data-mhsection="text_image"] .text').removeClass('order-md-2');
        }else{
        	$('.preview [data-mhsection="gallery_text"] .text').addClass('order-lg-2');
        	$('.preview [data-mhsection="text_image"] .text').addClass('order-md-2');
        }				
			})
		
		//Slider
			//navigate the slides
				function changeSlide(action){
					var nextSlide;
					if(action === 'prev'){
						if($('.slider-edit .slide.active').prev().length === 1){
							nextSlide = $('.slider-edit .slide.active').prev();
						}else{
							nextSlide = $('.slider-edit .slide:last-of-type');
						}					
					}else{
						if($('.slider-edit .slide.active').next().length === 1){
							nextSlide = $('.slider-edit .slide.active').next();
						}else{
							nextSlide = $('.slider-edit .slide:first-of-type');
						}					
					}
					$('.slide.active').removeClass('active');
					$('.slider-edit input').val('');
					$(nextSlide).addClass('active');						
					var bgImg = $('.slider-edit .slide.active .bg').css('background-image').replace('url("', '').replace('")', '');
					var imgName = bgImg.lastIndexOf('/');
					imgName = bgImg.substring(imgName + 1);
					if(!bgImg.includes("picsum")){
						$('.slider-edit input').val(imgName);
					}					
					currentSlide();			
				}
			//Add a slide
				$(document).on('click', '.slider-edit .add', function(){
					if($('#mhSectionOptions [data-editable]').length !== 0){
						editor.stop(true);
					}
					var timestamp = + new Date();
					// var timestampEs = + new Date();
					// var timestampEn = timestampEs + 1;
					$('.slider-edit .active').removeClass('active');
					$('.slider-edit .slider').append('<article class=\"slide active\"> <div class=\"bg\" style=\"background-image: url(https://picsum.photos/800/400)\"><div data-editable data-name="' + timestamp + '"><p>Edita este texto</p></div></div> </article>');
					/*
					if($('.preview .slider-edit').hasClass('no-text')){
						$('.slider-edit .slider').append('<div class="slide active" style="background-image: url(https://picsum.photos/1200/600/?random)"><div class="slide-content"></div></div>');
					}else{
						$('.slider-edit .slider').append('<article class="slide"> <a href="#" style="background-image: url(https://picsum.photos/800/400)"><p data-editable data-name="' + timestampEs + '">Edit this text</p></a> </article>');
					}
					*/
					editorInit('#mhSectionOptions', true);
					currentSlide();
					$('#mhSectionOptions .slider-edit input').val('');
				});
			//Remove a slide
				$(document).on('click', '.slider-edit .rm', function(){
					$('.slider-edit .slide.active').remove();
					$('.slider-edit .slide:first-of-type').addClass('active');
					currentSlide();
				});
			//Update the number of the slide being edited
				function currentSlide(){
					$('.slider-edit .slide').each(function( index ) {
					  if($(this).hasClass('active')){
							$('.slider-edit .number').text(index + 1);
					  }
					});
				}
			//Set full width or content width
				$(document).on('click', '.slider-edit input[name="slider-width"]', function(){
					if($(this).attr('id') == 'content'){
						$('.slider-edit .slider').addClass('container')
					}else{
						$('.slider-edit .slider').removeClass('container')	
					}
				});
		//Gallery
			//Change first image style
				$(document).on('change', 'input[type=radio][name=firstImage]', function(){
					if($(this).val() === 'big'){
	        	$('.preview .mhgallery').addClass('big');
	        	$('.preview .mhgallery a:last-child').remove()
	        }else{
	        	$('.preview .mhgallery').removeClass('big');
	        	$('.preview .mhgallery').append('<a class="card" href="https://picsum.photos/600/800/?random"> <span style="background-image: url(https://picsum.photos/600/800/?random)"><span class="over"><i class="fas fa-search-plus"></i></span> </span> </a>')
	        }				
				});
				$(document).on('click', '.preview .gallery-images', function(){
					$('#imagesModal').modal('toggle');
					$('#imagesModal').addClass('multiple');
					imageTarget = $('.preview .mhgallery');
				});
			//Prevent clicks on images in preview mode
				$(document).on('click', '.preview .mhgallery .card', function(e){
					e.preventDefault();
				})
		
		//Destacados
			//navigate the slides
				function changeDestacado(action){
					var nextSlide;
					if(action === 'prev'){
						if($('.destacados-edit .card.active').parent().prev().length === 1){
							nextSlide = $('.destacados-edit .card.active').parent().prev().find('.card');
						}else{
							nextSlide = $('.destacados-edit [data-options] .row > div:last-of-type .card');
						}					
					}else{
						if($('.destacados-edit .card.active').parent().next().length === 1){
							nextSlide = $('.destacados-edit .card.active').parent().next().find('.card');
						}else{
							nextSlide = $('.destacados-edit [data-options] .row > div:first-of-type .card');
						}					
					}
					$('.destacados-edit .active').removeClass('active');
					$(nextSlide).addClass('active');						
					var bgImg = $('.card.active').css('background-image').replace('url("', '').replace('")', '');
					var imgName = bgImg.lastIndexOf('/');
					imgName = bgImg.substring(imgName + 1);
					$('.destacados-edit input').val(imgName);
					currentDestacado();			
				}
				function currentDestacado(){
					$('.destacados-edit .card').each(function( index ) {
					  if($(this).hasClass('active')){
							$('.destacados-edit .number').text(index + 1);
					  }
					});
				}	
		
		//Map
			$('.map-edit textarea').focusout(function() {
		    console.log($('.map-edit textarea').val());
		    ///
		  })
		
		//Contact data
			$(document).on('change', '#address-check, #phone-check, #mail-check', function(){
				if($('.preview .js-content').length !== 0){
					var addressContainer = $('.preview .js-content address');
				}else{
					var addressContainer = $('.preview address');
				}
				if($(this).attr('id') === 'address-check'){
					$('.preview .address').toggle();
				}else if($(this).attr('id') === 'phone-check'){
					$('.preview .phone').toggle();
				}else{
					$('.preview .mail').toggle();
				}
			})

		/*
		$(document).on('DOMSubtreeModified', '[data-editable] .ui-wrapper', function(){
			console.log('changed');
		});
		$('[data-editable] .ui-wrapper').bind("DOMSubtreeModified",function(){
		  alert('changed');
		});
		*/