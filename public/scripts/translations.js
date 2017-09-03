angular.module('translationsApp', []).controller('translationsCtrl', function($scope)
{
	$scope.locales = {}
	$scope.translations = {}
	$scope.filter = {
		content: '',
		locale: {},
		state: {
			translated: true,
			notTranslated: true,
			validated: true,
			notValidated: true
		}
	}

	$scope.dialog = {
		translation: {
			id: '',
			key: '',
			locales: {},
			description: '',
			tags: '',
			maxLength: '',
			screenshot: '',
			isPlural: false,
			isArray: false
		},
		deleteTranslation: {
			id: '',
			key: ''
		}
	}
	
	$scope.init = function()
	{
		localesRef().once('value', snapLocales =>
		{	
			$scope.locales = localesFromSnap(snapLocales)

			for (const index in $scope.locales)
			{
				$scope.filter.locale[index] = true
			}
	
			translationsRef().once('value', snapTranslations =>
			{
				$scope.translations = translationsFromSnap(snapTranslations)
				orderTranslations()
				$scope.$applyAsync()
				displayContent()
			})
		})

		$('#collapseFilter').on('shown.bs.collapse', function()
		{
			$('#filter-content-input').focus()
		})
	}

	$scope.onTranslationKeyUpdated = function(translation)
	{
		updateTranslationRef(translation.id + '/key', translation.key)

		orderTranslations()
	}

	$scope.onTranslationValueUpdated = function(translation, locale)
	{
		const newValue = translation.locales[locale.id].value
		const oldValue = translation.locales[locale.id].oldValue

		if (newValue != oldValue)
		{
			updateTranslationRef(translation.id + '/locales/' + locale.id + '/value', newValue)
			translation.locales[locale.id].oldValue = newValue

			if (translation.locales[locale.id].validated)
			{
				updateTranslationValidated(translation, locale, false)
			}
		}
	}

	$scope.onTranslationValidatedChanged = function(translation, locale)
	{
		updateTranslationValidated(translation, locale, !translation.locales[locale.id].validated)
	}

	function updateTranslationValidated(translation, locale, value)
	{
		translation.locales[locale.id].validated = value
		updateTranslationRef(translation.id + '/locales/' + locale.id + '/validated', value)
	}

	$scope.openAddTranslationDialog = function()
	{
		$scope.dialog.translation.id          = ''
		$scope.dialog.translation.key         = ''
		$scope.dialog.translation.description = ''
		$scope.dialog.translation.tags        = ''
		$scope.dialog.translation.maxLength   = ''
		$scope.dialog.translation.screenshot  = ''
		$scope.dialog.translation.isPlural    = false
		$scope.dialog.translation.isArray     = false

		for (const index in $scope.locales)
		{
			$scope.dialog.translation.locales[index] = {
				value: '',
				oldValue: null,
				validated: false
			}
		}
	
		openTranslationDialog()
	}

	$scope.openEditTranslationDialog = function(translation)
	{
		$scope.dialog.translation.id          = translation.id
		$scope.dialog.translation.key         = translation.key
		$scope.dialog.translation.description = translation.description
		$scope.dialog.translation.tags        = translation.tags
		$scope.dialog.translation.maxLength   = translation.maxLength
		$scope.dialog.translation.screenshot  = translation.screenshot
		$scope.dialog.translation.isPlural    = translation.isPlural
		$scope.dialog.translation.isArray     = translation.isArray

		for (const index in $scope.locales)
		{
			$scope.dialog.translation.locales[index] = {
				value: translation.locales[index].value,
				oldValue: translation.locales[index].value,
				validated: translation.locales[index].validated
			}
		}
	
		openTranslationDialog()
	}

	function openTranslationDialog()
	{
		$('#translation-dialog').on('shown.bs.modal', function()
		{
			$('#translation-dialog-key').focus()
		})

		$('#translation-dialog-tabs a:first').tab('show')

		$('#translation-dialog').on('shown.bs.tab', function(event)
		{
			if (event.target.href.includes('#translation-dialog-tab-translations'))
			{
				$('#translation-dialog-key').focus()
			}
			else if (event.target.href.includes('#translation-dialog-tab-properties'))
			{
				$('#translation-dialog-description').focus()
			}
		})

		$('#translation-dialog').modal()
	}

	$scope.onAddTranslation = function(form)
	{
		var value = {
			key: form.key,
			description: form.description,
			tags: form.tags,
			maxLength: form.maxLength,
			screenshot: form.screenshot,
			isPlural: form.isPlural,
			isArray: form.isArray,
			locales: {}
		}

		for (const index in form.locales)
		{
			var locale = form.locales[index]

			value.locales[index] = {
				value: locale.value,
				validated: locale.validated
			}
		}
	
		addTranslationRef(value)
	}

	$scope.onEditTranslation = function(form)
	{
		var value = {
			key: form.key,
			description: form.description,
			tags: form.tags,
			maxLength: form.maxLength,
			screenshot: form.screenshot,
			isPlural: form.isPlural,
			isArray: form.isArray,
			locales: {}
		}

		var sourceTranslation = translationById(form.id)
		sourceTranslation.key         = form.key
		sourceTranslation.description = form.description
		sourceTranslation.tags        = form.tags
		sourceTranslation.maxLength   = form.maxLength
		sourceTranslation.screenshot  = form.screenshot
		sourceTranslation.isPlural    = form.isPlural
		sourceTranslation.isArray     = form.isArray

		for (const index in form.locales)
		{
			var locale = form.locales[index]

			value.locales[index] = {
				value: locale.value,
				validated: locale.validated && (locale.value == locale.oldValue)
			}

			sourceTranslation.locales[index].value     = value.locales[index].value
			sourceTranslation.locales[index].validated = value.locales[index].validated
		}
		
		orderTranslations()
		updateTranslationRef(form.id, value)
	}

	function translationById(id)
	{
		for (const index in $scope.translations)
		{
			if ($scope.translations[index].id == id)
			{
				return $scope.translations[index]
			}
		}

		return null
	}

	$scope.openRemoveTranslationDialog = function(translation)
	{
		$scope.dialog.deleteTranslation.id = translation.id
		$scope.dialog.deleteTranslation.key = translation.key

		$('#delete-translation-dialog').modal()
	}

	$scope.onDeleteTranslation = function(id)
	{
		removeTranslationRef(id)

		$('#translation-dialog').modal('hide')
	}

	$scope.translationValidatedState = function(value)
	{
		return value ? 'translation-checkbox-on' : 'translation-checkbox-off'
	}
	
	$scope.displayByState = function(translation)
	{
		var translated = ($scope.filter.state.translated ? translation.hasTranslated() : false)
		var notTranslated = ($scope.filter.state.notTranslated ? translation.hasNotTranslated() : false)
		var validated = ($scope.filter.state.validated ? translation.hasValidated() : false)
		var notValidated = ($scope.filter.state.notValidated ? translation.hasNotValidated() : false)
		var byText = ($scope.filter.content ? translation.contains($scope.filter.content.toLowerCase()) : true)

		return (translated || notTranslated || validated || notValidated) && byText
	}

	function orderTranslations()
	{
		$scope.translations = $scope.translations.sort(function(a, b)
		{
			return (a.key < b.key) ? -1 : (a.key > b.key);
		})
	}

	$scope.init()
})