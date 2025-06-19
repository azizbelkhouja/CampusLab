import axios from 'axios'
import { useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import DipLists from './DipLists'
import DateSelector from './DateSelector'
import Loading from './Loading'
import AulaShort from './AulaShort'

// Component that displays the list of Aulas (classrooms) based on the selected Seminario and Dip
// Componente che mostra la lista delle Aule in base al Seminario e Dip selezionati
const AulaListsBySeminario = ({
  seminari,
  selectedSeminarioIndex,
  setSelectedSeminarioIndex,
  auth
}) => {
  // Initialize selected date from sessionStorage or use current date
  // Inizializza la data selezionata da sessionStorage o usa la data corrente
  const [selectedDate, setSelectedDate] = useState(
    sessionStorage.getItem('selectedDate')
      ? new Date(sessionStorage.getItem('selectedDate'))
      : new Date()
  )

  // State to store list of aulas
  // Stato per memorizzare la lista delle aule
  const [aulas, setAulas] = useState([])

  // Flag to indicate when aulas have been fetched
  // Flag per indicare quando le aule sono state caricate
  const [isFetchingAulasDone, setIsFetchingAulasDone] = useState(false)

  // Index of selected department (dip)
  // Indice del Dipartimento selezionato
  const [selectedDipIndex, setSelectedDipIndex] = useState(
    parseInt(sessionStorage.getItem('selectedDipIndex'))
  )

  // List of departments (dips)
  // Lista dei Dipartimenti
  const [dips, setDips] = useState([])

  // Flag to indicate loading of dips
  // Flag per indicare il caricamento dei Dipartimenti
  const [isFetchingDips, setIsFetchingDips] = useState(true)

  // Fetch Dipartimenti from API
  // Recupera i Dipartimenti dall’API
  const fetchDips = async () => {
    try {
      setIsFetchingDips(true)

      let response

      // Admins can fetch unreleased dips
      // Gli admin possono recuperare Dip non ancora pubblicati
      if (auth.role === 'admin') {
        response = await axios.get('/dip/unreleased', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
      } else {
        response = await axios.get('/dip')
      }

      setDips(response.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsFetchingDips(false)
    }
  }

  // Fetch Aulas based on selected seminario and date
  // Recupera le Aule in base al Seminario e alla data selezionata
  const fetchAulas = async () => {
    try {
      setIsFetchingAulasDone(false)

      let response
      const seminarioId = seminari[selectedSeminarioIndex]?._id
      const dateISO = selectedDate.toISOString()
      const timezoneOffset = new Date().getTimezoneOffset()

      if (auth.role === 'admin') {
        // Admins can fetch unreleased aulas
        // Gli admin possono recuperare le Aule non ancora pubblicate
        response = await axios.get(
          `/aula/seminario/unreleased/${seminarioId}/${dateISO}/${timezoneOffset}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          }
        )
      } else {
        response = await axios.get(
          `/aula/seminario/${seminarioId}/${dateISO}/${timezoneOffset}`
        )
      }

      // Sort aulas by dip name, then by aula number
      // Ordina le Aule per nome del Dip, poi per numero dell’aula
      const sortedAulas = response.data.data.sort((a, b) => {
        if (a.dip.name > b.dip.name) return 1
        if (a.dip.name === b.dip.name && a.number > b.number) return 1
        return -1
      })

      setAulas(sortedAulas)
      setIsFetchingAulasDone(true)
    } catch (error) {
      console.error(error)
    }
  }

  // Fetch dips on initial component load
  // Carica i Dip al caricamento iniziale del componente
  useEffect(() => {
    fetchDips()
  }, [])

  // Refetch aulas when seminario or date changes
  // Ricarica le Aule quando cambia il seminario o la data
  useEffect(() => {
    fetchAulas()
  }, [selectedSeminarioIndex, selectedDate])

  // Filter aulas by selected Dip
  // Filtra le Aule in base al Dip selezionato
  const filteredAulas = aulas.filter((aula) => {
    if (selectedDipIndex === 0 || !!selectedDipIndex) {
      return aula.dip?.name === dips[selectedDipIndex]?.name
    }
    return true
  })

  return (
    <>
      {/* Dip selector / Selettore dei Dipartimenti */}
      <DipLists
        dips={dips}
        selectedDipIndex={selectedDipIndex}
        setSelectedDipIndex={setSelectedDipIndex}
        fetchDips={fetchDips}
        auth={auth}
        isFetchingDips={isFetchingDips}
      />

      {/* Main content / Contenuto principale */}
      <div className="mx-4 h-fit border text-gray-900 sm:mx-8">
        <div className="flex flex-col gap-6 p-4 sm:p-6">
          {/* Date selector / Selettore della data */}
          <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

          {/* Selected Seminario Info / Info del Seminario selezionato */}
          <div className="flex flex-col gap-4 border py-4">
            <div className="flex items-center">
              <img
                src={seminari[selectedSeminarioIndex]?.img}
                className="w-32 px-4 drop-shadow-md"
                alt="seminario"
              />
              <div>
                <h4 className="text-2xl font-semibold">
                  {seminari[selectedSeminarioIndex]?.name}
                </h4>
                <p className="text-md font-medium">
                  length: {seminari[selectedSeminarioIndex]?.length || '-'} min
                </p>
              </div>
            </div>
          </div>

          {/* Aulas list / Lista delle Aule */}
          {isFetchingAulasDone ? (
            <div className="flex flex-col">
              {filteredAulas.map((aula, index) => {
                const currentDipName = aula.dip?.name
                const prevDipName = filteredAulas[index - 1]?.dip?.name
                const nextDipName = filteredAulas[index + 1]?.dip?.name

                return (
                  <div
                    key={aula._id}
                    className={`flex flex-col ${
                      index !== 0 && prevDipName !== currentDipName ? 'mt-6' : ''
                    }`}
                  >
                    {/* Dip section header / Intestazione per ogni Dip */}
                    {prevDipName !== currentDipName && (
                      <div className="bg-black px-2 py-1.5 text-center text-2xl font-semibold text-white sm:py-2">
                        <h2>{currentDipName}</h2>
                      </div>
                    )}

                    {/* Aula component / Componente per una singola Aula */}
                    <AulaShort
                      aulaId={aula._id}
                      seminari={seminari}
                      selectedDate={selectedDate}
                      filterSeminario={seminari[selectedSeminarioIndex]}
                      rounded={nextDipName !== currentDipName}
                    />
                  </div>
                )
              })}

              {/* No aulas available / Nessuna Aula disponibile */}
              {filteredAulas.length === 0 && (
                <p className="text-center text-xl font-semibold text-gray-700">
                  Nessun Seminario previsto per questa aula
                </p>
              )}
            </div>
          ) : (
            // Loading spinner / Indicatore di caricamento
            <Loading />
          )}
        </div>
      </div>
    </>
  )
}

export default AulaListsBySeminario
