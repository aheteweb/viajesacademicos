var ApiRoot = 'https://api.github.com/';
/*
	PARAMETERS:

		Many API methods take optional parameters. For GET requests, any parameters not specified as a segment in the path can be passed as an HTTP query string parameter:

			curl -i "https://api.github.com/repos/vmg/redcarpet/issues?state=closed"

		In this example, the 'vmg' and 'redcarpet' values are provided for the :owner and :repo parameters in the path while :state is passed in the query string.

		For POST, PATCH, PUT, and DELETE requests, parameters not included in the URL should be encoded as JSON with a Content-Type of 'application/json':

		curl -i -u username -d '{"scopes":["public_repo"]}' https://api.github.com/authorizations

	CLIENT ERRORS:

		There are three possible types of client errors on API calls that receive request bodies:

		1.- Sending invalid JSON will result in a 400 Bad Request response.

				HTTP/1.1 400 Bad Request
				Content-Length: 35

				{"message":"Problems parsing JSON"}
		
		2.- Sending the wrong type of JSON values will result in a 400 Bad Request response.

				HTTP/1.1 400 Bad Request
				Content-Length: 40

				{"message":"Body should be a JSON object"}
		
		3.- Sending invalid fields will result in a 422 Unprocessable Entity response.

				HTTP/1.1 422 Unprocessable Entity
				Content-Length: 149

				{
				  "message": "Validation Failed",
				  "errors": [
				    {
				      "resource": "Issue",
				      "field": "title",
				      "code": "missing_field"
				    }
				  ]
				}

*/

function Api(params) {
	console.log(params.url)
	dbRead({
		path: 'users/' + firebase.auth().currentUser.uid,
		action: function(snapshot){
			var token = snapshot.val();
			console.log(token)
			console.log('params')
			console.log(params)
			$.ajax({
				type: params.method,
				url: params.url,
				data: JSON.stringify(params.apiParams),
				dataType: 'json',
				beforeSend: function(xhrObj){
					xhrObj.setRequestHeader('Accept', params.accept ? params.accept : 'application/vnd.github.v3+json');
					xhrObj.setRequestHeader('Content-Type','application/json;charset=UTF-8');
					xhrObj.setRequestHeader('Authorization', 'token ' + snapshot.val() );
				},
				success: function(data, status, xhr) {
					params.action(data, status, xhr);
				},
				error: function(data, status, xhr) {
					console.log('error')
					console.log(data);
					console.log(status);
					console.log(xhr);
					if(data.statusText === 'You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.'){
						//you incurr in abuse rate limits, do something
					}
				}
			});
		},
		error: function(error){
			console.log(error)
		}
	})	
}

/*
	Extract the link for the next page in the link response header
*/
	function parseLinkHeader(header, action){
		/*
			The link header comes in a form of a string like:
			<https://api.github.com/user/74385/repos?per_page=100&page=5&type=all&sort=created&direction=asc>; rel="next", 
			<https://api.github.com/user/74385/repos?per_page=100&page=5&type=all&sort=created&direction=asc>; rel="last", 
			<https://api.github.com/user/74385/repos?per_page=100&page=1&type=all&sort=created&direction=asc>; rel="first", 
			<https://api.github.com/user/74385/repos?per_page=100&page=3&type=all&sort=created&direction=asc>; rel="prev"	

			So the first thing to do is create an array separated by the commas
		*/
		header = header.split(",");
		//Then we iterate the array
		$.each(header, function( index, value ) {
			//we separate the actual link from its action (next, last, first, prev)
		  var section = value.split(';');
		  //remove the anchors from the link
		  var nextLinkUrl = section[0].replace(/<(.*)>/, '$1').trim();
		  //remove the 'rel=' string and the quotes from the action
		  var name = section[1].replace(/rel="(.*)"/, '$1').trim();
		  //we're only interested in the next link which gives us the next page
		  if(name === 'next'){
		  	action(nextLinkUrl);
		  }
		});
	}

/////////////////////////////////////////// USERS API ///////////////////////////////////////////////////////////////////

	/* Get the authenticated user: https://developer.github.com/v3/users/#get-the-authenticated-user
		GET /user
		Get a single user: https://developer.github.com/v3/users/#get-a-single-user
		GET /users/:username

		Query String:
			user : may be user name or org name, only use it if you want to retreive a user that is not the authenticated one
		
		Example call:
			getUser(
				{
					user: 'jekyll',
					action: function(data, status, xhr){
						console.log(data);
					}
				}
			)
	*/
		function getUser(par){
			url = par.user ? 'users/' + par.user : 'user'

			Api({
				method: 'GET',
				url: ApiRoot + url,
				action: function(data, status, xhr){
					par.action(data, status, xhr);
				}
			});
		}

	/* Update the authenticated user: https://developer.github.com/v3/users/#update-the-authenticated-user
		PATCH /user
		Api parameters:
			name (string)      : The new name of the user
			email (string)     : Publicly visible email address.
			blog (string)      : The new blog URL of the user.
			company (string)   : The new company of the user.
			location (string)  : The new location of the user.
			hireable (boolean) : The new hiring availability of the user.
			bio (string)       : The new short biography of the user.
		
		Example call:
			updateUser(
				{
					name     : 'new name',
					email    : 'Publicly visible email address.',
					blog     : 'The new blog URL of the user',
					company  : 'The new company of the user.',
					location : 'location',
					hireable : true,
					bio      : 'The new short biography of the user.',
					action   : function(data, status, xhr){
						console.log(data);
					}
				}
			)
	*/
		function updateUser(par){
			var url = 'user';
			//Store api parameters inside an object, if the parameter is nor specified it's not created
			var apiParams = {};
			par.name ? apiParams.name = par.name : '';
			par.email ? apiParams.email = par.email : '';
			par.blog ? apiParams.blog = par.blog : '';
			par.company ? apiParams.company = par.company : '';
			par.location ? apiParams.location = par.location : '';
			par.hireable ? apiParams.hireable = par.hireable : '';
			par.bio ? apiParams.bio = par.bio : '';

			Api({
				method: 'PATCH',
				url: ApiRoot + url,
				apiParams: apiParams,
				action: function(data, status, xhr){
					par.action(data, status, xhr);
				}
			});
		}
		
	/* More on Users API:
			Emails: https://developer.github.com/v3/users/emails
			Followers: https://developer.github.com/v3/users/followers/
			Public Keys: https://developer.github.com/v3/users/keys/
			GPG Keys: https://developer.github.com/v3/users/gpg_keys/
			Administration (Enterprise): https://developer.github.com/v3/users/administration/
	*/



/////////////////////////////////////////// REPOSITORIES API ///////////////////////////////////////////////////////////////////

	/* List repositories:

		List authenticated user repositories: https://developer.github.com/v3/repos/#list-your-repositories
				GET /user/repos
			Api parameters:
				visibility (string)   : Can be one of all, public, or private. Default: all
				affiliation (string)  : Comma-separated list of values. Can include:
					* owner               : Repositories that are owned by the authenticated user.
					* collaborator        : Repositories that the user has been added to as a collaborator.
					* organization_member : Repositories that the user has access to through being a member of an organization. This includes every repository on every team that the user is on.
					Default               : owner,collaborator,organization_member
				type (string)         : Can be one of all, owner, public, private, member. Default: all (Will cause a 422 error if used in the same request as visibility or affiliation.)
				sort (string)         : Can be one of created, updated, pushed, full_name. Default: full_name
				direction (string)    : Can be one of asc or desc. Default: when using full_name: asc, otherwise desc

		List any user repositories: https://developer.github.com/v3/repos/#list-user-repositories
				GET /users/:username/repos
			Api parameters:
				type (string): Can be one of all, owner, member. Default: owner
				sort (string): Can be one of created, updated, pushed, full_name. Default: full_name
				direction (string): Can be one of asc or desc. Default: when using full_name: asc, otherwise desc

		List organization repositories: https://developer.github.com/v3/repos/#list-organization-repositories
				GET /orgs/:org/repos
			Api parameters:
				type (string): Can be one of all, public, private, forks, sources, member. Default: all
		
		Query String:
			owner: username / org. Do not use if you want to display authenticated user repos
			per_page: number of items to show per page
			page: page to show
			link: if the link is constructed by the api pagination

		Example call:
			listRepos({
				visibility  : 'all',
				affiliation : 'owner, collaborator, organization_member',
				type        : 'all',
				sort        : 'created',
				direction   : 'asc',
				owner       : 'rstacruz',
				isOrg       : true,
				per_page    : '100',
				page        : '1', 
				action      : function(data, status, xhr){
					console.log(data);
					console.log(xhr);
				}
			})
	*/
		function listRepos(par){
			//if there is the link parameter then the url have been created by the api link header, else I have to construct it:
			if(!par.link){
				var url = par.owner ? par.isOrg ? 'orgs/' + par.owner + '/repos' : 'users/' + par.owner + '/repos' : 'user/repos';
				url    += par.visibility ? ((/\?/).test(url) ? '&' : '?') + 'visibility=' + par.visibility : '';
				url    += par.affiliation ? ((/\?/).test(url) ? '&' : '?') + 'affiliation=' + par.affiliation : '';
				if(!par.visibility && !par.affiliation){
					url += par.type ? ((/\?/).test(url) ? '&' : '?') + 'type=' + par.type : ((/\?/).test(url) ? '&' : '?') + 'type=all';
				}
				url += par.sort ? ((/\?/).test(url) ? '&' : '?') + 'sort=' + par.sort : '';
				url += par.direction ? ((/\?/).test(url) ? '&' : '?') + 'direction=' + par.direction : '';
				url += par.per_page ? ((/\?/).test(url) ? '&' : '?') + 'per_page=' + par.per_page : ((/\?/).test(url) ? '&' : '?') + 'per_page=100';
				url += par.page ? ((/\?/).test(url) ? '&' : '?') + 'page=' + par.page : '';
			}

			Api({
				method: 'GET',
				url: par.link ? par.link : ApiRoot + url,
				action: function(data, status, xhr){
					par.action(data, status, xhr);
					if(xhr.getResponseHeader('Link')){
						parseLinkHeader (xhr.getResponseHeader('Link'), function(nextLinkUrl){
							listRepos({
								link: nextLinkUrl,
								action: par.action
							});
						});
					}
				}				
			});
		}
	
	/* Create a new repository for the authenticated user: https://developer.github.com/v3/repos/#create
		POST /user/repos
		POST /orgs/:org/repos
	
		When using OAuth, authorizations must include:
			public_repo scope or repo scope to create a public repository
			repo scope to create a private repository

		Api parameters:
			name (string)               : Required. The name of the repository
			description (string)        : A short description of the repository
			homepage (string)           : A URL with more information about the repository
			private (boolean)           : Either true to create a private repository, or false to create a public one. Creating private repositories requires a paid GitHub account. Default: false
			has_issues (boolean)        : Either true to enable issues for this repository, false to disable them. Default: true
			has_wiki (boolean)          : Either true to enable the wiki for this repository, false to disable it. Default: true
			has_downloads (boolean)     : Either true to enable downloads for this repository, false to disable them. Default: true
			team_id (integer)           : The id of the team that will be granted access to this repository. This is only valid when creating a repository in an organization.
			auto_init (boolean)         : Pass true to create an initial commit with empty README. Default: false
			gitignore_template (string) : Desired language or platform .gitignore template to apply. Use the name of the template without the extension. For example, "Haskell".
			license_template (string)   : Desired LICENSE template to apply. Use the name of the template without the extension. For example, "mit" or "mozilla".
		
		Query String:
			org (string): name of the organization.

		Example call:
			createRepo({
				org           : 'meethyde',
				name          : 'My new repo',
				description   : 'A repo created from the API',
				homepage      : 'google.com',
				private       : false,
				has_issues    : false,
				has_wiki      : false,
				has_downloads : false,
				auto_init     : true,
				action        : function(data, status, xhr){
					console.log(data);
				}
			})
	*/
		function createRepo(par){
			var url = par.org ? 'orgs/' + par.org + '/repos' : 'user/repos';

			//Store api parameters inside an object, if the parameter is nor specified it's not created
			var apiParams = {};
			par.name ? apiParams.name = par.name : '';
			par.description ? apiParams.description = par.description : '';
			par.homepage ? apiParams.homepage = par.homepage : '';
			par.private ? apiParams.private = par.private : '';
			par.has_issues ? apiParams.has_issues = par.has_issues : '';
			par.has_wiki ? apiParams.has_wiki = par.has_wiki : '';
			par.has_downloads ? apiParams.has_downloads = par.has_downloads : '';
			par.team_id ? apiParams.team_id = par.team_id : '';
			par.auto_init ? apiParams.auto_init = par.auto_init : '';
			par.gitignore_template ? apiParams.gitignore_template = par.gitignore_template : '';
			par.license_template ? apiParams.license_template = par.license_template : '';

			Api({
				method: 'POST',
				url: ApiRoot + url,
				apiParams: apiParams,
				action: function(data, status, xhr){
					par.action(data, status, xhr);
				}
			});
		}
		

	/* Get a repository: https://developer.github.com/v3/repos/#get
		GET /repos/:owner/:repo
		The parent and source objects are present when the repository is a fork. parent is the repository this repository was forked from, source is the ultimate source for the network.
			Three additional fields, allow_squash_merge, allow_merge_commit and allow_rebase_merge, are currently available for developers to preview. During the preview period, the APIs may change without advance notice. Please see "https://developer.github.com/changes/2016-09-26-pull-request-merge-api-update/" for full details.

			To use these fields you must provide a custom media type in the Accept header:
				application/vnd.github.polaris-preview

		Query Strings:
			owner  : repository owner
			repo   : repository name

		Example call:
			getRepo({
				owner: 'ar2ro',
				repo: 'My-new-repo',
				allow_squash_merge: true;
				action: function(data, status, xhr){
					console.log(data);
				}
			})
	*/
		function getRepo(par){
			var url = 'repos/' + par.owner + '/' + par.repo;

			Api({
				method: 'GET',
				url: ApiRoot + url,
				accept: 'application/vnd.github.polaris-preview',
				action: function(data, status, xhr){
					par.action(data, status, xhr);
				}				
			});			
		}
	
	/* Edit a repository: https://developer.github.com/v3/repos/#edit
		PATCH /repos/:owner/:repo
		Api parameters: 
			name (string): Required. The name of the repository
			description (string): A short description of the repository
			homepage (string): A URL with more information about the repository
			private (boolean): Either true to make the repository private, or false to make it public. Creating private repositories requires a paid GitHub account. Default: false
			has_issues (boolean): Either true to enable issues for this repository, false to disable them. Default: true
			has_wiki (boolean): Either true to enable the wiki for this repository, false to disable it. Default: true
			has_downloads (boolean): Either true to enable downloads for this repository, false to disable them. Default: true
			default_branch (string): Updates the default branch for this repository.
		
		Query string:
			owner: repository owner, user or org
			repo: current repository name
		
		Three additional fields, allow_squash_merge, allow_merge_commit and allow_rebase_merge, are currently available for developers to preview. During the preview period, the APIs may change without advance notice. Please see "https://developer.github.com/changes/2016-09-26-pull-request-merge-api-update/" for full details.

		To use these fields you must provide a custom media type in the Accept header:
			application/vnd.github.polaris-preview

		Additional fields api parameters:
			allow_squash_merge (boolean): Either true to allow squash-merging pull requests, or false to prevent squash-merging.
			allow_merge_commit (boolean): Either true to allow merging pull requests with a merge commit, or false to prevent merging pull requests with merge commits.
			allow_rebase_merge (boolean): Either true to allow rebase-merging pull requests, or false to prevent rebase-merging.

		Example call:
			editRepo({
				owner: 'ar2ro',
				repo: 'New-repo',
				name: 'Nuevo Proyecto',
				description: 'Nueva descripcion',
				homepage: 'ar2.ro',
				action: function(data, status, xhr){
					console.log(data)
				}
			})
	*/
		function editRepo(par){
			var url = 'repos/' + par.owner + '/' + par.repo;

			var apiParams = {};
			par.name ? apiParams.name = par.name : apiParams.name = par.repo;
			par.description ? apiParams.description = par.description : '';
			par.homepage ? apiParams.homepage = par.homepage : '';
			par.private ? apiParams.private = par.private : '';
			par.has_issues ? apiParams.has_issues = par.has_issues : '';
			par.has_wiki ? apiParams.has_wiki = par.has_wiki : '';
			par.has_downloads ? apiParams.has_downloads = par.has_downloads : '';
			par.default_branch ? apiParams.default_branch = par.default_branch : '';

			Api({
				method: 'PATCH',
				url: ApiRoot + url,
				apiParams: apiParams,
				accept: 'application/vnd.github.polaris-preview',
				action: function(data, status, xhr){
					par.action(data, status, xhr);
				}
			})
		}
	
	/* List contributors: https://developer.github.com/v3/repos/#list-contributors
		GET /repos/:owner/:repo/contributors
			Contributors data is cached for performance reasons. This endpoint may return information that is a few hours old.
		
			Git contributors are identified by author email address. This API attempts to group contribution counts by GitHub user, across all of their associated email addresses. For performance reasons, only the first 500 author email addresses in the repository will be linked to GitHub users. The rest will appear as anonymous contributors without associated GitHub user information.
		
		List languages: https://developer.github.com/v3/repos/#list-languages
		GET /repos/:owner/:repo/languages

		List teams: https://developer.github.com/v3/repos/#list-teams
		GET /repos/:owner/:repo/teams

		List tags: https://developer.github.com/v3/repos/#list-tags
		GET /repos/:owner/:repo/tags

		Query string:
			extra (string)    : contributors, languages, teams, tags. It will depend on what you want to list.
			owner (string)     : repository owner
			repo (string)     : repository name
			per_page (string) : number of items to display per page
			page (string)     : page to show
			anon (string)     : Set to 1 or true to include anonymous contributors in results. Only when listing contributors

		Example call:
			listExtras({
				extra: 'contributors',
				owner: 'jekyll',
				repo: 'jekyll',
				anon: '1',
				action: function(data, status, xhr){
					console.log(data)
				}
			})

		Note: Listing teams not working
	*/
		function listExtras(par){
			var url = 'repos/' + par.owner + '/' + par.repo + '/' + par.extra;
			if(par.extra !== 'languages' && !par.link){
				url += par.per_page ? ((/\?/).test(url) ? '&' : '?') + 'per_page=' + par.per_page : ((/\?/).test(url) ? '&' : '?') + '';
				url += par.page ? ((/\?/).test(url) ? '&' : '?') + 'page=' + par.page : '';
				url += par.anon ? ((/\?/).test(url) ? '&' : '?') + 'anon=' + par.anon : '';
			}
			
			Api({
				method: 'GET',
				url: par.link ? par.link : ApiRoot + url,
				action: function(data, status, xhr){
					par.action(data, status, xhr);
					if(xhr.getResponseHeader('Link')){
						parseLinkHeader (xhr.getResponseHeader('Link'), function(nextLinkUrl){
							listExtras({
								link: nextLinkUrl,
								action: par.action
							});
						});
					}
				}				
			});
		}
	
	/* Delete a Repository: https://developer.github.com/v3/repos/#delete-a-repository
		DELETE /repos/:owner/:repo
		
		Query String:
			owner : may be user name or org name
			repo  : name of repository to delete

		Example call:
			deleteRepo({
				owner: 'ar2ro',
				repo: 'Nuevo-Proyecto',
				action: function(data, status, xhr){
					console.log(xhr);
				}
			})
	*/
		function deleteRepo(par){
			var url = 'repos/' + par.owner + '/' + par.repo;

			Api({
				method: 'DELETE',
				url: ApiRoot + url,
				action: function(data, status, xhr){
					//When "statusText = No Content" the repo was deleted
					par.action(data, status, xhr.statusText);
				}
			})
		}
		
	//BRANCHES
		/* List Branches: https://developer.github.com/v3/repos/branches/#list-branches
			GET /repos/:owner/:repo/branches

			API parameters:
				protected (boolean): Set to true to only return protected branches
					The Protected Branch API is currently available for developers to preview. During the preview period, the API may change without advance notice. Please see the blog post for full details.
					To access the API during the preview period, you must provide a custom media type in the Accept header:
						application/vnd.github.loki-preview+json
					The protected key will only be present in branch payloads if this header is passed.

			Query sting:
				per_page
				page

			Example call:
				listBranches({
					owner: 'jekyll',
					repo: 'jekyll',
					protected: true,
					action: function(data, status, xhr){
						console.log(data);
					}
				})
		*/
			function listBranches(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/branches';

				if(!par.link){
					url += par.per_page ? ((/\?/).test(url) ? '&' : '?') + 'per_page=' + par.per_page : ((/\?/).test(url) ? '&' : '?') + 'per_page=100';
					url += par.page ? ((/\?/).test(url) ? '&' : '?') + 'page=' + par.page : '';
					url += par.protected ? ((/\?/).test(url) ? '&' : '?') + 'protected=' + par.protected : '';
				}

				Api({
					method: 'GET',
					url: par.link ? par.link : ApiRoot + url,
					accept: 'application/vnd.github.loki-preview+json',
					action: function(data, status, xhr){
						par.action(data, status, xhr);
						if(xhr.getResponseHeader('Link')){
							parseLinkHeader (xhr.getResponseHeader('Link'), function(nextLinkUrl){
								listExtras({
									link: nextLinkUrl,
									action: par.action
								});
							});
						}
					}				
				});
			}
			
		/* Get Branch: https://developer.github.com/v3/repos/branches/#get-branch
			GET /repos/:owner/:repo/branches/:branch

			Query string:
				owner
				repo
				branch

			Example call:
				getBranch({
					owner: 'jekyll',
					repo: 'jekyll',
					branch: '0.12.1-release',
					action: function(data, status, xhr){
						console.log(data);
					}
				})
		*/
			function getBranch(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/branches/' + par.branch;
				
				Api({
					method: 'GET',
					url: ApiRoot + url,
					accept: 'application/vnd.github.loki-preview+json',
					action: function(data, status, xhr){
						par.action(data, status, xhr);
					}				
				});
			}
			
		/*
			More on protecting branches: https://developer.github.com/v3/repos/branches
		*/
	
	//COLABORATORS
		/* List collaborators: https://developer.github.com/v3/repos/collaborators/#list-collaborators
			GET /repos/:owner/:repo/collaborators
			For organization-owned repositories, the list of collaborators includes outside collaborators, organization members with access through team memberships, organization members with access through default organization permissions, and organization owners.

			Query string:
				owner
				repo
				per_page
				page

			Example call:
				listCollaborators({
					owner: 'jekyll',
					repo: 'jekyll',
					action: function(data, status, xhr){
						console.log(data);
					}
				})
		*/
			function listCollaborators(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/collaborators';

				if(!par.link){
					url += par.per_page ? ((/\?/).test(url) ? '&' : '?') + 'per_page=' + par.per_page : ((/\?/).test(url) ? '&' : '?') + 'per_page=100';
					url += par.page ? ((/\?/).test(url) ? '&' : '?') + 'page=' + par.page : '';
				}

				Api({
					method: 'GET',
					url: par.link ? par.link : ApiRoot + url,
					action: function(data, status, xhr){
						par.action(data, status, xhr);
						if(xhr.getResponseHeader('Link')){
							parseLinkHeader (xhr.getResponseHeader('Link'), function(nextLinkUrl){
								listExtras({
									link: nextLinkUrl,
									action: par.action
								});
							});
						}
					}				
				});
			}
			
		/* Check if a user is a collaborator: https://developer.github.com/v3/repos/collaborators/#check-if-a-user-is-a-collaborator
			GET /repos/:owner/:repo/collaborators/:username
			Response if user is a collaborator: Status: 204 No Content
			Response if user is not a collaborator: Status: 404 Not Found

			isCollaborator({
				owner: 'meethyde',
				repo: 'meethyde',
				username: 'ar2ro',
				action: function(data, status, xhr){
					if(xhr && xhr.status === 204){
						console.log('user is collaborator');
					}
				}
			})
		*/
			function isCollaborator(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/collaborators/' + par.username;

				Api({
					method: 'GET',
					url: ApiRoot + url,
					action: function(data, status, xhr){
						//if xhr.status is "204" the user is a collaborator
						//if data.status is "404" the user is NOT a collaborator
						par.action(data, status, xhr);
					}				
				});
			}
 		
 		/* Add user as a collaborator: https://developer.github.com/v3/repos/collaborators/#add-user-as-a-collaborator
			PUT /repos/:owner/:repo/collaborators/:username
			Api parameters
				permission (string): The permission to grant the collaborator. Only valid on organization-owned repositories. Can be one of:
					* pull - can pull, but not push to or administer this repository.
					* push - can pull and push, but not administer this repository.
					* admin - can pull, push and administer this repository.
					Default: push

			Remove user as a collaborator: https://developer.github.com/v3/repos/collaborators/#remove-user-as-a-collaborator
			DELETE /repos/:owner/:repo/collaborators/:username

			Example call:
				addremoveCollaborator({
					method: 'PUT',
					owner: 'meethyde',
					repo: 'meethyde',
					username: 'imlestat',
					permission: 'admin',
					action: function(data, status, xhr){
						if(xhr && xhr.status === 204){
							console.log('user added as collaborator')
						}
					}
				})
				addremoveCollaborator({
					method: 'DELETE',
					owner: 'meethyde',
					repo: 'meethyde',
					username: 'imlestat',
					permission: 'admin',
					action: function(data, status, xhr){
						if(xhr && xhr.status === 204){
							console.log('user removed as collaborator')
						}
					}
				})
		*/
			function addremoveCollaborator(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/collaborators/' + par.username;
				Api({
					method: par.method,
					url: ApiRoot + url,
					action: function(data, status, xhr){
						par.action(data, status, xhr);
					}				
				});
			}

	//COMMITS
		/* List commits on a repository: https://developer.github.com/v3/repos/commits/#list-commits-on-a-repository
			GET /repos/:owner/:repo/commits
			Api parameters: 
				sha (string): SHA or branch to start listing commits from. Default: the repository’s default branch (usually master).
				path (string): Only commits containing this file path will be returned.
				author (string): GitHub login or email address by which to filter by commit author.
				since (string): Only commits after this date will be returned. This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
				until (string): Only commits before this date will be returned. This is a timestamp in ISO 8601 format: YYYY-MM-DDTHH:MM:SSZ.
			
			Example call:
				listCommits({
					owner: 'jekyll',
					repo: 'jekyll',
					since: '2016-10-01',
					action: function(data, status, xhr){
						console.log(data);
					}
				})
 		*/
 			function listCommits(par){
 				var url = 'repos/' + par.owner + '/' + par.repo + '/commits';

 				if(!par.link){
					url += par.sha ? ((/\?/).test(url) ? '&' : '?') + 'sha=' + par.sha : '';
					url += par.path ? ((/\?/).test(url) ? '&' : '?') + 'path=' + par.path : '';
					url += par.author ? ((/\?/).test(url) ? '&' : '?') + 'author=' + par.author : '';
					url += par.since ? ((/\?/).test(url) ? '&' : '?') + 'since=' + par.since : '';
					url += par.until ? ((/\?/).test(url) ? '&' : '?') + 'until=' + par.until : '';
					url += par.per_page ? ((/\?/).test(url) ? '&' : '?') + 'per_page=' + par.limit : ((/\?/).test(url) ? '&' : '?') + 'per_page=100';
					url += par.page ? ((/\?/).test(url) ? '&' : '?') + 'page=' + par.page : '';
				}

				Api({
					method: 'GET',
					url: par.link ? par.link : ApiRoot + url,
					action: function(data, status, xhr){
						par.action(data, status, xhr);
						if(xhr.getResponseHeader('Link')){
							parseLinkHeader (xhr.getResponseHeader('Link'), function(nextLinkUrl){
								listExtras({
									link: nextLinkUrl,
									action: par.action
								});
							});
						}
					}				
				});
 			}
			
		/* Get a single commit: https://developer.github.com/v3/repos/commits/#get-a-single-commit
			GET /repos/:owner/:repo/commits/:sha

			Example call
				getCommit({
					owner: 'jekyll',
					repo: 'jekyll',
					sha: '575c23e547991116e7059d4582fa7fd8071d7dd3',
					action: function(data, status, xhr){
						console.log(data);
					}
				})
		*/
			function getCommit(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/commits/' + par.sha;
				console.log(url)
				Api({
					method: 'GET',
					url: ApiRoot + url,
					action: function(data, status, xhr){
						par.action(data, status, xhr);
					}				
				});
			}
		
		/*
			More on commits: https://developer.github.com/v3/repos/commits/
		*/
	
	//CONTENTS
		/* Get contents: https://developer.github.com/v3/repos/contents/#get-contents
			GET /repos/:owner/:repo/contents/:path
			This method returns the contents of a file or directory in a repository. Files and symlinks support a custom media type for retrieving the raw content or rendered HTML (when supported). All content types support a custom media type to ensure the content is returned in a consistent object format.

			Note:
				To get a repository's contents recursively, you can recursively get the tree.
				This API has an upper limit of 1,000 files for a directory. If you need to retrieve more files, use the Git Trees API.
				This API supports files up to 1 megabyte in size.

			Api parameters:
				path (string): The content path.
				ref (string): The name of the commit/branch/tag. Default: the repository’s default branch (usually master)

			Example call:
				getContents({
					owner: 'meethyde',
					repo: 'meethyde',
					path: 'js/config.js',
					action: function(data, status, xhr){
						console.log(data);
					}
				})
		*/
			function getContents(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/contents/' + par.path;
				url += par.ref ? ((/\?/).test(url) ? '&' : '?') + 'ref=' + par.ref : '';
				Api({
					method: 'GET',
					url: par.link ? par.link : ApiRoot + url,
					action: function(data, status, xhr){
						par.action(data, status, xhr);
						if(xhr.getResponseHeader('Link')){
							parseLinkHeader (xhr.getResponseHeader('Link'), function(nextLinkUrl){
								listExtras({
									link: nextLinkUrl,
									action: par.action
								});
							});
						}
					}				
				});
			}

		/* Create a file: https://developer.github.com/v3/repos/contents/#create-a-file
			PUT /repos/:owner/:repo/contents/:path

			Api parameters:
				path (string): Required. The content path.
				message (string): Required. The commit message.
				content (string): Required. The new file content, Base64 encoded.
				branch (string): The branch name. Default: the repository’s default branch (usually master)

				You can provide an additional committer parameter, which is an object containing information about the committer. Or, you can provide an author parameter, which is an object containing information about the author.

				The author section is optional and is filled in with the committer information if omitted. If the committer information is omitted, the authenticated user's information is used.

				You must provide values for both name and email, whether you choose to use author or committer. Otherwise, you'll receive a 422 status code.

				Both the author and committer parameters have the same keys:

			Example call:
				createFile({
					owner: 'ar2ro',
					repo: 'My-new-repo',
					path: 'newfile.html',
					content: btoa('<h1>this file was created from the api </h1>'),
					message: 'commited from the website',
					branch: 'gh-pages',
					action: function(data, status, xhr){
						console.log(data);
					}
				})
		*/
			function createFile(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/contents/' + par.path;

				var apiParams = {
					message: par.message,
					content: par.content,
					branch: par.branch
				}

				if(par.committer){
					apiParams.committer = {
						name: par.committer.name,
						email: par.committer.email
					}
				}

				if(par.author){
					apiParams.author = {
						name: par.author.name,
						email: par.author.email
					}
				}
				
				Api({
					method: 'PUT',
					url: ApiRoot + url,
					apiParams: apiParams,
					action: function(data, status, xhr){
						par.action(data, status, xhr);
					}				
				});
			}

		/* Update a file: https://developer.github.com/v3/repos/contents/#update-a-file
			PUT /repos/:owner/:repo/contents/:path

			Api parameters: 
				path (string): Required. The content path.
				message (string): Required. The commit message.
				content (string): Required. The new file content, Base64 encoded.
				sha (string): Required. The blob SHA of the file being replaced.
				branch (string): The branch name. Default: the repository’s default branch (usually master)

				Optional parameters just as when create

			Example call
				updateFile({
					owner: 'ar2ro',
					repo: 'My-new-repo',
					path: 'newfile.html',
					content: btoa('<h1>this file was updated from the api </h1>'),
					message: 'commited from the website',
					branch: 'gh-pages',
					action: function(data, status, xhr){
						console.log(data);
					}
				})
		*/
			function updateFile(par){

				getContents({
					owner: par.owner,
					repo: par.repo,
					path: par.path,
					action: function(data, status, xhr){
						var url = 'repos/' + par.owner + '/' + par.repo + '/contents/' + par.path;

						var apiParams = {
							message: par.message,
							content: par.content,
							branch: par.branch,
							sha: data.sha
						}

						if(par.committer){
							apiParams.committer = {
								name: par.committer.name,
								email: par.committer.email
							}
						}

						if(par.author){
							apiParams.author = {
								name: par.author.name,
								email: par.author.email
							}
						}
						Api({
							method: 'PUT',
							url: ApiRoot + url,
							apiParams: apiParams,
							action: function(data, status, xhr){
								par.action(data, status, xhr);
							}				
						}); 
					}
				})			
			}

		/* Delete a file: https://developer.github.com/v3/repos/contents/#delete-a-file
			DELETE /repos/:owner/:repo/contents/:path

			Api parameters
				path (string): Required. The content path.
				message (string): Required. The commit message.
				sha (string): Required. The blob SHA of the file being replaced.
				branch (string): The branch name. Default: the repository’s default branch (usually master)

			Optional parameters just as when create

			Example call
				deleteFile({
					owner: 'ar2ro',
					repo: 'My-new-repo',
					path: 'newfile.html',
					message: 'commited from the website',
					action: function(data, status, xhr){
						console.log(data);
					}
				})
		*/
			function deleteFile(par){
					getContents({
						owner: par.owner,
						repo: par.repo,
						path: par.path,
						action: function(data, status, xhr){
							var url = 'repos/' + par.owner + '/' + par.repo + '/contents/' + par.path;

							var apiParams = {
								message: par.message,
								branch: par.branch,
								sha: data.sha
							}

							if(par.committer){
								apiParams.committer = {
									name: par.committer.name,
									email: par.committer.email
								}
							}

							if(par.author){
								apiParams.author = {
									name: par.author.name,
									email: par.author.email
								}
							}
							
							Api({
								method: 'DELETE',
								url: ApiRoot + url,
								apiParams: apiParams,
								action: function(data, status, xhr){
									par.action(data, status, xhr);
								}				
							});
						}
					})					
					

					
					
				}

		/* Download file: https://developer.github.com/v3/repos/contents/#get-archive-link
			GET /repos/:owner/:repo/:archive_format/:ref

			Api parameters
				archive_format (string): Can be either tarball or zipball. Default: tarball
				ref (string): A valid Git reference. Default: the repository’s default branch (usually master)

			Example call:
				download({
					owner: 'ar2ro',
					repo: 'My-new-repo',
					archive_format: 'zipball',
					ref: 'master',
					action: function(data, status, xhr){
						console.log(data)
					}
				})
		*/
			function download(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/' + par.archive_format + '/' + par.ref;

				window.open(ApiRoot + url)
			}

		/* Create a fork: https://developer.github.com/v3/repos/forks/#create-a-fork
			POST /repos/:owner/:repo/forks

			Api parameters:
				organization (string): Optional parameter to specify the organization name if forking into an organization.

			Example call:
				fork({
					owner: 'jekyll',
					repo: 'jekyll',
					action: function(data, status, xhr){
						console.log(data)
					}
				})
		*/
			function fork(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/forks';

				var apiData = {
					method: 'POST',
					url: ApiRoot + url,
					action: function(data, status, xhr){
						par.action(data, status, xhr);
					}		
				}

				if(par.organization){
					apiData.apiParams = {
						organization: par.organization
					}
				}

				Api(apiData);
			}

		/* Get information about a Pages site: https://developer.github.com/v3/repos/pages/#get-information-about-a-pages-site
			GET /repos/:owner/:repo/pages

			Example call:
				pagesInfo({
					owner: 'meethyde',
					repo: 'meethyde.github.io',
					action: function(data, status, xhr){
						console.log(data)
					}
				})
		*/
			function pagesInfo(par){
				var url = 'repos/' + par.owner + '/' + par.repo + '/pages';

				Api({
					method: 'GET',
					url: ApiRoot + url,
					accept: 'application/vnd.github.mister-fantastic-preview+json',
					action: function(data, status, xhr){
						par.action(data, status, xhr);
					}				
				});
			}

	//COMMENTS
		/* List commit comments for a repository: https://developer.github.com/v3/repos/comments/#list-commit-comments-for-a-repository
			GET /repos/:owner/:repo/comments
			Comments are ordered by ascending ID.
		*/
			function listComments(owner, repo, action, per_page, page, link){
				var url = link ? link : ApiRoot + 'repos/' + owner + '/' + repo + '/comments';
				if(!link){
					url += per_page ? ((/\?/).test(url) ? '&' : '?') + 'per_page=' + limit : ((/\?/).test(url) ? '&' : '?') + 'per_page=100';
					url += page ? ((/\?/).test(url) ? '&' : '?') + 'page=' + page : '';
				}
				Api('GET', url, function(data, status, xhr){
					action(data, status, xhr);

					//If there is a link header in the response then the results are paginated so we'll re run the function for all the pages
					if(xhr.getResponseHeader('Link')){
						parseLinkHeader (xhr.getResponseHeader('Link'), function(linkHeader){
							console.log('linkHeader: ' + linkHeader)
							listComments('', '', action, '', '', linkHeader);
						});
					}
				});
			}	

		/* List comments for a single commit: https://developer.github.com/v3/repos/comments/#list-comments-for-a-single-commit
			GET /repos/:owner/:repo/commits/:ref/comments

			Checkout the commits api first
		*/
		
/////////////////////////////////////////// GIT DATA API ///////////////////////////////////////////////////////////////////

/*
	Get a Blob: https://developer.github.com/v3/git/blobs/#get-a-blob
	GET /repos/:owner/:repo/git/blobs/:sha

	Note: This API supports blobs up to 100 megabytes in size.
*/
	function getBlob(owner, repo, sha, action){
		var url = ApiRoot;
		url += 'repos/' + owner + '/' + repo + '/git/blobs/' + sha
		Api('GET', url, function(data, status, xhr){
			action(data, status, xhr);
		});
	}

/*
	Create a Blob: https://developer.github.com/v3/git/blobs/#create-a-blob

	POST /repos/:owner/:repo/git/blobs
	Api parameters:
		content (string): Required. The new blob's content.
		encoding (string): The encoding used for content. Currently, "utf-8" and "base64" are supported. Default: "utf-8".
	Custom parameters:
		owner (string): repository owner
		repo (string): repository name
		action: function that uses the data received from the api call

	Note: this blob is created but I can't see it when I retreive a tree
*/

	function createBlob(content, encoding, owner, repo, action){
		var url = ApiRoot;
		url += 'repos/' + owner + '/' + repo + '/git/blobs';

		var apiData = {
			"content": content,
			"encoding": encoding
		}
		
		Api('POST', url, function(data, status, xhr){
			action(data, status, xhr);
		}, apiData);
	}