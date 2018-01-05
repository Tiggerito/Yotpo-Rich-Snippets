/*
Web Site Advantage: Adding Schema.org rating and review markup to Yotpo [v2.0]
https://websiteadvantage.com.au/Yotpo-Product-Rating-Review-Rich-Snippets
Copyright (C) 2016 Web Site Advantage
*/
var wsa_yotpoPlaceHolder = ".yotpo-main-widget";
var wsa_yotpoSdFormat = "microdata"; // microdata, json-ld
// -HEADING-

// Place this code after the placeholder element for Yotpo has been created. e.g. in the footer.
// The reason is that this code has to listen for Yotpo adding its stuff to the placeholder. So it has to attach to the placeholder before Yotpo has a go at it.
// ***** To make it more accurate I suggest changing the display date format to YYYY-MM_DD in the Yotpo Widget General Settings.
var webSiteAdvantage = webSiteAdvantage || {};
webSiteAdvantage.yotpoRichSnippets = webSiteAdvantage.yotpoRichSnippets  || [];

webSiteAdvantage.yotpoRichSnippets = function (yotpoPlaceHolder) {
    this.initialise(yotpoPlaceHolder);
};
webSiteAdvantage.yotpoRichSnippets.prototype = {
	// constants
	yotpoPlaceHolder: wsa_yotpoPlaceHolder, 
	format: wsa_yotpoSdFormat, // microdata, json-ld
	
	// call to enable the widget
	constructor: webSiteAdvantage.yotpoRichSnippets,
	initialise: function (yotpoPlaceHolder) {
		// Has to be run after the placeholder is added to the dom, but before Yotpo runs
		// try and find the placeholder if the constant does not work. 
		try {
			if (typeof yotpoPlaceHolder !== 'undefined' && yotpoPlaceHolder != null)
				this.yotpoPlaceHolder = yotpoPlaceHolder;
			
			if (document.querySelector(this.yotpoPlaceHolder) == null) {
				console.log('yotpoRichSnippets: Could not find yotpoPlaceHolder '+this.yotpoPlaceHolder);	
				this.yotpoPlaceHolder = '.yotpo.placeholder';
				console.log('yotpoRichSnippets: Trying '+this.yotpoPlaceHolder);
			};
			
			this._yotpoPlaceHolderElement = document.querySelector(this.yotpoPlaceHolder);
			
			if (this._yotpoPlaceHolderElement != null) {	
				var self = this; // so when observer function is called it can refer back to this object
				
				this._observer = new MutationObserver(function( mutations ) {
					mutations.forEach(function( mutation ) {
						var newNodes = mutation.addedNodes; // DOM NodeList
						if( newNodes !== null ) { // If there are new nodes added
							for (i = 0; i < newNodes.length; i++) {
								var node = newNodes[i];

								if(typeof node.classList !== 'undefined' && node.classList.contains("yotpo-display-wrapper") ) {
									self._observer.disconnect();
									self._observer = null;
									self._addMarkup();
								}
							}
						} 
					}); 
				});

				this._observer.observe(this._yotpoPlaceHolderElement, this._observerConfig);			
			}
			else {
				console.log('yotpoRichSnippets: Could not find yotpoPlaceHolder '+this.yotpoPlaceHolder);
				console.log('yotpoRichSnippets: Failed');
			}	
		} catch(err) {
			console.log('yotpoRichSnippets: initialise Error: '+err.message); // not critical, as long as Googlebot does not cause it
		}
	},	
	// private variables and functions
	_markupAdded: false,
	_observer: null,
	_observerConfig: { 
		attributes: true, 
		childList: true, 
		characterData: true,
		subtree: true
	},
	_yotpoPlaceHolderElement: null,
	_getCount: function (rating) {
		var sElement = document.querySelector('.yotpo-distibutions-sum-reviews span[data-score-distribution="'+rating+'"]');
	  
		if (sElement != null) {
			var s = sElement.textContent;
			if (s.length >= 3)
				return parseInt(s.substr(1, s.length-2)); // remove quotes around the text.
		}
		// console.log('yotpoRichSnippets: Failed to find count for rating '+rating+'. Using 0');
		return 0;
	},
	
	_getReviewCount: function () {
		var sElement = document.querySelector('.yotpo-reviews-nav-tab-sum');
	
		if (sElement != null) {
			var s = sElement.textContent;
	  
			if (s.length >= 3)
				return parseInt(s.substr(1, s.length-2)); // remove quotes around the text.
		}
		console.log('yotpoRichSnippets: Failed to find reviewCount. Using 0');
		return 0;
	},
	_addMarkup: function () {
		if (this._markupAdded) return;
		this._markupAdded = true;
		
		try {
		
			var stars5 = this._getCount(5);
			var stars4 = this._getCount(4);
			var stars3 = this._getCount(3);
			var stars2 = this._getCount(2);
			var stars1 = this._getCount(1);
			var reviewCount = stars5+stars4+stars3+stars2+stars1;
			var ratingValue = (stars5*5+stars4*4+stars3*3+stars2*2+stars1*1)/reviewCount;
			
			if (reviewCount == 0 ) {
				// try without the widget. gets to the nearest 0.5
				reviewCount = this._getReviewCount();
			
				ratingValue  = document.querySelectorAll('.yotpo-stars-and-sum-reviews .yotpo-stars .yotpo-icon-star').length + document.querySelectorAll('.yotpo-stars-and-sum-reviews .yotpo-stars .yotpo-icon-half-star').length/2; 	
			}
			
			// console.log('yotpoRichSnippets: Reviews '+reviewCount);
			// console.log('yotpoRichSnippets: Rating '+ratingValue);
			
			if (reviewCount > 0) {

				var url = window.location.href;
				var canonicalTag = document.querySelector("link[rel='canonical']");
				if (canonicalTag) {
					url = canonicalTag.getAttribute("href");
				}

				var jsonLd = {
					"@context": "http://schema.org/",
					"@type": "Product",
					"@id": url+"#Product",
					"review": []

				};
			
				if (this.format == "microdata") {
					var aggregateRatingElement = document.querySelector('.yotpo-stars-and-sum-reviews');
					if (aggregateRatingElement != null) {
						aggregateRatingElement.setAttribute('id','yotpo-aggregate-rating');
						aggregateRatingElement.setAttribute('itemprop','aggregateRating');
						aggregateRatingElement.setAttribute('itemscope','');
						aggregateRatingElement.setAttribute('itemtype','http://schema.org/AggregateRating');
					}
					else
						console.log('yotpoRichSnippets: Failed to find aggregateRating Element');
					
					this._addItemProps(aggregateRatingElement, '.based-on', 'reviewCount', reviewCount);		
					this._addItemProps(aggregateRatingElement, '.yotpo-stars-and-sum-reviews .yotpo-stars', 'ratingValue', ratingValue);
							
					this._appendItemPropMetaTag(aggregateRatingElement, 'worstRating', '1');
					this._appendItemPropMetaTag(aggregateRatingElement, 'bestRating', '5');
				}

				if (this.format == "json-ld") {
					jsonLd.aggregateRating = {
						"@type": "AggregateRating",
						"worstRating": "1",
						"bestRating": "5",
						"ratingValue": ratingValue,
						"reviewCount": reviewCount
					};
				}
				
				var reviewElements = this._yotpoPlaceHolderElement.querySelectorAll('.yotpo-review');
				
				if (reviewElements.length == 0) 
					console.log('yotpoRichSnippets: Failed to find any reviews');
				
				for (r = 0; r < reviewElements.length; r++) { 
					var reviewElement = reviewElements[r];
					
					if (!reviewElement.classList.contains( "yotpo-hidden" )) {
						if (this.format == "microdata") {
							reviewElement.setAttribute('itemprop','review');
							reviewElement.setAttribute('itemscope','');
							reviewElement.setAttribute('itemtype','http://schema.org/Review');
						}	
						var reviewRatingElement = reviewElement.querySelector(".yotpo-review-stars");

						var rating = "";
						
						if (reviewRatingElement != null) {
							if (this.format == "microdata") {
								reviewRatingElement.setAttribute('itemprop','reviewRating'); 
								reviewRatingElement.setAttribute('itemscope','');
								reviewRatingElement.setAttribute('itemtype','http://schema.org/Rating');
							}

							rating = reviewElement.querySelectorAll(".yotpo-icon-star").length;
							
							if (this.format == "microdata")
								this._appendItemPropMetaTag(reviewRatingElement, 'ratingValue', rating);
						}
						else
							console.log('yotpoRichSnippets: Failed to find reviewRating Element for review '+i);
						
						if (this.format == "microdata") {
							this._addItemProps(reviewElement, 'div[itemprop="review"] > .yotpo-header .yotpo-user-name', 'author');
							this._addItemProps(reviewElement, 'div[itemprop="review"] > .yotpo-header .content-title .yotpo-font-bold', 'name');
							this._addItemProps(reviewElement, 'div[itemprop="review"] > .yotpo-main .content-review', 'reviewBody');
							this._addItemProps(reviewElement, 'div[itemprop="review"] > .yotpo-header .yotpo-review-date', 'datePublished');
						}
						if (this.format == "json-ld") {
							var author = this._getInnerHTML(reviewElement, 'div > .yotpo-header .yotpo-user-name');
							var name = this._getInnerHTML(reviewElement, 'div > .yotpo-header .content-title .yotpo-font-bold');
							var reviewBody = this._getInnerHTML(reviewElement, 'div > .yotpo-main .content-review');
							var datePublished = this._getInnerHTML(reviewElement, 'div > .yotpo-header .yotpo-review-date');
							jsonLd.review.push({
								"@type": "Review",
								"author": {
									"@type": "Person",
									"name": author
								},
								"reviewRating": {
									"@type": "Rating",
									"ratingValue": rating
								},
								"name": name,
								"reviewBody": reviewBody,
								"datePublished": datePublished

							});
						}
					}
				} 

				if (this.format == "json-ld") {
					var aggregateRatingScriptElement = document.createElement('script');
					aggregateRatingScriptElement.type = 'application/ld+json';
					aggregateRatingScriptElement.setAttribute("id", "wsa-yotpo-json-id");
					aggregateRatingScriptElement.text = JSON.stringify(jsonLd);
					document.querySelector('head').appendChild(aggregateRatingScriptElement);
				}
			}
		} catch(err) {
			console.log('yotpoRichSnippets: _addMarkup Error: '+err.message); // not critical, as long as Googlebot does not cause it
		}
	},
	_appendItemPropMetaTag: function (parentElement, name, content) {
		var metaElement = document.createElement("meta");   
		metaElement.setAttribute('itemprop',name);
		metaElement.setAttribute('content',content);
		parentElement.appendChild(metaElement);
	},
	_addItemProps: function (baseElement, selector, name, content) {
		var elements = baseElement.querySelectorAll(selector);
		for (i = 0; i < elements.length; i++) { 
			var element = elements[i];
			element.setAttribute('itemprop',name);
			
			if (typeof content !== 'undefined' && content != null)
				element.setAttribute('content',content);
		} 
	},
	_getInnerHTML: function (baseElement, selector) {
		var elements = baseElement.querySelectorAll(selector);
		if (elements.length > 0) { 
			return elements[0].innerHTML;	
		} 
		return "";
	}
};

// let's get this party started. Can pass the selector for the placeholder here.
new webSiteAdvantage.yotpoRichSnippets();