import axios from 'axios'
import { useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import DipLists from './DipLists'
import DateSelector from './DateSelector'
import Loading from './Loading'
import AulaShort from './AulaShort'

const AulaListsBySeminario = ({
  seminari,
  selectedSeminarioIndex,
  setSelectedSeminarioIndex,
  auth
}) => {

  const [selectedDate, setSelectedDate] = useState(
    sessionStorage.getItem('selectedDate')
      ? new Date(sessionStorage.getItem('selectedDate'))
      : new Date()
  )

  const [aulas, setAulas] = useState([])
  const [isFetchingAulasDone, setIsFetchingAulasDone] = useState(false)
  const [selectedDipIndex, setSelectedDipIndex] = useState(parseInt(sessionStorage.getItem('selectedDipIndex')))
  const [dips, setDips] = useState([])
  const [isFetchingDips, setIsFetchingDips] = useState(true)

  const fetchDips = async () => {
    try {
      setIsFetchingDips(true)
      let response
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

  const fetchAulas = async () => {
    try {
      setIsFetchingAulasDone(false)

      let response
      const seminarioId = seminari[selectedSeminarioIndex]?._id
      const dateISO = selectedDate.toISOString()
      const timezoneOffset = new Date().getTimezoneOffset()

      if (auth.role === 'admin') {
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

  useEffect(() => {
    fetchDips()
  }, [])

  useEffect(() => {
    fetchAulas()
  }, [selectedSeminarioIndex, selectedDate])

  const filteredAulas = aulas.filter((aula) => {
    if (selectedDipIndex === 0 || !!selectedDipIndex) {
      return aula.dip?.name === dips[selectedDipIndex]?.name
    }
    return true
  })

  return (
    <>
      <DipLists
        dips={dips}
        selectedDipIndex={selectedDipIndex}
        setSelectedDipIndex={setSelectedDipIndex}
        fetchDips={fetchDips}
        auth={auth}
        isFetchingDips={isFetchingDips}
      />

      <div className="mx-4 h-fit border text-gray-900 sm:mx-8">
        <div className="flex flex-col gap-6 p-4 sm:p-6">

          <DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

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
                  Lunghezza: {seminari[selectedSeminarioIndex]?.length || '-'} min
                </p>
              </div>
            </div>
          </div>

          {isFetchingAulasDone ? (
            <div className="flex flex-col">
              {filteredAulas.map((aula, index) => {
                const currentDipName = aula.dip?.name
                const prevDipName = filteredAulas[index - 1]?.dip?.name
                const nextDipName = filteredAulas[index + 1]?.dip?.name

                return (
                  <div
                    key={aula._id}
                    className={`border border-black flex flex-col ${
                      index !== 0 && prevDipName !== currentDipName ? 'mt-6' : ''
                    }`}
                  >
                    {prevDipName !== currentDipName && (
                      <div className="bg-gray-200 border-b border-black px-2 py-1.5 text-center text-2xl font-semibold text-black sm:py-2">
                        <h2>{currentDipName}</h2>
                      </div>
                    )}

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

              {filteredAulas.length === 0 && (
                <p className="text-center text-xl font-semibold text-gray-700">
                  Nessun Seminario previsto per questa aula
                </p>
              )}
            </div>
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </>
  )
}

export default AulaListsBySeminario
