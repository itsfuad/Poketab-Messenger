const changePasswordForm = `<form method="post" id="changePassword">
<div class="title" id="info">Change Password</div>
<div class="input-field">
    <input type="text" id="username" name="username" data-name="Username" required>
    <label for="username">New Username</label>
</div>
<div class="input-field">
    <input type="password" id="oldPassword" name="oldPassword" data-name="Old Password" required>
    <label for="oldPassword">Old Password</label>
</div>
<div class="input-field">
    <input type="password" id="newPassword" name="newPassword" data-name="New Password" required>
    <label for="newPassword">New Password</label>
</div>
<div class="input-field">
    <input type="password" id="confirmPassword" name="confirmPassword" data-name="Comfirm Password" required>
    <label for="confirmPassword">Confirm Password</label>
</div>
<button id="submit" class="button" type="submit">Change Password</button>
<button id="cancelChangePassword" class="button">Cancel</button>
</form>`;

// Path: public\scripts\changeAdminPass.js

function changeAdminPass() {
	const changePassword = document.getElementById('changePassword');
	changePassword.addEventListener('submit', (e) => {
		e.preventDefault();
		const username = document.getElementById('username').value;
		const oldPassword = document.getElementById('oldPassword').value;
		const newPassword = document.getElementById('newPassword').value;
		const confirmPassword = document.getElementById('confirmPassword').value;

		if (newPassword !== confirmPassword) {
			//alert('Passwords do not match');
			const passwordLabel = document.querySelector('#confirmPassword + label');
			passwordLabel.style.color = '#ff2121';
			passwordLabel.textContent = 'Passwords did not match';
			document.getElementById('confirmPassword').focus();
		} else {
			fetch('/admin/changePassword', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username,
					oldPassword,
					newPassword,
				}),
			})
				.then((res) => {
					if (res.status === 200) {
						console.log('Password changed');
						changePassword.classList.remove('active');
						setTimeout(() => {
							changePassword.remove();
						}, 500);
					} else if(res.status === 401) {
						console.log('Password not changed');
						const passwordLabel = document.querySelector('#oldPassword + label');
						passwordLabel.style.color = '#ff2121';
						passwordLabel.textContent = 'Password is incorrect';
						document.getElementById('oldPassword').focus();
					} else if (res.status === 403){
						location.reload();
					}
				});
		}
	});

	document.getElementById('cancelChangePassword').addEventListener('click', (e) => {
		e.preventDefault();
		const changePassword = document.getElementById('changePassword');
		changePassword.classList.remove('active');
		setTimeout(() => {
			changePassword.remove();
		}, 500);
	});

	//event listener for input fields
	const inputFields = document.querySelectorAll('.input-field input');
	inputFields.forEach((input) => {
		input.addEventListener('input', (e) => {
			const label = document.querySelector(`#${e.target.id} + label`);
			label.style.color = 'white';
			label.textContent = e.target.dataset.name;
		});
	});
}

// eslint-disable-next-line no-unused-vars
function changePassword() {
	//create from the string
	if (document.getElementById('changePassword')) return;
	document.body.insertAdjacentHTML('afterbegin', changePasswordForm);
	setTimeout(() => {
		document.getElementById('changePassword').classList.add('active');
		changeAdminPass();
	}, 100);
}