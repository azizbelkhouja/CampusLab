import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import ShowtimeDetails from '../components/ShowtimeDetails'
import { AuthContext } from '../context/AuthContext'

// Tickets component - Displays all tickets/passes booked by the current user
// Componente Tickets - Mostra tutti i biglietti/passi prenotati dall'utente corrente
const Tickets = () => {
  // Authentication context for user token
  // Contesto di autenticazione per il token utente
  const { auth } = useContext(AuthContext)
  
  // State for tickets data and loading status
  // Stato per i dati dei biglietti e stato di caricamento
  const [tickets, setTickets] = useState([])
  const [isFetchingticketsDone, setIsFetchingticketsDone] = useState(false)

  // Fetch tickets data from API
  // Recupera i dati dei biglietti dall'API
  const fetchTickets = async () => {
    try {
      setIsFetchingticketsDone(false)
      const response = await axios.get('/auth/tickets', {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      })
      
      // Sort tickets by showtime date (earliest first)
      // Ordina i biglietti per data dello spettacolo (prima i più recenti)
      setTickets(
        response.data.data.tickets?.sort((a, b) => {
          if (a.showtime.showtime > b.showtime.showtime) {
            return 1
          }
          return -1
        })
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsFetchingticketsDone(true)
    }
  }

  // Fetch data on component mount
  // Recupera i dati al montaggio del componente
  useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <div className="flex min-h-screen flex-col gap-4 sm:gap-8">
      {/* Navigation bar */}
      {/* Barra di navigazione */}
      <Navbar />
      
      {/* Main content container */}
      {/* Contenitore principale del contenuto */}
      <div className="mx-4 flex h-fit flex-col gap-4 p-4 sm:mx-8 sm:p-6">
        {/* Page title */}
        {/* Titolo della pagina */}
        <h2 className="text-3xl font-bold text-gray-900">I miei Passi</h2>
        
        {/* Conditional rendering based on loading state */}
        {/* Renderizzazione condizionale basata sullo stato di caricamento */}
        {isFetchingticketsDone ? (
          <>
            {/* Show message if no tickets */}
            {/* Mostra messaggio se non ci sono biglietti */}
            {tickets.length === 0 ? (
              <p className="text-center">Non hai ancora prenotato posti</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 min-[1920px]:grid-cols-3">
                {/* Map through tickets and display each one */}
                {/* Scorre i biglietti e mostra ognuno */}
                {tickets.map((ticket, index) => {
                  return (
                    <div className="flex flex-col" key={index}>
                      <ShowtimeDetails showtime={ticket.showtime} />
                      
                      {/* Ticket details (seats information) */}
                      {/* Dettagli biglietto (informazioni sui posti) */}
                      <div className="flex h-full flex-col justify-between border text-center text-lg drop-shadow-lg md:flex-row">
                        <div className="flex h-full flex-col items-center gap-x-4 px-4 py-2 md:flex-row">
                          <p className="whitespace-nowrap font-semibold">Posti : </p>
                          <p className="text-left">
                            {/* Display seat numbers (e.g., A1, A2, B3) */}
                            {/* Mostra i numeri dei posti (es. A1, A2, B3) */}
                            {ticket.seats.map((seat) => seat.row + seat.number).join(', ')}
                          </p>
                          {/* Display total seats count */}
                          {/* Mostra il conteggio totale dei posti */}
                          <p className="whitespace-nowrap">({ticket.seats.length} posti)</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  )
}

export default Tickets