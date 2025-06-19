import { TicketIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { useContext, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Navbar from '../components/Navbar'
import ShowtimeDetails from '../components/ShowtimeDetails'
import { AuthContext } from '../context/AuthContext'

const Purchase = () => {
  // React Router navigate function to redirect user after purchase
  // Funzione navigate di React Router per reindirizzare l'utente dopo l'acquisto
  const navigate = useNavigate()

  // Access authentication info (token) from AuthContext
  // Accesso alle informazioni di autenticazione (token) dal contesto AuthContext
  const { auth } = useContext(AuthContext)

  // Access location object to get passed state data (showtime and selectedSeats)
  // Accesso all'oggetto location per ottenere i dati passati nello stato (showtime e posti selezionati)
  const location = useLocation()

  // Destructure showtime data passed from previous page
  // Destruttura i dati dello showtime passati dalla pagina precedente
  const showtime = location.state.showtime

  // Destructure selected seats array, defaulting to empty array if none passed
  // Destruttura l'array dei posti selezionati, di default array vuoto se non passato
  const selectedSeats = location.state.selectedSeats || []

  // Local state to track if the purchase is being processed
  // Stato locale per tracciare se l'acquisto è in corso
  const [isPurchasing, setIsPurchasing] = useState(false)

  // Function to handle the purchase request when user confirms
  // Funzione che gestisce la richiesta di acquisto quando l'utente conferma
  const onPurchase = async () => {
    setIsPurchasing(true) // Start loading state

    try {
      // Send POST request to backend to book selected seats for the showtime
      // Invio richiesta POST al backend per prenotare i posti selezionati per lo showtime
      const response = await axios.post(
        `/showtime/${showtime._id}`,
        { seats: selectedSeats },
        {
          headers: {
            Authorization: `Bearer ${auth.token}` // Include JWT token in headers
          }
        }
      )

      // Optionally log response (commented out)
      // console.log(response.data)

      // Navigate to "dip" page (whatever that stands for in your app)
      // Reindirizza alla pagina "dip" (a seconda di cosa rappresenta nella tua app)
      navigate('/dip')

      // Show success notification
      // Mostra notifica di successo
      toast.success('Acquisto effettuato con successo!', {
        position: 'top-center',
        autoClose: 3000
      })
    } catch (error) {
      // Log error for debugging
      console.error(error)

      // Show error notification
      // Mostra notifica di errore
      toast.error('Errore durante l\'acquisto, riprova.', {
        position: 'top-center',
        autoClose: 3000
      })
    } finally {
      // Stop loading state regardless of outcome
      setIsPurchasing(false)
    }
  }

  return (
    <>
      {/* Navbar component at the top */}
      {/* Componente Navbar in alto */}
      <Navbar />

      {/* Main content container */}
      {/* Contenitore principale */}
      <div className="mt-6 flex max-w-4xl flex-col items-center justify-center gap-4 rounded-md bg-[#213D72] p-4 shadow-lg md:flex-row md:justify-between">
        {/* Showtime details display */}
        {/* Visualizzazione dettagli dello showtime */}
        <ShowtimeDetails showtime={showtime} />

        {/* Purchase info and confirmation section */}
        {/* Sezione informazioni acquisto e conferma */}
        <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-md">
          {/* Tickets icon */}
          {/* Icona biglietti */}
          <TicketIcon className="h-12 w-12 text-[#213D72]" />

          {/* Display selected seats count */}
          {/* Mostra numero posti selezionati */}
          <p className="font-semibold">Posti selezionati: {selectedSeats.length}</p>

          {/* Purchase button */}
          {/* Pulsante per confermare l'acquisto */}
          <button
            disabled={isPurchasing}
            onClick={onPurchase}
            className="rounded bg-[#213D72] px-6 py-2 font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-gray-500"
          >
            {/* Button text changes based on loading state */}
            {/* Testo pulsante cambia in base allo stato di caricamento */}
            {isPurchasing ? 'Acquistando...' : 'Conferma Acquisto'}
          </button>
        </div>
      </div>
    </>
  )
}

export default Purchase
