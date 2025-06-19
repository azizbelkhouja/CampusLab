// Import the axios library to make HTTP requests
// Importa la libreria axios per effettuare richieste HTTP
import axios from 'axios'

// Import React functions to create context and handle state and lifecycle
// Importa le funzioni di React per creare un contesto e gestire lo stato e il ciclo di vita del componente
import { createContext, useEffect, useState } from 'react'

// Create a new context object to hold authentication-related data
// Crea un nuovo oggetto contesto per contenere i dati relativi all'autenticazione
const AuthContext = createContext()

// This component provides authentication context to the children components
// Questo componente fornisce il contesto di autenticazione ai componenti figli
const AuthContextProvider = ({ children }) => {

	// Define the authentication state and initialize it with localStorage data if available
	// Definisce lo stato di autenticazione e lo inizializza con i dati presenti in localStorage, se disponibili
	const [auth, setAuth] = useState(
		JSON.parse(localStorage.getItem('auth')) || {
			username: null,
			email: null,
			role: null,
			token: null
		}
	)

	// Define an asynchronous function to retrieve the logged-in user's data
	// Definisce una funzione asincrona per recuperare i dati dell'utente autenticato
	const getUser = async () => {
		try {
			// If there is no token, stop the function early
			// Se non esiste alcun token, esce anticipatamente dalla funzione
			if (!auth.token) return

			// Send GET request to the /auth/me endpoint with the token in the Authorization header
			// Invia una richiesta GET all'endpoint /auth/me includendo il token nell'header Authorization
			const response = await axios.get('/auth/me', {
				headers: {
					Authorization: `Bearer ${auth.token}`
				}
			})

			// Create an updated auth object with the latest user data from the response
			// Crea un oggetto auth aggiornato con i dati utente più recenti dalla risposta
			const updatedAuth = {
				...auth,
				username: response.data.data.username,
				email: response.data.data.email,
				role: response.data.data.role
			}

			// If any of the user fields have changed, update the auth state
			// Se uno dei campi utente è cambiato, aggiorna lo stato auth
			if (
				updatedAuth.username !== auth.username ||
				updatedAuth.email !== auth.email ||
				updatedAuth.role !== auth.role
			) {
				setAuth(updatedAuth)
			}
		} catch (error) {
			// Log any error that occurs during the API call
			// Registra eventuali errori avvenuti durante la chiamata API
			console.error(error)
		}
	}

	// useEffect runs when the component mounts or when `auth` changes
	// useEffect viene eseguito quando il componente viene montato o quando `auth` cambia
	useEffect(() => {

		// Fetch user data from the server using the token
		// Recupera i dati dell'utente dal server utilizzando il token
		getUser()

		// Save the current authentication state to localStorage
		// Salva lo stato corrente dell'autenticazione in localStorage
		localStorage.setItem('auth', JSON.stringify(auth))
	}, [auth])

	// Return the context provider so that all child components can access `auth` and `setAuth`
	// Restituisce il provider del contesto affinché tutti i componenti figli possano accedere a `auth` e `setAuth`
	return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthContextProvider }
