import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Register = () => {
  // Hook to navigate programmatically
  // Hook per navigare programmaticamente
  const navigate = useNavigate()

  // State to hold error message from server
  // Stato per memorizzare il messaggio di errore dal server
  const [errorsMessage, setErrorsMessage] = useState('')

  // State to know if registration is in progress
  // Stato per sapere se la registrazione è in corso
  const [isRegistering, SetIsRegistering] = useState(false)

  // React Hook Form setup: register inputs and handle errors
  // Setup di React Hook Form: registra input e gestisce errori
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  // Function called on form submit
  // Funzione chiamata al submit del form
  const onSubmit = async (data) => {
    // Set registering state true to disable button and show loading
    // Imposta lo stato di registrazione attivo per disabilitare il bottone e mostrare caricamento
    SetIsRegistering(true)
    try {
      // Send POST request to backend with user data
      // Invio richiesta POST al backend con i dati utente
      const response = await axios.post('/auth/register', data)
      console.log(response.data)

      // Show success toast notification
      // Mostra notifica di successo
      toast.success('Registration successful!', {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false
      })

      // Navigate to home page after registration
      // Naviga alla homepage dopo la registrazione
      navigate('/')
    } catch (error) {
      // Log error and set error message to display
      // Log dell’errore e set del messaggio di errore da mostrare
      console.error(error.response.data)
      setErrorsMessage(error.response.data)

      // Show error toast notification
      // Mostra notifica di errore
      toast.error('Error', {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false
      })
    } finally {
      // Always reset registering state
      // Resetta sempre lo stato di registrazione
      SetIsRegistering(false)
    }
  }

  // Function returning input CSS classes
  // Funzione che restituisce le classi CSS per gli input
  const inputClasses = () => {
    return 'appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:border-blue-500'
  }

  return (
    // Container with gradient background and centered form
    // Contenitore con sfondo sfumato e form centrato
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-4 shadow-xl">
        <div>
          {/* Page title */}
          {/* Titolo della pagina */}
          <h2 className="mt-4 text-center text-4xl font-extrabold text-gray-900">Register</h2>
        </div>

        {/* Registration form */}
        {/* Form di registrazione */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Username input */}
          {/* Input per il nome utente */}
          <input
            name="username"
            type="text"
            autoComplete="username"
            {...register('username', { required: true })}
            className={inputClasses() + (errors.username ? ' border-red-500' : '')}
            placeholder="Username"
          />
          {errors.username && (
            <span className="text-sm text-red-500">Nome Utente è obbligatorio</span>
          )}

          {/* Email input */}
          {/* Input per email */}
          <input
            name="email"
            type="email"
            autoComplete="email"
            {...register('email', { required: true })}
            className={inputClasses() + (errors.email ? ' border-red-500' : '')}
            placeholder="Email"
          />
          {errors.email && <span className="text-sm text-red-500">Email è obbligatorio</span>}

          {/* Password input */}
          {/* Input per password */}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long'
              }
            })}
            className={inputClasses() + (errors.password ? ' border-red-500' : '')}
            placeholder="Password"
          />
          {errors.password && (
            <span className="text-sm text-red-500">{errors.password?.message}</span>
          )}

          <div>
            {/* Server error message */}
            {/* Messaggio di errore dal server */}
            {errorsMessage && <span className="text-sm text-red-500">{errorsMessage}</span>}

            {/* Submit button */}
            {/* Pulsante di invio */}
            <button
              type="submit"
              className="mt-4 w-full rounded-md bg-blue-600 bg-gradient-to-br from-indigo-600 to-blue-500 py-2 px-4 font-medium text-white drop-shadow-md hover:bg-blue-700 hover:from-indigo-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:from-slate-500 disabled:to-slate-400"
              disabled={isRegistering}
            >
              {isRegistering ? 'Elaborazione...' : 'Registrati'}
            </button>
          </div>

          {/* Link to login page */}
          {/* Link alla pagina di login */}
          <p className="text-right">
            Hai già un account?{' '}
            <Link to={'/login'} className="font-bold text-blue-600">
              Accedi qui
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
