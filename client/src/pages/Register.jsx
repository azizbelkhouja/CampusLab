import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Register = () => {

	const navigate = useNavigate()
	const [errorsMessage, setErrorsMessage] = useState('')
	const [isRegistering, SetIsRegistering] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const onSubmit = async (data) => {
		SetIsRegistering(true)
		try {
			const response = await axios.post('/auth/register', data)
			console.log(response.data)
			toast.success('Registration successful!', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
			navigate('/')
		} catch (error) {
			console.error(error.response.data)
			setErrorsMessage(error.response.data)
			toast.error('Error', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetIsRegistering(false)
		}
	}

	const inputClasses = () => {
		return 'appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-blue-500'
	}

	return (
		<div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-md space-y-8 p-4 shadow-2xl">
				<div>
					<h2 className="mt-4 text-center text-4xl font-extrabold text-[#213D72]">Registrati</h2>
				</div>
				<form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
					<input
						name="username"
						type="text"
						autoComplete="username"
						{...register('username', { required: true })}
						className={`${inputClasses()} ${errors.username ? 'border-red-500' : ''}`}
						placeholder="Nome utente"
					/>
					{errors.username && <span className="text-sm text-red-500">Il nome utente è obbligatorio</span>}
					<input
						name="email"
						type="email"
						autoComplete="email"
						{...register('email', {
							required: 'L\'email è obbligatoria',
							validate: (value) =>
								value.endsWith('@edu.unife.it') || 'L\'email deve essere un indirizzo @edu.unife.it'
						})}
						className={`${inputClasses()} ${errors.email ? 'border-red-500' : ''}`}
						placeholder="Email"
					/>
					{errors.email && (
						<span className="text-sm text-red-500">{errors.email.message}</span>
					)}
					<input
						name="password"
						type="password"
						autoComplete="current-password"
						{...register('password', {
							required: 'La password è obbligatoria',
							minLength: {
								value: 6,
								message: 'La password deve essere lunga almeno 6 caratteri'
							}
						})}
						className={`${inputClasses()} ${errors.password ? 'border-red-500' : ''}`}
						placeholder="Password"
					/>
					{errors.password && <span className="text-sm text-red-500">{errors.password?.message}</span>}
					<div>
						{errorsMessage && <span className="text-sm text-red-500">{errorsMessage}</span>}
						<button
							type="submit"
							className="mt-4 w-full bg-[#213D72] py-2 px-4 font-medium text-white drop-shadow-md hover:bg-blue-900"
							disabled={isRegistering}
						>
							{isRegistering ? 'Elaborazione...' : 'Registrati'}
						</button>
					</div>
					<p className="text-right text-[#0086A0]">
						Hai già un account?{' '}
						<Link to={'/login'} className="text-black">
							Accedi qui
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}

export default Register
