import axios from 'axios'
import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthContext } from '../context/AuthContext'

const Login = () => {
  // React Router navigate function to programmatically redirect users
  // Funzione navigate di React Router per reindirizzare gli utenti programmaticamente
  const navigate = useNavigate()

  // Access authentication state and setter from AuthContext
  // Accesso allo stato di autenticazione e alla funzione setter dal contesto AuthContext
  const { auth, setAuth } = useContext(AuthContext)

  // Local state to store error message from backend
  // Stato locale per memorizzare il messaggio di errore proveniente dal backend
  const [errorsMessage, setErrorsMessage] = useState('')

  // Local state to indicate loading state during login process
  // Stato locale per indicare il caricamento durante il processo di login
  const [isLoggingIn, setLoggingIn] = useState(false)

  // Setup react-hook-form methods for form handling and validation
  // Configurazione di react-hook-form per gestire il form e la validazione
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  // Function called when the form is submitted with valid data
  // Funzione chiamata alla submit del form con dati validi
  const onSubmit = async (data) => {
    setLoggingIn(true) // Show loading state
    setErrorsMessage('') // Clear previous error messages

    try {
      // Send POST request to backend login endpoint with form data
      // Invio richiesta POST al backend con i dati del form
      const response = await axios.post('/auth/login', data)

      // Log response (for debugging)
      console.log(response.data)

      // Show success toast notification
      toast.success('Accesso riuscito', {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false
      })

      // Update auth context with new token from response
      setAuth((prev) => ({ ...prev, token: response.data.token }))

      // Redirect user to home page after successful login
      navigate('/')
    } catch (error) {
      // Log error response for debugging
      console.error(error.response.data)

      // Set error message to display to the user
      setErrorsMessage(error.response.data)

      // Show error toast notification
      toast.error('Errore durante il login', {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false
      })
    } finally {
      // Stop loading state regardless of outcome
      setLoggingIn(false)
    }
  }

  // Function that returns base input classes for styling
  // Funzione che ritorna le classi base per lo styling degli input
  const inputClasses = () => {
    return 'appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none border-[#213D72] focus:ring-[#213D72] focus:border-[#213D72] shadow-sm sm:text-sm'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#213D72]">
      {/* Container centering the login box */}
      {/* Contenitore che centra la finestra di login */}
      <div className="w-full max-w-md space-y-8 p-4 shadow-xl bg-white">
        <div>
          {/* Title of the login form */}
          {/* Titolo del form di login */}
          <h2 className="mt-4 text-center text-4xl font-extrabold text-[#213D72]">Login</h2>
        </div>

        {/* Login form with validation and submission handling */}
        {/* Form di login con validazione e gestione della submit */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Username input field with required validation */}
          {/* Campo input per username con validazione "obbligatorio" */}
          <input
            name="username"
            type="text"
            autoComplete="username"
            {...register('username', { required: true })}
            className={inputClasses() + (errors.username ? ' border-red-500' : '')}
            placeholder="Username"
          />
          {/* Show error message if username validation fails */}
          {/* Mostra messaggio di errore se la validazione dello username fallisce */}
          {errors.username && <span className="text-sm text-red-500">Nome utente è obbligatorio</span>}

          {/* Password input field with required validation */}
          {/* Campo input per password con validazione "obbligatorio" */}
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            {...register('password', { required: true })}
            className={inputClasses() + (errors.password ? ' border-red-500' : '')}
            placeholder="Password"
          />
          {/* Show error message if password validation fails */}
          {/* Mostra messaggio di errore se la validazione della password fallisce */}
          {errors.password && <span className="text-sm text-red-500">Password è obbligatoria</span>}

          <div>
            {/* Display backend error messages, if any */}
            {/* Mostra messaggi di errore dal backend, se presenti */}
            {errorsMessage && <span className="text-sm text-red-500">{errorsMessage}</span>}

            {/* Submit button, disabled while login is processing */}
            {/* Pulsante submit disabilitato durante il caricamento */}
            <button
              type="submit"
              className="mt-4 w-full bg-[#213D72] py-2 px-4 font-medium text-white drop-shadow-md hover:bg-blue-900 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:from-slate-500 disabled:to-slate-400"
              disabled={isLoggingIn}
            >
              {/* Show "Processing..." while loading, else "Login" */}
              {/* Mostra "Processing..." durante il caricamento, altrimenti "Login" */}
              {isLoggingIn ? 'Processing...' : 'Login'}
            </button>
          </div>

          {/* Link to registration page for users without an account */}
          {/* Link alla pagina di registrazione per utenti senza account */}
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
