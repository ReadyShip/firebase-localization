firebase.auth().onAuthStateChanged(function(user)
{
	if (user)
	{
		window.location.href = '/overview'
	}
	else
	{
		const form = byId('form')
		form.style.visibility = 'visible'
	}
})

app.controller('loginCtrl', function($scope)
{
	$scope.form = {
		email: '',
		password: '',
		loading: false,
		error: ''
	}

	$scope.login = function(email, password)
	{
		$scope.form.error = ''
		$scope.form.loading = true

		firebase.auth().signInWithEmailAndPassword(email, password)
		.catch(function(error)
		{
			$scope.form.loading = false
			$scope.$applyAsync()
	
			$scope.form.error = error.message
		})
	}
})

function login2()
{
	const email = byId('form.email')
	const password = byId('form.password')
	const button = byId('form.button')

	const buttonNormal = byId('form.button.normal')
	const buttonLoading = byId('form.button.loading')

	email.disabled = true
	password.disabled = true
	button.disabled = true

	buttonNormal.style.display = 'none'
	buttonLoading.style.display = 'inline'

	firebase.auth().signInWithEmailAndPassword(email.value, password.value)
	.catch(function(error)
	{
		email.disabled = false
		password.disabled = false
		button.disabled = false

		buttonNormal.style.display = 'inline'
		buttonLoading.style.display = 'none'

		console.log("ERROR: " + JSON.stringify(error))
	})
}