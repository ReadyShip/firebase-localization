function setupApp()
{
	setupDatabase()
}

function setupDatabase()
{
	const dbRef = firebase.database().ref().child('locales')

	dbRef.on('value', snap => {
		constructLocalesTable(snap)

		document.getElementById('loading-progress').style.display = 'none'
		document.getElementById('overview-content').style.display = 'block'
	})
}

function constructLocalesTable(snap)
{
	const locales = snap.val()

	var oldTableBody = document.getElementById('overview-table-locales')
	var newTableBody = document.createElement('tbody')
	newTableBody.id = 'overview-table-locales'
	
	for (var locale in locales)
	{
		newTableBody.appendChild(createLocaleRow(locale, locales[locale]))
	}

	oldTableBody.parentNode.replaceChild(newTableBody, oldTableBody)
}

function createLocaleRow(key, locale)
{
	var tr = document.createElement('tr')

	var tdName = document.createElement('td')
	tdName.scope = 'row'
	tdName.innerText = LOCALES[key] + ' (' + key + ')'
	tdName.classList.add('align-middle')
	tr.appendChild(tdName)

	var tdTranslated = document.createElement('td')
	tdTranslated.appendChild(createColoredPercentage(locale.translated))
	tdTranslated.classList.add('align-middle')
	tr.appendChild(tdTranslated)

	var tdProofread = document.createElement('td')
	tdProofread.appendChild(createColoredPercentage(locale.proofread))
	tdProofread.classList.add('align-middle')
	tr.appendChild(tdProofread)

	var tdEdit = document.createElement('td')
	tdEdit.innerHTML = buttonAction("fa-pencil");
	tr.appendChild(tdEdit)

	var tdDelete = document.createElement('td')
	tdDelete.innerHTML = buttonAction("fa-times");
	tr.appendChild(tdDelete)

	var tdAndroid = document.createElement('td')
	tdAndroid.innerHTML = buttonAction("fa-arrow-circle-o-down");
	tr.appendChild(tdAndroid)

	var tdIOS = document.createElement('td')
	tdIOS.innerHTML = buttonAction("fa-arrow-circle-o-down");
	tr.appendChild(tdIOS)

	return tr
}

function buttonAction(icon)
{
	return "<button type='button' class='btn btn-outline-light button-action'><i class='fa " + icon + " button-action-icon'></i></button>";
}

function createColoredPercentage(value)
{
	var span = document.createElement('span')

	if (value == 100)
	{
		span.style.color = '#80B66A'	
	}
	else if (value >= 50)
	{
		span.style.color = '#F19803'
	}
	else
	{
		span.style.color = '#FF6666'
	}

	span.appendChild(document.createTextNode(value + '%'))

	return span
}

function firebaseLogout()
{
	firebase.auth().signOut().then(function() {
		window.location.href='/'
	}, function(error) {
		// handle error
	})
}