import axios from 'axios'
import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthContext } from '../context/AuthContext'

const Login = () => {

	const navigate = useNavigate()
	const { auth, setAuth } = useContext(AuthContext)
	const [errorsMessage, setErrorsMessage] = useState('')
	const [isLoggingIn, SetLoggingIn] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm()

	const onSubmit = async (data) => {
		SetLoggingIn(true)
		try {
			const response = await axios.post('/auth/login', data)
			console.log(response.data)
			toast.success('Accesso riuscito', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
			setAuth((prev) => ({ ...prev, token: response.data.token }))
			navigate('/')
		} catch (error) {
			console.error(error.response.data)
			setErrorsMessage(error.response.data)
			toast.error('Errore durante il login', {
				position: 'top-center',
				autoClose: 2000,
				pauseOnHover: false
			})
		} finally {
			SetLoggingIn(false)
		}
	}

	const inputClasses = () => {
		return 'appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none border-[#213D72] focus:ring-[#213D72] focus:border-[#213D72] shadow-sm sm:text-sm'
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md space-y-8 p-4 shadow-2xl  bg-white">
				<div>
					<h2 className="mt-4 text-center text-4xl font-extrabold text-[#213D72]">Login</h2>
				</div>
				<form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
					<input
						name="username"
						type="text"
						autoComplete="username"
						{...register('username', { required: true })}
						className={inputClasses`${errors.username ? 'border-red-500' : ''}`}
						placeholder="Username"
					/>
					{errors.username && <span className="text-sm text-red-500">Nome utente è obbligatorio</span>}
					<input
						name="password"
						type="password"
						autoComplete="current-password"
						{...register('password', { required: true })}
						className={inputClasses`${errors.password ? 'border-red-500' : ''}`}
						placeholder="Password"
					/>
					{errors.password && <span className="text-sm text-red-500">Password è obbligatoria</span>}

					<div>
						{errorsMessage && <span className="text-sm text-red-500">{errorsMessage}</span>}
						<button
							type="submit"
							className="mt-4 w-full bg-[#213D72] py-2 px-4 font-medium text-white drop-shadow-md hover:bg-blue-900"
							disabled={isLoggingIn}
						>
							{isLoggingIn ? 'Processing...' : 'Login'}
						</button>
					</div>
					<p className="text-right text-[#0086A0]">
						Non hai un account?{' '}
						<Link to={'/register'} className="text-black">
							Registrati qui
						</Link>
					</p>
				</form>
			</div>
		</div>
	)
}

export default Login
