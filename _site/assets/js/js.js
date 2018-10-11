/*
	Global variables
*/
	var baseUrl = 'https://viajesacademicos.com.ve/';
	var loader = '<div class="mhloading"><div class="icon"><i class="fas fa-spinner fa-pulse"></i><i class="fas fa-check" style="display: none;"></i></div></div>';

/*
	Display a loading screen
*/
	function loading(element, confirm){
		if($(element + ' .mhloading').length === 0) {
			$(element).append(loader);
		}else{
    	if(confirm){
    		$('.mhloading i').toggle();
    		setTimeout(function(){
	    		$(element + ' .mhloading').remove();
	    	}, 1500);
    	}else{
    		$(element + ' .mhloading').remove();
    	}
   	}
	}
	
/*
	Control when and how the navbars collapse
*/
	//$('element').outerWidth(true)//gives the width including padding, border and margin
	//$('element').outerWidth()//gives the width including padding and border but excludes margin
	//$('element').width()//gives the width excluding padding, border and margin
	$(window).bind('load resize orientationchange', function(){
	  $('.brand_bar').trigger('testfit');
	  $('nav').trigger('testfit');
	});
	$('.brand_bar').bind('testfit', function(){

		$('.brand_bar').removeClass('just-logo');//remove the class that hides email and phone

		var brand_width   = $('.brand_bar').outerWidth() / 2;
		var logo_width    = $('.logo img').outerWidth(true) / 2;
		var email_width   = $('.email').outerWidth(true);
		var contact_width = $('.phone_social').outerWidth(true);

		if(email_width + logo_width > brand_width || logo_width + contact_width > brand_width){
			$('.brand_bar').addClass('just-logo')
		}

	});
	$('.main-nav').bind('testfit', function(){

		$('.site-header').removeClass('collapsed-menu');

		var items      = $('.main-nav').find('a');
		var itemsWidth = 0;
		var navWidth   = $('.main-nav').outerWidth(true);
		$.each(items,function(i,v){
			itemsWidth  += $(v).outerWidth(true);
		})

		if(itemsWidth > navWidth){
			$('.site-header').addClass('collapsed-menu');
		}
	})

/*
	Control when to show slider and when to show grid
*/
	$(window).bind('load resize orientationchange', function(){
	  if($(window).outerWidth() < 768){
	  	if(!$('.article_grid').hasClass('slick-initialized')){
	  		$('.article_grid').slick({
	  			prevArrow: '<div class="prev"><i class="fas fa-chevron-circle-left left"></i></div>',
      		nextArrow: '<div class="next"><i class="fas fa-chevron-circle-right right"></i></div>'
	  		});
	  	}
	  }else{
	  	if($('.article_grid').hasClass('slick-initialized')){
	  		$('.article_grid').slick('unslick');
	  	}
	  	
	  }
	});

	$(window).bind('load resize orientationchange', function(){
		$.each($('.nav-tabs'), function(i,v){
		  var tabItem = $(v).find('li');
		  var firstitem = $(tabItem[0]);
			var lastitem = $(tabItem[tabItem.length-1]);
			if ( lastitem.offset().top > firstitem.offset().top ) {
	      $(v).addClass('tab-style');
	    }else{
	    	$(v).removeClass('tab-style');
	    }
		})
	});

/*
	Slider initialization 
*/
	$('.slider').slick({
		prevArrow: '<div class="prev"><i class="fas fa-chevron-circle-left left"></i></div>',
		nextArrow: '<div class="next"><i class="fas fa-chevron-circle-right right"></i></div>'
	});
	
/*
	Carousel style slider
*/
	function initializeCarousel(element){
		$(element).slick({
				dots          : true,
				infinite      : true,
				speed         : 300,
				slidesToScroll: 3,
				slidesToShow  : 5,
				autoplay      : true,
				autoplaySpeed : 2000,
				arrows        : false,
				responsive    : [
			    {
						breakpoint: 768,
						settings  : {
			        slidesToShow: 4
			      }
			    },
			    {
						breakpoint: 576,
						settings  : {
			        slidesToShow: 2
			      }
			    }
			  ]
			})
	}
	initializeCarousel('.carousel_items')
	
	$(window).bind('load resize orientationchange', function(){
		var height = $('.carousel_items .slick-track').height();
		$('.carousel_items .slick-slide').height(height);
	});

/*
	Firebase
*/
	//Initialize
		var config = {
	    apiKey: "AIzaSyAV7S95Fhqik3b6JZscnU3L-AS8l_2Avz8",
	    authDomain: "gh-authentication.firebaseapp.com",
	    databaseURL: "https://gh-authentication.firebaseio.com",
	    projectId: "gh-authentication",
	    storageBucket: "gh-authentication.appspot.com",
	    messagingSenderId: "247405669714"
	  };
	  firebase.initializeApp(config);

	//Authenticate
		if($('#admin-page').length !== 0){
			firebase.auth().onAuthStateChanged(function(user) {
				if(user){
					$('.logged').removeClass('d-none')
				}else{
					$('.logged-out').removeClass('d-none')
				}
			})
		}
	  firebase.auth().onAuthStateChanged(function(user) {
		  if (user) {
		  	if (!document.getElementById("mhAdminbar")) {
				  $.getScript('/assets/admin/admin.js?' + new Date(), function(){});
				}
		  }
		});

		function fireSession(event){
			event.preventDefault();//Prevent reload of the page on form submit
			var mail = $.trim($('#adminEmail').val());
			var pass = $.trim($('#password').val());
			if(mail && pass){
				loading('body')
				$('.btn').attr("disabled", true).attr("value", 'Please wait...');
				firebase.auth().signInWithEmailAndPassword(mail, pass).then(function(data){
					window.location.replace(baseUrl);
				}, function(error){
					$('.login-alert').toggle().text(error.message);
					$('.btn').attr("disabled", false).text('Sign in');
				});				
			}else{
				if(!mail){
					$('.mail-alert').toggle();
				}
				if(!pass){
					$('.pass-alert').toggle();
				}
			}
		}

/*
	Gallery
*/
	$('.mhgallery').each(function(){
		lightGallery(document.getElementById($(this).attr('id')));
	});	
