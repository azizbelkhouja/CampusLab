import {
  ChevronDownIcon,
  ChevronUpDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  InformationCircleIcon,
  MapIcon
} from '@heroicons/react/24/outline'
import { ArrowDownIcon, TrashIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { Fragment, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Select from 'react-tailwindcss-select'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import { AuthContext } from '../context/AuthContext'

// Main Search component for finding and managing seminars
// Componente principale per la ricerca e gestione dei seminari
const Search = () => {
  // Authentication context for user role and token
  // Contesto di autenticazione per ruolo utente e token
  const { auth } = useContext(AuthContext)
  
  // State for UI controls and filters
  // Stato per controlli UI e filtri
  const [isOpenFilter, setIsOpenFilter] = useState(true)
  const [isDeletingCheckedShowtimes, setIsDeletingCheckedShowtimes] = useState(false)
  const [deletedCheckedShowtimes, setDeletedCheckedShowtimes] = useState(0)
  const [isReleasingCheckedShowtimes, setIsReleasingCheckedShowtimes] = useState(false)
  const [releasedCheckedShowtimes, setReleasedCheckedShowtimes] = useState(0)
  const [isUnreleasingCheckedShowtimes, setIsUnreleasingCheckedShowtimes] = useState(false)
  const [unreleasedCheckedShowtimes, setUnreleasedCheckedShowtimes] = useState(0)
  const [isFetchingShowtimesDone, setIsFetchingShowtimesDone] = useState(false)

  // State for seminar data and filters
  // Stato per dati seminari e filtri
  const [showtimes, setShowtimes] = useState([])
  const [filterDip, setFilterDip] = useState(null)
  const [filterAula, setFilterAula] = useState(null)
  const [filterSeminario, setFilterSeminario] = useState(null)
  const [filterDate, setFilterDate] = useState(null)
  const [filterDateFrom, setFilterDateFrom] = useState(null)
  const [filterDateTo, setFilterDateTo] = useState(null)
  const [filterPastDate, setFilterPastDate] = useState(null)
  const [filterToday, setFilterToday] = useState(null)
  const [filterFutureDate, setFilterFutureDate] = useState(null)
  const [filterTime, setFilterTime] = useState(null)
  const [filterTimeFrom, setFilterTimeFrom] = useState(null)
  const [filterTimeTo, setFilterTimeTo] = useState(null)
  const [filterReleaseTrue, setFilterReleaseTrue] = useState(null)
  const [filterReleaseFalse, setFilterReleaseFalse] = useState(null)
  const [isCheckAll, setIsCheckAll] = useState(false)
  const [checkedShowtimes, setCheckedShowtimes] = useState([])

  // Sorting states for table columns
  // Stati per l'ordinamento delle colonne della tabella
  const [sortDip, setSortDip] = useState(0) // -1: descending, 0 no sort, 1 ascending
  const [sortAula, setSortAula] = useState(0)
  const [sortSeminario, setSortSeminario] = useState(0)
  const [sortDate, setSortDate] = useState(0)
  const [sortTime, setSortTime] = useState(0)
  const [sortBooked, setSortBooked] = useState(0)
  const [sortRelease, setSortRelease] = useState(0)

  // Reset all sorting states
  // Resetta tutti gli stati di ordinamento
  const resetSort = () => {
    setSortDip(0)
    setSortAula(0)
    setSortSeminario(0)
    setSortDate(0)
    setSortTime(0)
    setSortBooked(0)
    setSortRelease(0)
  }

  // Filter and sort seminar data based on current filters and sorting
  // Filtra e ordina i dati dei seminari in base ai filtri e ordinamenti correnti
  const filteredShowtimes = showtimes
    .filter((showtime) => {
      const showtimeDate = new Date(showtime.showtime)
      const year = showtimeDate.getFullYear()
      const month = showtimeDate.toLocaleString('default', { month: 'short' })
      const day = showtimeDate.getDate().toString().padStart(2, '0')
      const formattedDate = `${day} ${month} ${year}`
      const hours = showtimeDate.getHours().toString().padStart(2, '0')
      const minutes = showtimeDate.getMinutes().toString().padStart(2, '0')
      const formattedTime = `${hours} : ${minutes}`
      return (
        (!filterDip || filterDip.map((dip) => dip.value).includes(showtime.aula.dip._id)) &&
        (!filterAula || filterAula.map((aula) => aula.value).includes(showtime.aula.number)) &&
        (!filterSeminario || filterSeminario.map((seminario) => seminario.value).includes(showtime.seminario._id)) &&
        (!filterDate || filterDate.map((showtime) => showtime.value).includes(formattedDate)) &&
        (!filterDateFrom || new Date(filterDateFrom.value) <= new Date(formattedDate)) &&
        (!filterDateTo || new Date(filterDateTo.value) >= new Date(formattedDate)) &&
        (!filterPastDate ||
          new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) >
            new Date(formattedDate)) &&
        (!filterToday ||
          (new Date().getFullYear() === new Date(formattedDate).getFullYear() &&
            new Date().getMonth() === new Date(formattedDate).getMonth() &&
            new Date().getDate() === new Date(formattedDate).getDate())) &&
        (!filterFutureDate ||
          new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) <
            new Date(formattedDate)) &&
        (!filterTime || filterTime.map((showtime) => showtime.value).includes(formattedTime)) &&
        (!filterTimeFrom || filterTimeFrom.value <= formattedTime) &&
        (!filterTimeTo || filterTimeTo.value >= formattedTime) &&
        (!filterReleaseTrue || showtime.isRelease) &&
        (!filterReleaseFalse || !showtime.isRelease)
      )
    })
    .sort((a, b) => {
      if (sortDip) {
        return sortDip * a.aula.dip.name.localeCompare(b.aula.dip.name)
      }
      if (sortAula) {
        return sortAula * (a.aula.number - b.aula.number)
      }
      if (sortSeminario) {
        return sortSeminario * a.seminario.name.localeCompare(b.seminario.name)
      }
      if (sortDate) {
        return sortDate * (new Date(a.showtime) - new Date(b.showtime))
      }
      if (sortTime) {
        return (
          sortTime *
          (new Date(a.showtime)
            .getHours()
            .toString()
            .padStart(2, '0')
            .concat(new Date(a.showtime).getMinutes().toString().padStart(2, '0')) -
            new Date(b.showtime)
              .getHours()
              .toString()
              .padStart(2, '0')
              .concat(new Date(b.showtime).getMinutes().toString().padStart(2, '0')))
        )
      }
      if (sortBooked) {
        return sortBooked * (a.seats.length - b.seats.length)
      }
      if (sortRelease) {
        return sortRelease * (a.isRelease - b.isRelease)
      }
    })

  // Fetch seminar data from API
  // Recupera i dati dei seminari dall'API
  const fetchShowtimes = async (data) => {
    try {
      setIsFetchingShowtimesDone(false)
      let response
      if (auth.role === 'admin') {
        response = await axios.get('/showtime/unreleased', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
      } else {
        response = await axios.get('/showtime')
      }
      setShowtimes(response.data.data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsFetchingShowtimesDone(true)
    }
  }

  // Fetch data on component mount
  // Recupera i dati al montaggio del componente
  useEffect(() => {
    fetchShowtimes()
  }, [])

  // Handle deletion of selected seminars
  // Gestisce l'eliminazione dei seminari selezionati
  const handleDeleteCheckedShowtimes = () => {
    const confirmed = window.confirm(
      `Vuoi eliminare ${checkedShowtimes.length} seminari selezionati, inclusi i relativi biglietti?`
    )
    if (confirmed) {
      onDeleteCheckedShowtimes()
    }
  }

  // Perform deletion of selected seminars
  // Esegue l'eliminazione dei seminari selezionati
  const onDeleteCheckedShowtimes = async () => {
    setIsDeletingCheckedShowtimes(true)
    setDeletedCheckedShowtimes(0)
    let successCounter = 0
    let errorCounter = 0
    const deletePromises = checkedShowtimes.map(async (checkedShowtime) => {
      try {
        const response = await axios.delete(`/showtime/${checkedShowtime}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
        setDeletedCheckedShowtimes((prev) => prev + 1)
        successCounter++
        return response
      } catch (error) {
        console.error(error)
        errorCounter++
      }
    })
    await Promise.all(deletePromises)
    toast.success(`Delete ${successCounter} checked showtimes successful!`, {
      position: 'top-center',
      autoClose: 2000,
      pauseOnHover: false
    })
    errorCounter > 0 &&
      toast.error(`Error deleting ${errorCounter} checked showtime`, {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false
      })
    resetState()
    fetchShowtimes()
    setIsDeletingCheckedShowtimes(false)
  }

  // Handle releasing selected seminars
  // Gestisce la pubblicazione dei seminari selezionati
  const handleReleaseCheckedShowtimes = () => {
    const confirmed = window.confirm(`Do you want to release ${checkedShowtimes.length} checked showtimes?`)
    if (confirmed) {
      onReleaseCheckedShowtimes()
    }
  }

  // Perform releasing of selected seminars
  // Esegue la pubblicazione dei seminari selezionati
  const onReleaseCheckedShowtimes = async () => {
    setIsReleasingCheckedShowtimes(true)
    setReleasedCheckedShowtimes(0)
    let successCounter = 0
    let errorCounter = 0
    const releasePromises = checkedShowtimes.map(async (checkedShowtime) => {
      try {
        const response = await axios.put(
          `/showtime/${checkedShowtime}`,
          { isRelease: true },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          }
        )
        setReleasedCheckedShowtimes((prev) => prev + 1)
        successCounter++
        return response
      } catch (error) {
        console.error(error)
        errorCounter++
      }
    })
    await Promise.all(releasePromises)
    toast.success(`Release ${successCounter} checked showtimes successful!`, {
      position: 'top-center',
      autoClose: 2000,
      pauseOnHover: false
    })
    errorCounter > 0 &&
      toast.error(`Error releasing ${errorCounter} checked showtime`, {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false
      })
    resetState()
    fetchShowtimes()
    setIsReleasingCheckedShowtimes(false)
  }

  // Handle unreleasing selected seminars
  // Gestisce la rimozione dalla pubblicazione dei seminari selezionati
  const handleUnreleasedCheckedShowtimes = () => {
    const confirmed = window.confirm(`Do you want to unreleased ${checkedShowtimes.length} checked showtimes?`)
    if (confirmed) {
      onUnreleasedCheckedShowtimes()
    }
  }

  // Perform unreleasing of selected seminars
  // Esegue la rimozione dalla pubblicazione dei seminari selezionati
  const onUnreleasedCheckedShowtimes = async () => {
    setIsUnreleasingCheckedShowtimes(true)
    setUnreleasedCheckedShowtimes(0)
    let successCounter = 0
    let errorCounter = 0
    const releasePromises = checkedShowtimes.map(async (checkedShowtime) => {
      try {
        const response = await axios.put(
          `/showtime/${checkedShowtime}`,
          { isRelease: false },
          {
            headers: {
              Authorization: `Bearer ${auth.token}`
            }
          }
        )
        setUnreleasedCheckedShowtimes((prev) => prev + 1)
        successCounter++
        return response
      } catch (error) {
        console.error(error)
        errorCounter++
      }
    })
    await Promise.all(releasePromises)
    toast.success(`Unreleased ${successCounter} checked showtimes successful!`, {
      position: 'top-center',
      autoClose: 2000,
      pauseOnHover: false
    })
    errorCounter > 0 &&
      toast.error(`Error unreleasing ${errorCounter} checked showtime`, {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false
      })
    resetState()
    fetchShowtimes()
    setIsUnreleasingCheckedShowtimes(false)
  }

  // Reset checkbox states
  // Resetta gli stati delle checkbox
  const resetState = () => {
    setIsCheckAll(false)
    setCheckedShowtimes([])
  }

  const navigate = useNavigate()

  // Main component render
  // Render principale del componente
  return (
    <div className="flex min-h-screen flex-col gap-4 pb-8 text-gray-900 sm:gap-8">
      <Navbar />
      <div className="mx-4 flex h-fit flex-col gap-2 sm:mx-8 sm:p-6">
        <h2 className="text-3xl font-bold text-black">Cerca Seminari</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between" onClick={() => setIsOpenFilter((prev) => !prev)}>
            <div className="flex items-center gap-2 text-2xl font-bold text-[#213D72]">
              <FunnelIcon className="h-6 w-6" />
              Filtra
            </div>
            {!isOpenFilter && (
              <ChevronDownIcon className="h-6 w-6 transition-all hover:scale-125 hover:cursor-pointer" />
            )}
            {isOpenFilter && (
              <ChevronUpIcon className="h-6 w-6 transition-all hover:scale-125 hover:cursor-pointer" />
            )}
          </div>
          {isOpenFilter && (
            <div className="">
              <div className="flex flex-col">
                <h4 className="pt-1 text-lg font-bold text-gray-800">Dipartimento :</h4>
                <Select
                  value={filterDip}
                  options={Array.from(
                    new Set(showtimes.map((showtime) => showtime.aula.dip._id))
                  ).map((value) => ({
                    value,
                    label: showtimes.find((showtime) => showtime.aula.dip._id === value)
                      .aula.dip.name
                  }))}
                  onChange={(value) => {
                    setFilterDip(value)
                    resetState()
                  }}
                  isClearable={true}
                  isMultiple={true}
                  isSearchable={true}
                  primaryColor="indigo"
                />
              </div>
              <div className="flex flex-col">
                <h4 className="pt-1 text-lg font-bold text-gray-800">Aula :</h4>
                <Select
                  value={filterAula}
                  options={Array.from(new Set(showtimes.map((showtime) => showtime.aula.number)))
                    .sort((a, b) => a - b)
                    .map((value) => ({
                      value,
                      label: value.toString()
                    }))}
                  onChange={(value) => {
                    setFilterAula(value)
                    resetState()
                  }}
                  isClearable={true}
                  isMultiple={true}
                  isSearchable={true}
                  primaryColor="indigo"
                />
              </div>
              <div className="flex flex-col">
                <h4 className="pt-1 text-lg font-bold text-gray-800">Seminario :</h4>
                <Select
                  value={filterSeminario}
                  options={Array.from(new Set(showtimes.map((showtime) => showtime.seminario._id))).map(
                    (value) => ({
                      value,
                      label: showtimes.find((showtime) => showtime.seminario._id === value).seminario.name
                    })
                  )}
                  onChange={(value) => {
                    setFilterSeminario(value)
                    resetState()
                  }}
                  isClearable={true}
                  isMultiple={true}
                  isSearchable={true}
                  primaryColor="indigo"
                />
              </div>
              <div className="flex flex-col">
                <h4 className="pt-1 text-lg font-bold text-gray-800">Data :</h4>
                <Select
                  value={filterDate}
                  options={Array.from(
                    new Set(
                      showtimes.map((showtime) => {
                        const showtimeDate = new Date(showtime.showtime)
                        const year = showtimeDate.getFullYear()
                        const month = showtimeDate.toLocaleString('default', { month: 'short' })
                        const day = showtimeDate.getDate().toString().padStart(2, '0')
                        return `${day} ${month} ${year}`
                      })
                    )
                  ).map((value) => ({
                    value,
                    label: value
                  }))}
                  onChange={(value) => {
                    setFilterDate(value)
                    resetState()
                  }}
                  isClearable={true}
                  isMultiple={true}
                  isSearchable={true}
                  primaryColor="indigo"
                />
                <div className="my-2 flex flex-col items-start gap-x-2 gap-y-1 sm:flex-row sm:items-center">
                  <label className="text-md font-semibold text-gray-800">Da</label>
                  <Select
                    value={filterDateFrom}
                    options={Array.from(
                      new Set(
                        showtimes.map((showtime) => {
                          const showtimeDate = new Date(showtime.showtime)
                          const year = showtimeDate.getFullYear()
                          const month = showtimeDate.toLocaleString('default', {
                            month: 'short'
                          })
                          const day = showtimeDate.getDate().toString().padStart(2, '0')
                          return `${day} ${month} ${year}`
                        })
                      )
                    )
                      .map((value) => ({
                        value,
                        label: value
                      }))}
                    onChange={(value) => {
                      setFilterDateFrom(value)
                      resetState()
                    }}
                    isClearable={true}
                    isSearchable={true}
                    primaryColor="indigo"
                  />
                  <label className="text-md font-semibold text-gray-800">A</label>
                  <Select
                    value={filterDateTo}
                    options={Array.from(
                      new Set(
                        showtimes.map((showtime) => {
                          const showtimeDate = new Date(showtime.showtime)
                          const year = showtimeDate.getFullYear()
                          const month = showtimeDate.toLocaleString('default', {
                            month: 'short'
                          })
                          const day = showtimeDate.getDate().toString().padStart(2, '0')
                          return `${day} ${month} ${year}`
                        })
                      )
                    )
                      .map((value) => ({
                        value,
                        label: value
                      }))}
                    onChange={(value) => {
                      setFilterDateTo(value)
                      resetState()
                    }}
                    isClearable={true}
                    isSearchable={true}
                    primaryColor="indigo"
                  />
                </div>
                <div className="flex flex-col items-start gap-x-8 gap-y-2 sm:flex-row sm:items-center">
                  <label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
                    Data passata
                    <input
                      type="checkbox"
                      className="h-6 w-6"
                      checked={filterPastDate}
                      onClick={(event) => {
                        setFilterPastDate(event.target.checked)
                        setFilterToday(false)
                        setFilterFutureDate(false)
                        resetState()
                      }}
                    />
                  </label>
                  <label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
                    Oggi
                    <input
                      type="checkbox"
                      className="h-6 w-6"
                      checked={filterToday}
                      onClick={(event) => {
                        setFilterPastDate(false)
                        setFilterToday(event.target.checked)
                        setFilterFutureDate(false)
                        resetState()
                      }}
                    />
                  </label>
                  <label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
                    Data futura
                    <input
                      type="checkbox"
                      className="h-6 w-6"
                      checked={filterFutureDate}
                      onClick={(event) => {
                        setFilterPastDate(false)
                        setFilterToday(false)
                        setFilterFutureDate(event.target.checked)
                        resetState()
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="pt-1 text-lg font-bold text-gray-800">Orario :</h4>
                <Select
                  value={filterTime}
                  options={Array.from(
                    new Set(
                      showtimes.map((showtime) => {
                        const showtimeDate = new Date(showtime.showtime)
                        const hours = showtimeDate.getHours().toString().padStart(2, '0')
                        const minutes = showtimeDate.getMinutes().toString().padStart(2, '0')
                        return `${hours} : ${minutes}`
                      })
                    )
                  )
                    .sort()
                    .map((value) => ({
                      value,
                      label: value
                    }))}
                  onChange={(value) => {
                    setFilterTime(value)
                    resetState()
                  }}
                  isClearable={true}
                  isMultiple={true}
                  isSearchable={true}
                  primaryColor="indigo"
                />
                <div className="my-2 flex flex-col items-start gap-x-2 gap-y-1 sm:flex-row sm:items-center">
                  <label className="text-md font-semibold text-gray-800">Da</label>
                  <Select
                    value={filterTimeFrom}
                    options={Array.from(
                      new Set(
                        showtimes.map((showtime) => {
                          const showtimeDate = new Date(showtime.showtime)
                          const hours = showtimeDate.getHours().toString().padStart(2, '0')
                          const minutes = showtimeDate
                            .getMinutes()
                            .toString()
                            .padStart(2, '0')
                          return `${hours} : ${minutes}`
                        })
                      )
                    )
                      .sort()
                      .map((value) => ({
                        value,
                        label: value
                      }))}
                    onChange={(value) => {
                      setFilterTimeFrom(value)
                      resetState()
                    }}
                    isClearable={true}
                    isSearchable={true}
                    primaryColor="indigo"
                  />
                  <label className="text-md font-semibold text-gray-800">A</label>
                  <Select
                    value={filterTimeTo}
                    options={Array.from(
                      new Set(
                        showtimes.map((showtime) => {
                          const showtimeDate = new Date(showtime.showtime)
                          const hours = showtimeDate.getHours().toString().padStart(2, '0')
                          const minutes = showtimeDate
                            .getMinutes()
                            .toString()
                            .padStart(2, '0')
                          return `${hours} : ${minutes}`
                        })
                      )
                    )
                      .sort()
                      .map((value) => ({
                        value,
                        label: value
                      }))}
                    onChange={(value) => {
                      setFilterTimeTo(value)
                      resetState()
                    }}
                    isClearable={true}
                    isSearchable={true}
                    primaryColor="indigo"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="pt-1 text-lg font-bold text-gray-800">Pubbliccato :</h4>
                <div className="mt-1 flex flex-col items-start gap-x-8 gap-y-2 sm:flex-row sm:items-center">
                  <label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
                    Sì
                    <input
                      type="checkbox"
                      className="h-6 w-6"
                      checked={filterReleaseTrue}
                      onClick={(event) => {
                        setFilterReleaseTrue(event.target.checked)
                        setFilterReleaseFalse(false)
                        resetState()
                      }}
                    />
                  </label>
                  <label className="text-md flex items-center justify-between gap-2 font-semibold text-gray-800">
                    Non ancora
                    <input
                      type="checkbox"
                      className="h-6 w-6"
                      checked={filterReleaseFalse}
                      onClick={(event) => {
                        setFilterReleaseTrue(false)
                        setFilterReleaseFalse(event.target.checked)
                        resetState()
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-end">
          <ArrowDownIcon className="h-8 min-h-[32px] w-8 min-w-[32px] px-1" />
          <div className="flex flex-wrap items-center gap-2 px-1">
            <button
              className="flex w-fit items-center justify-center gap-1 bg-[#8796B3] py-1 pr-1.5 text-sm font-medium disabled:to-slate-400 md:min-w-fit"
              onClick={() => handleReleaseCheckedShowtimes()}
              disabled={checkedShowtimes.length === 0 || isReleasingCheckedShowtimes}
            >
              {isReleasingCheckedShowtimes ? (
                `${releasedCheckedShowtimes} / ${checkedShowtimes.length} Seminari Pubblicati`
              ) : (
                <>
                  <EyeIcon className="h-5 w-5" />
                  {`Pubblica ${checkedShowtimes.length} Seminari selezionati`}
                </>
              )}
            </button>
            <button
              className="flex w-fit items-center justify-center gap-1 bg-[#8796B3] py-1 pl-2 pr-1.5 text-sm font-medium text-whitedisabled:from-slate-500 disabled:to-slate-400 md:min-w-fit"
              onClick={() => handleUnreleasedCheckedShowtimes()}
              disabled={checkedShowtimes.length === 0 || isUnreleasingCheckedShowtimes}
            >
              {isUnreleasingCheckedShowtimes ? (
                `${unreleasedCheckedShowtimes} / ${checkedShowtimes.length} Seminari nascosti`
              ) : (
                <>
                  <EyeSlashIcon className="h-5 w-5" />
                  {`Nascondi ${checkedShowtimes.length} Seminari selezionati`}
                </>
              )}
            </button>
            <button
              className="flex w-fit items-center justify-center gap-1 bg-red-500 py-1 pl-2 pr-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:from-slate-500 disabled:to-slate-400 md:min-w-fit"
              onClick={() => handleDeleteCheckedShowtimes()}
              disabled={checkedShowtimes.length === 0 || isDeletingCheckedShowtimes}
            >
              {isDeletingCheckedShowtimes ? (
                `${deletedCheckedShowtimes} / ${checkedShowtimes.length} Seminari eliminati`
              ) : (
                <>
                  <TrashIcon className="h-5 w-5" />
                  {`Elimina ${checkedShowtimes.length} Seminari selezionati`}
                </>
              )}
            </button>
          </div>

          {isFetchingShowtimesDone && (
            <div className="ml-auto flex items-center gap-1 px-1 text-sm font-medium text-white">
              <InformationCircleIcon className="h-5 w-5" /> Mostrando {filteredShowtimes.length} Seminari filtrati
            </div>
          )}
        </div>

        {/* Main table displaying filtered seminars */}
        {/* Tabella principale che mostra i seminari filtrati */}
        <div
          className={`mb-4 grid max-h-screen overflow-auto`}
          style={{ gridTemplateColumns: '34px repeat(7, minmax(max-content, 1fr)) 104px' }}
        >
          {/* Table headers with sorting functionality */}
          {/* Intestazioni della tabella con funzionalità di ordinamento */}
          <p className="sticky top-0 flex items-center justify-center text-center text-xl font-semibold text-white">
            <input
              type="checkbox"
              className="h-6 w-6"
              checked={isCheckAll}
              onChange={() => {
                if (isCheckAll) {
                  setIsCheckAll(false)
                  setCheckedShowtimes([])
                } else {
                  setIsCheckAll(true)
                  setCheckedShowtimes((prev) => [
                    ...prev,
                    ...filteredShowtimes.map((showtime) => showtime._id)
                  ])
                }
              }}
              disabled={!isFetchingShowtimesDone}
            />
          </p>
          <button
            className="sticky top-0 flex justify-center bg-white text-black px-2 py-1 text-center text-xl font-semibold"
            onClick={() => {
              let prevValue = sortDip
              resetSort()
              setSortDip(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
            }}
          >
            <p className="ml-auto">Dipartimento</p>
            {sortDip === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
            {sortDip === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
            {sortDip === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
          </button>
          <button
            className="sticky top-0 flex justify-center bg-white text-black px-2 py-1 text-center text-xl font-semibold"
            onClick={() => {
              let prevValue = sortAula
              resetSort()
              setSortAula(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
            }}
          >
            <p className="ml-auto">Aula</p>
            {sortAula === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
            {sortAula === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
            {sortAula === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
          </button>
          <button
            className="sticky top-0 flex justify-center bg-white text-black px-2 py-1 text-center text-xl font-semibold"
            onClick={() => {
              let prevValue = sortSeminario
              resetSort()
              setSortSeminario(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
            }}
          >
            <p className="ml-auto">Seminario</p>
            {sortSeminario === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
            {sortSeminario === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
            {sortSeminario === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
          </button>
          <button
            className="sticky top-0 flex justify-center bg-white text-black px-2 py-1 text-center text-xl font-semibold"
            onClick={() => {
              let prevValue = sortDate
              resetSort()
              setSortDate(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
            }}
          >
            <p className="ml-auto">Data</p>
            {sortDate === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
            {sortDate === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
            {sortDate === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
          </button>
          <button
            className="sticky top-0 flex justify-center bg-white text-black px-2 py-1 text-center text-xl font-semibold"
            onClick={() => {
              let prevValue = sortTime
              resetSort()
              setSortTime(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
            }}
          >
            <p className="ml-auto">Orario</p>
            {sortTime === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
            {sortTime === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
            {sortTime === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
          </button>
          <button
            className="sticky top-0 flex justify-center bg-white text-black px-2 py-1 text-center text-xl font-semibold"
            onClick={() => {
              let prevValue = sortBooked
              resetSort()
              setSortBooked(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
            }}
          >
            <p className="ml-auto">Prenotazioni</p>
            {sortBooked === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
            {sortBooked === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
            {sortBooked === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
          </button>
          <button
            className="sticky top-0 flex justify-center bg-white text-black px-2 py-1 text-center text-xl font-semibold"
            onClick={() => {
              let prevValue = sortRelease
              resetSort()
              setSortRelease(prevValue === 0 ? 1 : prevValue === 1 ? -1 : 0)
            }}
          >
            <p className="ml-auto">Pubblicato</p>
            {sortRelease === 0 && <ChevronUpDownIcon className="ml-auto w-6 h-6" />}
            {sortRelease === 1 && <ChevronUpIcon className="ml-auto w-6 h-6" />}
            {sortRelease === -1 && <ChevronDownIcon className="ml-auto w-6 h-6" />}
          </button>
          <p className="sticky top-0 z-[1] flex items-center justify-center gap-2 bg-white text-black px-2 py-1 text-center text-xl font-semibold">
            <MapIcon className="h-6 w-6" />
            Vedi
          </p>
          
          {/* Table rows with seminar data */}
          {/* Righe della tabella con i dati dei seminari */}
          {isFetchingShowtimesDone &&
            filteredShowtimes.map((showtime, index) => {
              const showtimeDate = new Date(showtime.showtime)
              const year = showtimeDate.getFullYear()
              const month = showtimeDate.toLocaleString('default', { month: 'short' })
              const day = showtimeDate.getDate().toString().padStart(2, '0')
              const hours = showtimeDate.getHours().toString().padStart(2, '0')
              const minutes = showtimeDate.getMinutes().toString().padStart(2, '0')
              const isCheckedRow = checkedShowtimes.includes(showtime._id)
              return (
                <Fragment key={index}>
                  <div
                    className={`flex items-center justify-center border-t-2 border-indigo-200 ${
                      isCheckedRow && 'border-white bg-blue-200 text-blue-800'
                    }`}
                  >
                    <input
                      id={showtime._id}
                      type="checkbox"
                      className="h-6 w-6"
                      checked={checkedShowtimes.includes(showtime._id)}
                      onChange={(e) => {
                        const { id, checked } = e.target
                        setCheckedShowtimes((prev) => [...prev, id])
                        if (!checked) {
                          setCheckedShowtimes((prev) => prev.filter((item) => item !== id))
                        }
                      }}
                      disabled={!isFetchingShowtimesDone}
                    />
                  </div>
                  <div
                    className={`border-t-2 border-indigo-200 px-2 py-1 ${
                      isCheckedRow && 'border-white bg-blue-200 text-blue-800'
                    }`}
                  >
                    {showtime.aula.dip.name}
                  </div>
                  <div
                    className={`border-t-2 border-indigo-200 px-2 py-1 ${
                      isCheckedRow && 'border-white bg-blue-200 text-blue-800'
                    }`}
                  >
                    {showtime.aula.number}
                  </div>
                  <div
                    className={`border-t-2 border-indigo-200 px-2 py-1 ${
                      isCheckedRow && 'border-white bg-blue-200 text-blue-800'
                    }`}
                  >
                    {showtime.seminario.name}
                  </div>
                  <div
                    className={`border-t-2 border-indigo-200 px-2 py-1 ${
                      isCheckedRow && 'border-white bg-blue-200 text-blue-800'
                    }`}
                  >{`${day} ${month} ${year}`}</div>
                  <div
                    className={`border-t-2 border-indigo-200 px-2 py-1 ${
                      isCheckedRow && 'border-white bg-blue-200 text-blue-800'
                    }`}
                  >{`${hours} : ${minutes}`}</div>
                  <div
                    className={`border-t-2 border-indigo-200 px-2 py-1 ${
                      isCheckedRow && 'border-white bg-blue-200 text-blue-800'
                    }`}
                  >
                    {showtime.seats.length}
                  </div>
                  <div
                    className={`flex items-center gap-2 border-t-2 border-indigo-200 px-2 py-1 ${
                      isCheckedRow && 'border-white bg-blue-200 text-blue-800'
                    }`}
                  >
                    <p>
                      {String(showtime.isRelease).charAt(0).toUpperCase() +
                        String(showtime.isRelease).slice(1)}
                    </p>
                    {!showtime.isRelease && (
                      <EyeSlashIcon className="h-5 w-5" title="Unreleased showtime" />
                    )}
                  </div>
                  <button
                    className="flex items-center justify-center gap-2 bg-blue-900 px-2 py-1 text-white mb-0.5 disabled:from-slate-500 disabled:to-slate-400"
                    onClick={() => navigate(`/showtime/${showtime._id}`)}
                  >
                    <MapIcon className="h-6 w-6" />
                  </button>
                </Fragment>
              )
            })}
        </div>
        {!isFetchingShowtimesDone && <Loading />}
      </div>
    </div>
  )
}

export default Search