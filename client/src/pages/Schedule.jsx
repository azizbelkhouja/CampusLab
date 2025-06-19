import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Select from 'react-tailwindcss-select'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DipLists from '../components/DipLists'
import DateSelector from '../components/DateSelector'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import ScheduleTable from '../components/ScheduleTable'
import { AuthContext } from '../context/AuthContext'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

const Schedule = () => {
  // Access auth data from context (e.g., token, user role)
  // Accedi ai dati di autenticazione dal contesto (es. token, ruolo utente)
  const { auth } = useContext(AuthContext)

  // Initialize react-hook-form utilities for form handling
  // Inizializza le utilità di react-hook-form per la gestione del form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm()

  // State for selected date, retrieved from sessionStorage or defaults to today
  // Stato per la data selezionata, recuperata da sessionStorage o di default oggi
  const [selectedDate, setSelectedDate] = useState(
    (sessionStorage.getItem('selectedDate') && new Date(sessionStorage.getItem('selectedDate'))) || new Date()
  )

  // State for the selected "Dip" index, from sessionStorage or default 0
  // Stato per l'indice del "Dip" selezionato, da sessionStorage o di default 0
  const [selectedDipIndex, setSelectedDipIndex] = useState(
    parseInt(sessionStorage.getItem('selectedDipIndex')) || 0
  )

  // State to hold the list of dips fetched from the backend
  // Stato per contenere la lista dei "dip" recuperati dal backend
  const [dips, setDips] = useState([])

  // Boolean state to indicate if dips are being fetched
  // Stato booleano per indicare se i "dip" sono in fase di caricamento
  const [isFetchingDips, setIsFetchingDips] = useState(true)

  // State to hold seminars fetched from backend
  // Stato per contenere i seminari recuperati dal backend
  const [seminari, setSeminari] = useState([])

  // Boolean state indicating if a showtime is being added (to disable UI)
  // Stato booleano per indicare se si sta aggiungendo un orario (per disabilitare UI)
  const [isAddingShowtime, SetIsAddingShowtime] = useState(false)

  // State for the currently selected seminar in the select dropdown
  // Stato per il seminario attualmente selezionato nel dropdown
  const [selectedSeminario, setSelectedSeminario] = useState(null)

  // Function to fetch dips from backend based on user role
  // Funzione per recuperare i "dip" dal backend in base al ruolo utente
  const fetchDips = async () => {
    try {
      setIsFetchingDips(true)
      let response
      if (auth.role === 'admin') {
        // If admin, fetch unreleased dips with auth token in headers
        // Se admin, recupera "dip" non rilasciati con token di autenticazione nell'header
        response = await axios.get('/dip/unreleased', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
      } else {
        // For normal users, fetch all dips without token
        // Per utenti normali, recupera tutti i "dip" senza token
        response = await axios.get('/dip')
      }
      // Set dips state with the data from the response
      // Imposta lo stato "dips" con i dati della risposta
      setDips(response.data.data)
    } catch (error) {
      // Log error if fetching dips fails
      // Log dell'errore se il recupero dei "dip" fallisce
      console.error(error)
    } finally {
      // End loading state after fetch attempt
      // Termina lo stato di caricamento dopo il tentativo di recupero
      setIsFetchingDips(false)
    }
  }

  // Fetch dips once on component mount
  // Recupera i "dip" una volta al montaggio del componente
  useEffect(() => {
    fetchDips()
  }, [])

  // Function to fetch seminars from backend
  // Funzione per recuperare i seminari dal backend
  const fetchSeminari = async () => {
    try {
      const response = await axios.get('/seminario')
      setSeminari(response.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  // Fetch seminars once on component mount
  // Recupera i seminari una volta al montaggio del componente
  useEffect(() => {
    fetchSeminari()
  }, [])

  // Initialize some form values on mount
  // Inizializza alcuni valori del form al montaggio
  useEffect(() => {
    setValue('autoIncrease', true)
    setValue('rounding5', true)
    setValue('gap', '00:10')
  }, [])

  // Handle form submission to add a new showtime
  // Gestisce la sottomissione del form per aggiungere un nuovo orario
  const onAddShowtime = async (data) => {
    try {
      SetIsAddingShowtime(true)
      if (!data.seminario) {
        // If no seminar selected, show error toast
        // Se nessun seminario selezionato, mostra toast di errore
        toast.error('Seleziona un seminario', {
          position: 'top-center',
          autoClose: 2000,
          pauseOnHover: false
        })
        return
      }
      // Create a Date object for the selected showtime
      // Crea un oggetto Date per l'orario selezionato
      let showtime = new Date(selectedDate)
      const [hours, minutes] = data.showtime.split(':')
      showtime.setHours(hours, minutes, 0)

      // POST new showtime data to backend with auth token
      // Invia i dati del nuovo orario al backend con token di autenticazione
      const response = await axios.post(
        '/showtime',
        { seminario: data.seminario, showtime, aula: data.aula, repeat: data.repeat, isRelease: data.isRelease },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        }
      )

      // Refresh dips list after adding showtime
      // Aggiorna la lista dei "dip" dopo aver aggiunto l'orario
      fetchDips()

      if (data.autoIncrease) {
        // If auto-increase enabled, calculate next showtime based on seminar length and gap
        // Se auto-increase abilitato, calcola il prossimo orario in base alla durata del seminario e all'intervallo
        const seminarioLength = seminari.find((seminario) => seminario._id === data.seminario).length
        const [GapHours, GapMinutes] = data.gap.split(':').map(Number)
        const nextShowtime = new Date(showtime.getTime() + (seminarioLength + GapHours * 60 + GapMinutes) * 60000)

        if (data.rounding5 || data.rounding10) {
          // Round time to next 5 or 10 minutes if enabled
          // Arrotonda il tempo ai successivi 5 o 10 minuti se abilitato
          const totalMinutes = nextShowtime.getHours() * 60 + nextShowtime.getMinutes()
          const roundedMinutes = data.rounding5
            ? Math.ceil(totalMinutes / 5) * 5
            : Math.ceil(totalMinutes / 10) * 10
          let roundedHours = Math.floor(roundedMinutes / 60)
          const remainderMinutes = roundedMinutes % 60
          if (roundedHours === 24) {
            nextShowtime.setDate(nextShowtime.getDate() + 1)
            roundedHours = 0
          }
          setValue(
            'showtime',
            `${String(roundedHours).padStart(2, '0')}:${String(remainderMinutes).padStart(2, '0')}`
          )
        } else {
          // Set next showtime without rounding
          // Imposta il prossimo orario senza arrotondamento
          setValue(
            'showtime',
            `${String(nextShowtime.getHours()).padStart(2, '0')}:${String(
              nextShowtime.getMinutes()
            ).padStart(2, '0')}`
          )
        }
        if (data.autoIncreaseDate) {
          // If autoIncreaseDate is checked, update the selected date state and sessionStorage
          // Se autoIncreaseDate è selezionato, aggiorna lo stato della data selezionata e sessionStorage
          setSelectedDate(nextShowtime)
          sessionStorage.setItem('selectedDate', nextShowtime)
        }
      }

      // Show success toast after adding showtime
      // Mostra toast di successo dopo aver aggiunto l'orario
      toast.success("Aggiunta dell'orario riuscita!", {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false
      })
    } catch (error) {
      // Log error and show error toast if adding showtime fails
      // Log dell'errore e mostra toast di errore se l'aggiunta dell'orario fallisce
      console.error(error)
      toast.error("Errore nell'aggiunta dell'orario", {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false
      })
    } finally {
      // Reset loading state after attempt
      // Resetta lo stato di caricamento dopo il tentativo
      SetIsAddingShowtime(false)
    }
  }

  // Handle change when selecting a different dip from dropdown
  // Gestisce il cambiamento quando si seleziona un "dip" diverso dal dropdown
  const onDipSelectChange = (selected) => {
    setSelectedDipIndex(selected.value)
    sessionStorage.setItem('selectedDipIndex', selected.value)
  }

  // Handle change when selecting a new date from the calendar
  // Gestisce il cambiamento quando si seleziona una nuova data dal calendario
  const onDateChange = (date) => {
    setSelectedDate(date)
    sessionStorage.setItem('selectedDate', date)
  }

  // JSX for the component rendering the schedule form and tables
  // JSX per il rendering del componente con il form di programmazione e le tabelle
  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-7xl py-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
          {/* Header with title */}
          {/* Intestazione con titolo */}
          <h1 className="mb-4 text-2xl font-bold text-gray-800">Prenota i tuoi posti</h1>

          {/* Date selector component to pick booking date */}
          {/* Componente per selezionare la data della prenotazione */}
          <DateSelector selectedDate={selectedDate} onChange={onDateChange} />

          {/* Dropdown to select a dip */}
          {/* Dropdown per selezionare un "dip" */}
          <Select
            options={dips.map((dip, index) => ({ value: index, label: dip.title }))}
            value={dips[selectedDipIndex] ? { value: selectedDipIndex, label: dips[selectedDipIndex].title } : null}
            onChange={onDipSelectChange}
            placeholder="Seleziona un Dip"
            isLoading={isFetchingDips}
            isSearchable
          />

          {/* Display schedule table for the selected dip and date */}
          {/* Mostra la tabella degli orari per il dip e la data selezionati */}
          {dips.length > 0 && (
            <ScheduleTable dip={dips[selectedDipIndex]} date={selectedDate} seminari={seminari} />
          )}

          {/* Form to add new showtime */}
          {/* Form per aggiungere un nuovo orario */}
          <form className="mt-6" onSubmit={handleSubmit(onAddShowtime)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Select seminar dropdown */}
              {/* Dropdown per selezionare il seminario */}
              <select
                {...register('seminario', { required: true })}
                className="rounded border border-gray-300 px-3 py-2"
                onChange={(e) => setSelectedSeminario(e.target.value)}
                value={selectedSeminario || ''}
              >
                <option value="">Seleziona seminario</option>
                {seminari.map((seminario) => (
                  <option key={seminario._id} value={seminario._id}>
                    {seminario.title}
                  </option>
                ))}
              </select>
              {errors.seminario && <span className="text-sm text-red-500">Seminario è obbligatorio</span>}

              {/* Showtime input field */}
              {/* Campo input per l'orario */}
              <input
                type="time"
                {...register('showtime', { required: true })}
                className="rounded border border-gray-300 px-3 py-2"
              />
              {errors.showtime && <span className="text-sm text-red-500">Orario è obbligatorio</span>}

              {/* Aula input */}
              {/* Campo input per l'aula */}
              <input
                type="text"
                {...register('aula')}
                className="rounded border border-gray-300 px-3 py-2"
                placeholder="Aula (opzionale)"
              />

              {/* Checkbox to auto increase time */}
              {/* Checkbox per incremento automatico dell'orario */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('autoIncrease')}
                  defaultChecked
                  className="rounded border border-gray-300"
                />
                <span>Auto-incremento orario</span>
              </label>

              {/* Checkbox to round time to nearest 5 minutes */}
              {/* Checkbox per arrotondare il tempo ai 5 minuti più vicini */}
              <label className="flex items-center space-x-2">
                <input type="checkbox" {...register('rounding5')} defaultChecked className="rounded border border-gray-300" />
                <span>Arrotonda a 5 minuti</span>
              </label>

              {/* Checkbox to round time to nearest 10 minutes */}
              {/* Checkbox per arrotondare il tempo ai 10 minuti più vicini */}
              <label className="flex items-center space-x-2">
                <input type="checkbox" {...register('rounding10')} className="rounded border border-gray-300" />
                <span>Arrotonda a 10 minuti</span>
              </label>

              {/* Gap input (time between showtimes) */}
              {/* Campo input per l'intervallo tra orari */}
              <input
                type="time"
                {...register('gap')}
                defaultValue="00:10"
                className="rounded border border-gray-300 px-3 py-2"
              />

              {/* Checkbox to auto increase date on showtime increment */}
              {/* Checkbox per incrementare automaticamente la data */}
              <label className="flex items-center space-x-2">
                <input type="checkbox" {...register('autoIncreaseDate')} className="rounded border border-gray-300" />
                <span>Incrementa data automaticamente</span>
              </label>

              {/* Checkbox to set if the showtime is released */}
              {/* Checkbox per indicare se l'orario è rilasciato */}
              <label className="flex items-center space-x-2">
                <input type="checkbox" {...register('isRelease')} className="rounded border border-gray-300" />
                <span>Rilascia orario</span>
              </label>
            </div>

            {/* Submit button to add showtime */}
            {/* Pulsante per aggiungere l'orario */}
            <button
              type="submit"
              disabled={isAddingShowtime}
              className="mt-4 w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isAddingShowtime ? 'Elaborazione...' : 'Aggiungi Orario'}
            </button>
          </form>

          {/* Display dip lists component for admin or normal users */}
          {/* Visualizza il componente delle liste "dip" per admin o utenti normali */}
          <DipLists dips={dips} />
        </div>
      </div>
    </div>
  )
}

export default Schedule