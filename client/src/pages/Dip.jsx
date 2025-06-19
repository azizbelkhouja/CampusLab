// Import axios to make HTTP requests to the backend API
// Importa axios per effettuare richieste HTTP al backend
import axios from 'axios'

// Import React hooks for managing context, state, and side effects
// Importa gli hook di React per gestire il contesto, lo stato e gli effetti collaterali
import { useContext, useEffect, useState } from 'react'

// Import the default toast notification styles
// Importa lo stile predefinito delle notifiche toast
import 'react-toastify/dist/ReactToastify.css'

// Import component that displays the list of departments (Dipartimenti)
// Importa il componente che mostra l'elenco dei dipartimenti
import DipLists from '../components/DipLists'

// Import the navigation bar component
// Importa il componente della barra di navigazione
import Navbar from '../components/Navbar'

// Import component to display classrooms based on selected department
// Importa il componente per visualizzare le aule in base al dipartimento selezionato
import AulaListsByDip from '../components/AulaListsByDip'

// Import the authentication context to access current user info
// Importa il contesto di autenticazione per accedere alle informazioni dell'utente corrente
import { AuthContext } from '../context/AuthContext'

// Main component to manage and display departments and their classrooms
// Componente principale per gestire e visualizzare i dipartimenti e le loro aule
const Dip = () => {
	// Access authentication data (e.g., user role and token) from the AuthContext
	// Accede ai dati di autenticazione (es. ruolo utente e token) dal contesto Auth
	const { auth } = useContext(AuthContext)

	// Load the last selected department index from sessionStorage or default to 0
	// Carica l'indice del dipartimento selezionato da sessionStorage oppure usa 0 come predefinito
	const [selectedDipIndex, setSelectedDipIndex] = useState(
		parseInt(sessionStorage.getItem('selectedDipIndex')) || 0
	)

	// Store the list of departments retrieved from the server
	// Memorizza l'elenco dei dipartimenti recuperati dal server
	const [dips, setDips] = useState([])

	// Boolean to show loading state while departments are being fetched
	// Booleano per mostrare lo stato di caricamento mentre i dipartimenti vengono recuperati
	const [isFetchingDips, setIsFetchingDips] = useState(true)

	// Function to fetch departments from the API
	// Funzione per recuperare i dipartimenti dall'API
	const fetchDips = async (newSelectedDip) => {
		try {
			// Set loading state to true before fetching data
			// Imposta lo stato di caricamento su true prima di recuperare i dati
			setIsFetchingDips(true)

			let response

			// Admin users see unreleased departments
			// Gli utenti admin vedono i dipartimenti non pubblicati
			if (auth.role === 'admin') {
				response = await axios.get('/dip/unreleased', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				// Normal users see only public departments
				// Gli utenti normali vedono solo i dipartimenti pubblici
				response = await axios.get('/dip')
			}

			// Update state with the list of departments
			// Aggiorna lo stato con l'elenco dei dipartimenti
			setDips(response.data.data)

			// If a specific department was selected (e.g., from navigation), find its index and store it
			// Se è stato selezionato un dipartimento specifico (es. dalla navigazione), trova il suo indice e salvalo
			if (newSelectedDip) {
				response.data.data.map((dip, index) => {
					if (dip.name === newSelectedDip) {
						setSelectedDipIndex(index)
						sessionStorage.setItem('selectedDipIndex', index)
					}
				})
			}
		} catch (error) {
			// Log errors in case the API call fails
			// Registra gli errori nel caso in cui la chiamata API fallisca
			console.error(error)
		} finally {
			// Set loading state to false after fetching
			// Imposta lo stato di caricamento su false dopo il recupero dei dati
			setIsFetchingDips(false)
		}
	}

	// useEffect hook runs once when the component is mounted
	// L'hook useEffect viene eseguito una sola volta quando il componente viene montato
	useEffect(() => {
		fetchDips()
	}, [])

	// Prepare all props to pass to child components
	// Prepara tutte le props da passare ai componenti figli
	const props = {
		dips,
		selectedDipIndex,
		setSelectedDipIndex,
		fetchDips,
		auth,
		isFetchingDips
	}

	// Render the layout: navbar + dip list + classrooms for selected dip (if any)
	// Rende il layout: navbar + elenco dei dipartimenti + aule del dipartimento selezionato (se presente)
	return (
		<div className="flex min-h-screen flex-col gap-4">
			<Navbar />
			<DipLists {...props} />
			{dips[selectedDipIndex]?.name && <AulaListsByDip {...props} />}
		</div>
	)
}

// Export the component so it can be used in the app
// Esporta il componente per poterlo usare nell'applicazione
export default Dip
