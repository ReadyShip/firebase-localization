app.service('databaseLanguage', function(database)
{
	this.ref = function()
	{
		return database.ref('languages')
	}

	this.fromSnap = function(snap)
	{
		const languages = {}

		snap.forEach(function(entry)
		{
			languages[entry.key] = new Language(entry.key, entry.val())
		})

		return languages
	}

	this.addLanguage = function(value)
	{
		database.push('languages', value)
	}

	this.updateLanguage = function(id, value)
	{
		database.set(languagePath(id), value)
	}

	this.removeLanguage = function(id)
	{
		database.remove(languagePath(id))
	}

	function languagePath(languageId)
	{
		return `languages/${languageId}`
	}
})