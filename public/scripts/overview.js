function onLanguageSelected()
{
	controllerById('language-dialog').onLanguageSelected()
}

app.controller('overviewCtrl', function($scope, database)
{
	$scope.apiToken = ''

	$scope.locales = {}

	$scope.init = function()
	{
		database.localesRef().on('value', snapLocales =>
		{	
			$scope.locales = database.localesFromSnap(snapLocales)

			database.translationsRef().on('value', snapTranslations =>
			{
				const summary = $scope.summary($scope.locales, database.translationsFromSnap(snapTranslations))

				for (const index in summary)
				{
					const entry = summary[index]
					$scope.locales[index].translated = (entry.total > 0) ? parseInt(entry.translated * 100 / entry.total) : 0
					$scope.locales[index].validated  = (entry.total > 0) ? parseInt(entry.validated  * 100 / entry.total) : 0
				}

				$scope.$applyAsync()
				displayContent()
			})

			database.apiTokenRef().once('value', snap =>
			{
				$scope.apiToken = snap.val()
			})
		})
	}

	$scope.summary = function(locales, translations)
	{
		var summary = {}

		for (const index in locales)
		{
			summary[index] = {
				translated: 0,
				validated: 0,
				total: 0
			}
		}

		for (const translationIndex in translations)
		{
			const translation = translations[translationIndex]

			for (const localeIndex in translation.locales)
			{
				const locale = translation.locales[localeIndex]
				
				summary[localeIndex].total++

				if (locale.value)
				{
					summary[localeIndex].translated++
				}

				if (locale.validated)
				{
					summary[localeIndex].validated++
				}
			}
		}

		return summary
	}

	$scope.localeProgressValue = function(value)
	{
		return {
			width: value + '%'
		}
	}

	$scope.localeProgressColor = function(value)
	{
		if (value == 100)
		{
			return 'progress-bar-indicator-high'
		}
		else if (value >= 50)
		{
			return 'progress-bar-indicator-medium'
		}
		else
		{
			return 'progress-bar-indicator-low'
		}
	}

	$scope.exportAndroid = function(locale)
	{
		downloadFile('https://' + window.location.host + '/api/export/' + locale.code + '/android')
	}

	$scope.exportIOS = function(locale)
	{
		downloadFile('https://' + window.location.host + '/api/export/' + locale.code + '/ios')
	}

	$scope.openAddLanguageDialog = function()
	{
		controllerById('language-dialog').openAdd()
	}

	$scope.openEditLanguageDialog = function(locale)
	{
		controllerById('language-dialog').openEdit(locale)
	}

	$scope.openDeleteLanguageDialog = function(locale)
	{
		controllerById('delete-language-dialog').open(locale)
	}

	$scope.openProfileDialog = function()
	{
		controllerById('profile-dialog').open()
	}

	$scope.init()
})