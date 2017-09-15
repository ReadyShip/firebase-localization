app.service('databaseLanguage', function(database)
{
	this.ref = function()
	{
		return database.ref('languages')
	}

	this.root = function()
	{
		return database.ref('languages')
	}

	this.rootLive = function(callback)
	{
		this.root().on('value', snap =>
		{	
			callback(this.fromSnap(snap))
		})
	}

	this.rootStatic = function(callback)
	{
		this.root().once('value', snap =>
		{	
			callback(this.fromSnap(snap))
		})
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

	this.add = function(value)
	{
		return database.push('languages', value)
	}

	this.update = function(id, value)
	{
		return database.set(languagePath(id), value)
	}

	this.remove = function(id)
	{
		return database.remove(languagePath(id))
	}

	function languagePath(languageId)
	{
		return `languages/${languageId}`
	}
})