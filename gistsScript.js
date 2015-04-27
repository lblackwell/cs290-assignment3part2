// Lucia Blackwell
// Last modified 4/26/15
// OSU CS 290
// Assignment 3 part 2

var fetchedGists = [];
var favoritesArrary = [];

function Gist(desc, url)
{
	this.desc = desc;
	this.url = url;
}

function fetchData()
{
	var numPagesSelect = document.getElementById('numPages');
	var numGists = (numPagesSelect.options[numPagesSelect.selectedIndex].value) * 30;

	var getPython = false;
	if(document.getElementById('pythonBox').checked)
	{
		getPython = true;
	}

	var getJSON = false;
	if(document.getElementById('jsonBox').checked)
	{
		getJSON = true;
	}

	var getJavascript = false;
	if(document.getElementById('javascriptBox').checked)
	{
		getJavascript = true;
	}

	var getSQL = false;
	if(document.getElementById('sqlBox').checked)
	{
		getSQL = true;
	}

	var batchOfGists = [];

	while(numGists > 0)
	{
		if(numGists > 150)
		{
			throw 'Cannot fetch that many gists.';
		}

		var request;
		if(window.XMLHttpRequest)
		{
			request = new XMLHttpRequest();
		}
		else
		{
			request = new ActiveXObject("Microsoft.XMLHTTP");
		}

		var url = 'https://api.github.com/gists/public';

		var parameters;

		if(numGists <= 100)
		{
			parameters =
			{
				// Parameters here
				per_page: numGists
			};
			numGists = 0;
		}
		else
		{
			parameters =
			{
				// Parameters here
				per_page: 100
			};
			numGists -= 100;
		}
		
		url += '?' + urlStringify(parameters);

		request.onreadystatechange = function()
		{
			if(request.readyState == 4 && request.status == 200)
			{
				var response = request.responseText;
				batchOfGists = (JSON.parse(response));

				// if(anyLanguage === true)
				if(getPython === false && getJSON === false && getJavascript === false && getSQL === false)
				{
					fetchedGists = batchOfGists;
				}

				else
				{
					for(var n = 0; n < batchOfGists.length; n++)
					{
						for(var property in batchOfGists[n].files)
						{
							if(batchOfGists[n].files.hasOwnProperty(property))
							{
								if(batchOfGists[n].files[property].language)
								{
									var gistLang = batchOfGists[n].files[property].language;

									// TEST PRINT
									console.log(batchOfGists[n].description + ": " + gistLang);

									if((getPython === true && gistLang === 'Python') || (getJSON === true && gistLang === 'JSON')
										|| (getJavascript === true && gistLang === 'JavaScript') || (getSQL === true && gistLang === 'SQL'))
									{
										fetchedGists.push(batchOfGists[n]);
									}
								}
							}
						}
					}
				}

				// TEST PRINT
				console.log("Fetched gists: " + fetchedGists);

				for(var m = 0; m < favoritesArrary.length; m++)
				{
					for(var o = 0; o < fetchedGists.length; o)
					{
						if(fetchedGists[o].url === favoritesArrary[m].url)
						{
							fetchedGists.splice(o, 1);
						}
						o++;
					}
				}

				displayGists();
			}
		};

		request.open('GET', url, true);
		request.send();


	}
}

function urlStringify(origString)
{
	var newString = [];
	for(var property in origString)
	{
		var thisPart = encodeURIComponent(property) + '=' + encodeURIComponent(origString[property]);
		newString.push(thisPart);
	}
	return newString.join('&');
}

function displayGists()
{
	var gistsDiv = document.getElementById('gists');

	if(fetchedGists.length === 0 && !document.getElementById('noGists'))
	{
		var noGists = document.createElement('span');
		noGists.setAttribute('id', 'noGists');
		noGists.textContent = "No gists to display.";
		gistsDiv.appendChild(noGists);
	}

	else if(document.getElementById('noGists'))
	{
		gistsDiv.removeChild(document.getElementById('noGists'));
	}

	var list = document.createElement('ul');
	list.setAttribute('id', 'gistList');

	for(var j = 0; j < fetchedGists.length; j++)
	{
		// Create list item parts
		var newLI = document.createElement('li');
		var newDL = document.createElement('dl');
		var descDT = document.createElement('dt');
		var urlDD = document.createElement('dd');

		// Assign unique ID to each part
		newLI.setAttribute('id', j);
		newDL.setAttribute('id', (fetchedGists[j].id + '-dl'));
		descDT.setAttribute('id', (fetchedGists[j].id + '-descDT'));
		urlDD.setAttribute('id', (fetchedGists[j].id + '-urlDD'));

		// Assign class to each part
		newLI.setAttribute('class', 'gistLI');
		newDL.setAttribute('class', 'gistDL');
		descDT.setAttribute('class', 'descDT');
		urlDD.setAttribute('class', 'urlDD');

		// Create and set up favorites button
		var faveButton = document.createElement('button');
		faveButton.setAttribute('id', (fetchedGists[j].id + '-faveBut'));
		faveButton.setAttribute('class', 'faveButton');
		faveButton.textContent = "+";
		faveButton.onclick = function(addToFavorites)
		{
			// Get relevant information
			var targetLI = addToFavorites.target.parentElement.parentElement.parentElement;
			var targetDesc = fetchedGists[targetLI.id].description;
			var targetURL = fetchedGists[targetLI.id].url;

			var fave = new Gist(targetDesc, targetURL);
			favoritesArrary.push(fave);

			localStorage.setItem('savedFavorites', JSON.stringify(favoritesArrary));

			// Send to list building function
			makeFavesEntry(targetDesc, targetURL);

			// Remove from gist list
			targetLI.parentElement.removeChild(targetLI);
		};

		// Create link element
		var urlLink = document.createElement('a');
		urlLink.href = fetchedGists[j].url;
		var urlText = document.createTextNode(fetchedGists[j].url);
		urlLink.appendChild(urlText);

		// Set up description element
		var descText;
		if(!fetchedGists[j].description)
		{
			descText = document.createTextNode('No description available');
		}
		else
		{
			descText = document.createTextNode(fetchedGists[j].description);
		}
		descDT.appendChild(faveButton);
		descDT.appendChild(descText);
		
		// Add contents
		urlDD.appendChild(urlLink);
		newDL.appendChild(descDT);
		newDL.appendChild(urlDD);
		newLI.appendChild(newDL);

		// Append to main list
		list.appendChild(newLI);
	}

	gistsDiv.appendChild(list);
}

function displayFaves()
{
	var favesDiv = document.getElementById('favored-gists');

	var list = document.createElement('ul');
	list.setAttribute('id', 'favesList');

	for(var k = 0; k < favoritesArrary.length; k++)
	{
		// Create list item parts
		var newLI = document.createElement('li');
		var newDL = document.createElement('dl');
		var descDT = document.createElement('dt');
		var urlDD = document.createElement('dd');

		// Assign unique ID to each part
		newLI.setAttribute('id', favoritesArrary[k].url);
		newDL.setAttribute('id', (favoritesArrary[k].id + '-dl'));
		descDT.setAttribute('id', (favoritesArrary[k].id + '-descDT'));
		urlDD.setAttribute('id', (favoritesArrary[k].id + '-urlDD'));

		// Assign class to each part
		newLI.setAttribute('class', 'gistLI');
		newDL.setAttribute('class', 'gistDL');
		descDT.setAttribute('class', 'descDT');
		urlDD.setAttribute('class', 'urlDD');

		// Create and set up remove from favorites button
		var rmFaveButton = document.createElement('button');
		rmFaveButton.setAttribute('id', (favoritesArrary[k].url + '-rmFaveBut'));
		rmFaveButton.setAttribute('class', 'rmFaveButton');
		rmFaveButton.textContent = "-";
		rmFaveButton.onclick = function(rmFromFaves)
		{
			// Get relevant information
			var targetLI = rmFromFaves.target.parentElement.parentElement.parentElement;

			// Remove from favorites array and update local storage
			for(var l = 0; l < favoritesArrary.length; l++)
			{
				if(favoritesArrary[l].url === targetLI.id)
				{
					favoritesArrary.splice(l, 1);
				}
			}

			localStorage.setItem('savedFavorites', JSON.stringify(favoritesArrary));

			targetLI.parentElement.removeChild(targetLI);
		};

		// Create link element
		var urlLink = document.createElement('a');
		urlLink.href = favoritesArrary[k].url;
		var urlText = document.createTextNode(favoritesArrary[k].url);
		urlLink.appendChild(urlText);

		// Set up description element
		var descText;
		if(!favoritesArrary[k].desc)
		{
			descText = document.createTextNode('No description available');
		}
		else
		{
			descText = document.createTextNode(favoritesArrary[k].desc);
		}
		descDT.appendChild(rmFaveButton);
		descDT.appendChild(descText);
		
		// Add contents
		urlDD.appendChild(urlLink);
		newDL.appendChild(descDT);
		newDL.appendChild(urlDD);
		newLI.appendChild(newDL);

		// Append to main list
		list.appendChild(newLI);
	}

	favesDiv.appendChild(list);
}

function makeFavesEntry(targetDesc, targetURL)
{
	// Create list item parts
	var newLI = document.createElement('li');
	var newDL = document.createElement('dl');
	var descDT = document.createElement('dt');
	var urlDD = document.createElement('dd');

	// Assign unique ID to each part
	newLI.setAttribute('id', targetURL);

	// Assign class to each part
	newLI.setAttribute('class', 'gistLI');
	newDL.setAttribute('class', 'gistDL');
	descDT.setAttribute('class', 'descDT');
	urlDD.setAttribute('class', 'urlDD');

	// Create and set up remove from favorites button
	var rmFaveButton = document.createElement('button');
	rmFaveButton.setAttribute('id', (targetURL + '-rmFaveBut'));
	rmFaveButton.setAttribute('class', 'rmFaveButton');
	rmFaveButton.textContent = "-";
	rmFaveButton.onclick = function(rmFromFaves)
	{
		// Get relevant information
		var targetLI = rmFromFaves.target.parentElement.parentElement.parentElement;

		// Remove from favorites array and update local storage
		for(var l = 0; l < favoritesArrary.length; l++)
		{
			if(favoritesArrary[l].url === targetLI.id)
			{
				favoritesArrary.splice(l, 1);
			}
		}
		localStorage.setItem('savedFavorites', JSON.stringify(favoritesArrary));

		targetLI.parentElement.removeChild(targetLI);
	};

	// Create link element
	var urlLink = document.createElement('a');
	urlLink.href = targetURL;
	var urlText = document.createTextNode(targetURL);
	urlLink.appendChild(urlText);

	// Set up description element
	var descText;
	if(!targetDesc)
	{
		descText = document.createTextNode('No description available');
	}
	else
	{
		descText = document.createTextNode(targetDesc);
	}
	descDT.appendChild(rmFaveButton);
	descDT.appendChild(descText);
	
	// Add contents
	urlDD.appendChild(urlLink);
	newDL.appendChild(descDT);
	newDL.appendChild(urlDD);
	newLI.appendChild(newDL);

	// Append to main list
	var list = document.getElementById('favesList');
	list.appendChild(newLI);
}

window.onload = function()
{
	if(localStorage.getItem('savedFavorites') != null)
	{
		favoritesArrary = JSON.parse(localStorage.getItem('savedFavorites'));
	}

	displayFaves();
}