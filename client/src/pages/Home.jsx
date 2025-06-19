// Import axios for making HTTP requests to the backend API
// Importa axios per effettuare richieste HTTP al backend
import axios from 'axios'

// Import React hooks: useContext for context access, useEffect for side effects, useState for local state
// Importa gli hook di React: useContext per accedere al contesto, useEffect per gli effetti collaterali, useState per lo stato locale
import { useContext, useEffect, useState } from 'react'

// Import default CSS for toast notifications
// Importa il CSS predefinito per le notifiche toast
import 'react-toastify/dist/ReactToastify.css'

// Import the navigation bar component
// Importa il componente della barra di navigazione
import Navbar from '../components/Navbar'

// Import component that shows currently active seminars (seminari in corso)
// Importa il componente che mostra i seminari attualmente in corso
import NowShowing from '../components/NowShowing'

// Import component that displays classrooms related to a selected seminar
// Importa il componente che mostra le aule collegate al seminario selezionato
import AulaListsBySeminario from '../components/AulaListsBySeminario'

// Import the authentication context to access the current user's role and token
// Importa il contesto di autenticazione per accedere al ruolo e al token dell'utente corrente
import { AuthContext } from '../context/AuthContext'

// Define the main Home component, which displays the seminar list and related classrooms
// Definisce il componente principale Home, che mostra l'elenco dei seminari e le relative aule
const Home = () => {
	// Get authentication data from the context (role, token, etc.)
	// Ottiene i dati di autenticazione dal contesto (ruolo, token, ecc.)
	const { auth } = useContext(AuthContext)

	// Track which seminar is currently selected using sessionStorage (so selection persists on refresh)
	// Tiene traccia di quale seminario è selezionato usando sessionStorage (così la selezione persiste al refresh)
	const [selectedSeminarioIndex, setSelectedSeminarioIndex] = useState(parseInt(sessionStorage.getItem('selectedSeminarioIndex')))

	// Store the list of seminars fetched from the backend
	// Memorizza l'elenco dei seminari recuperati dal backend
	const [seminari, setSeminari] = useState([])

	// Track whether seminar fetching is complete (used for conditional rendering or loading states)
	// Tiene traccia del completamento del recupero seminari (utile per rendering condizionale o stati di caricamento)
	const [isFetchingSeminariDone, setIsFetchingSeminariDone] = useState(false)

	// Function to fetch currently active seminars from the backend
	// Funzione per recuperare i seminari attivi dal backend
	const fetchSeminari = async (data) => {
		try {
			// Set loading flag to false before starting fetch
			// Imposta il flag di caricamento su false prima di iniziare il recupero
			setIsFetchingSeminariDone(false)

			let response

			// If the user is admin, fetch even the unreleased seminars
			// Se l'utente è admin, recupera anche i seminari non pubblicati
			if (auth.role === 'admin') {
				response = await axios.get('/seminario/unreleased/showing', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				// Regular users only see public active seminars
				// Gli utenti normali vedono solo i seminari attivi e pubblici
				response = await axios.get('/seminario/showing')
			}

			// Update state with the fetched seminar list
			// Aggiorna lo stato con l'elenco dei seminari ricevuti
			setSeminari(response.data.data)
		} catch (error) {
			// Log any errors that occur during fetching
			// Registra eventuali errori durante il recupero dei seminari
			console.error(error)
		} finally {
			// Set loading flag to true to indicate completion
			// Imposta il flag di caricamento su true per indicare il completamento
			setIsFetchingSeminariDone(true)
		}
	}

	// useEffect runs once when the component is mounted
	// useEffect viene eseguito una sola volta quando il componente viene montato
	useEffect(() => {
		fetchSeminari()
	}, [])

	// Props to be shared with child components like NowShowing and AulaListsBySeminario
	// Props da condividere con i componenti figli come NowShowing e AulaListsBySeminario
	const props = {
		seminari,
		selectedSeminarioIndex,
		setSelectedSeminarioIndex,
		auth,
		isFetchingSeminariDone
	}

	// Component rendering: Navbar at the top, then the list of active seminars, and finally the classrooms if a seminar is selected
	// Rendering del componente: Navbar in alto, poi l'elenco dei seminari attivi, e infine le aule se un seminario è selezionato
	return (
		<div className="flex min-h-screen flex-col gap-4 pb-8 sm:gap-8">
			<Navbar />
			<NowShowing {...props} />
			{seminari[selectedSeminarioIndex]?.name && <AulaListsBySeminario {...props} />}
		</div>
	)
}

// Export the Home component so it can be used in routing or app entry
// Esporta il componente Home per poterlo usare nel routing o come punto di accesso dell'app
export default Home
