import { TicketIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import { Fragment, useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Select from 'react-tailwindcss-select'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import Seat from '../components/Seat'
import ShowtimeDetails from '../components/ShowtimeDetails'
import { AuthContext } from '../context/AuthContext'

const Showtime = () => {

  const { auth } = useContext(AuthContext)
  const { id } = useParams()
  const [showtime, setShowtime] = useState({})
  const [selectedSeats, setSelectedSeats] = useState([])
  const [filterRow, setFilterRow] = useState(null)
  const [filterColumn, setFilterColumn] = useState(null)

  const sortedSelectedSeat = selectedSeats.sort((a, b) => {

    const [rowA, numberA] = a.match(/([A-Za-z]+)(\d+)/).slice(1)
    const [rowB, numberB] = b.match(/([A-Za-z]+)(\d+)/).slice(1)
    
    if (rowA === rowB) {
      if (parseInt(numberA) > parseInt(numberB)) {
        return 1
      } else {
        return -1
      }
    } else if (rowA.length > rowB.length) {
      return 1
    } else if (rowA.length < rowB.length) {
      return -1
    } else if (rowA > rowB) {
      return 1
    }
    return -1
  })

  const fetchShowtime = async (data) => {
    try {

      let response
      if (auth.role === 'admin') {
        response = await axios.get(`/showtime/user/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        })
      } else {
        response = await axios.get(`/showtime/${id}`)
      }
      setShowtime(response.data.data)
    } catch (error) {
      console.error(error)
      toast.error(error.response.data.message || 'Error', {
        position: 'top-center',
        autoClose: 2000,
        pauseOnHover: false
      })
    }
  }

  useEffect(() => {
    fetchShowtime()
  }, [])

  const row = showtime?.aula?.seatPlan?.row
  let rowLetters = []
  if (row) {
    for (let k = 64; k <= (row.length === 2 ? row.charCodeAt(0) : 64); k++) {
      for (
        let i = 65;
        i <= (k === row.charCodeAt(0) || row.length === 1 ? row.charCodeAt(row.length - 1) : 90);
        i++
      ) {
        const letter = k === 64 ? String.fromCharCode(i) : String.fromCharCode(k) + String.fromCharCode(i)
        rowLetters.push(letter)
      }
    }
  }

  const column = showtime?.aula?.seatPlan.column
  let colNumber = []
  for (let k = 1; k <= column; k++) {
    colNumber.push(k)
  }

  const isPast = new Date(showtime.showtime) < new Date()

  const filteredSeats = showtime?.seats?.filter((seat) => {
    return (
      (!filterRow || filterRow.map((row) => row.value).includes(seat.row)) &&
      (!filterColumn || filterColumn.map((column) => column.value).includes(String(seat.number)))
    )
  })

  return (
    <div className="flex min-h-screen flex-col gap-4 pb-8 sm:gap-8">

      <Navbar />

      <div className="mx-4 h-fit p-4 sm:mx-8 sm:p-6">
        {showtime.showtime ? (
          <>

            <ShowtimeDetails showtime={showtime} showDeleteBtn={true} fetchShowtime={fetchShowtime} />

            <div className="flex flex-col justify-between text-center border-b-2 border-black border-l-2 text-lg md:flex-row">
              <div className="flex flex-col items-center gap-x-4 px-4 py-2 md:flex-row">
                {!isPast && <p className="font-semibold">Posti selezionati :</p>}
                <p className="text-start">{sortedSelectedSeat.join(', ')}</p>
                {!!selectedSeats.length && (
                  <p className="whitespace-nowrap">({selectedSeats.length} posti)</p>
                )}
              </div>
              {!!selectedSeats.length && (
                <Link
                  to={auth.role ? `/purchase/${id}` : '/login'}
                  state={{
                    selectedSeats: sortedSelectedSeat,
                    showtime
                  }}
                  className="flex items-center justify-center gap-2 bg-black px-4 py-1 font-semibold text-white"
                >
                  <p>Acquista</p>
                  <TicketIcon className="h-7 w-7 text-white" />
                </Link>
              )}
            </div>

            <div className="mx-auto mt-8 flex flex-col items-center bg-[#F0F8FF] p-4 text-center">
              
              <div className="flex w-full flex-col overflow-x-auto overflow-y-hidden">
                <div className="m-auto my-2">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <div className="flex h-8 w-8 items-center">
                        <p className="w-8"></p>
                      </div>
                      {colNumber.map((col, index) => {
                        return (
                          <div key={index} className="flex h-8 w-8 items-center">
                            <p className="w-8 font-semibold">{col}</p>
                          </div>
                        )
                      })}
                    </div>

                    {rowLetters.reverse().map((rowLetter, index) => {
                      return (
                        <div key={index} className="flex">
                          <div className="flex h-8 w-8 items-center">
                            <p className="w-8 text-xl font-semibold">{rowLetter}</p>
                          </div>

                          {colNumber.map((col, index) => {
                            return (
                              <Seat
                                key={index}
                                seat={{ row: rowLetter, number: col }}
                                setSelectedSeats={setSelectedSeats}
                                selectable={!isPast}
                                isAvailable={
                                  !showtime.seats.find(
                                    (seat) =>
                                      seat.row === rowLetter &&
                                      seat.number === col
                                  )
                                }
                              />
                            )
                          })}
                          <div className="flex h-8 w-8 items-center">
                            <p className="w-8 text-xl font-semibold">{rowLetter}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="px-7 bg-white border-2">
                <div className="text-xl font-bold">
                  Schermo Pc Del Prof
                </div>
              </div>
            </div>

            {auth.role === 'admin' && (
              <>
                <h2 className="mt-10 text-2xl font-bold">Posti prenotati</h2>
                <div className="flex gap-2 bg-[#F0F8FF] p-4">
                  <div className="flex grow flex-col">
                    <h4 className="text-lg font-bold text-gray-800">Fila</h4>
                    <Select
                      value={filterRow}
                      options={Array.from(new Set(showtime?.seats.map((seat) => seat.row)))
                        .sort((a, b) => {
                          const rowA = a.row
                          const rowB = b.row
                          if (rowA === rowB) {
                            return 0
                          } else if (rowA.length > rowB.length) {
                            return 1
                          } else if (rowA.length < rowB.length) {
                            return -1
                          } else if (rowA > rowB) {
                            return 1
                          }
                          return -1
                        })
                        .map((value) => ({
                          value,
                          label: value
                        }))}
                      onChange={(value) => {
                        setFilterRow(value)
                      }}
                      isClearable={true}
                      isMultiple={true}
                      isSearchable={true}
                      primaryColor="indigo"
                    />
                  </div>

                  <div className="flex grow flex-col">
                    <h4 className="text-lg font-bold text-gray-800">Numero</h4>
                    <Select
                      value={filterColumn}
                      options={Array.from(new Set(showtime?.seats.map((seat) => seat.number)))
                        .sort((a, b) => {
                          return a - b
                        })
                        .map((value) => ({
                          value: String(value),
                          label: String(value)
                        }))}
                      onChange={(value) => {
                        setFilterColumn(value)
                      }}
                      isClearable={true}
                      isMultiple={true}
                      isSearchable={true}
                      primaryColor="indigo"
                    />
                  </div>
                </div>
                <div
                  className="mt-4 grid max-h-screen w-full overflow-auto"
                  style={{
                    gridTemplateColumns: 'repeat(4, minmax(max-content, 1fr))'
                  }}
                >
                  <p className="sticky top-0 bg-[#F0F8FF] px-2 py-1 text-center text-xl font-semibold text-black border-r-2 border-gray-200">
                    Posto
                  </p>
                  <p className="sticky top-0 bg-[#F0F8FF] px-2 py-1 text-center text-xl font-semibold text-black border-r-2 border-gray-200">
                    Nome utente
                  </p>
                  <p className="sticky top-0 bg-[#F0F8FF] px-2 py-1 text-center text-xl font-semibold text-black border-r-2 border-gray-200">
                    Email
                  </p>
                  <p className="sticky top-0 bg-[#F0F8FF] px-2 py-1 text-center text-xl font-semibold text-black border-r-2 border-gray-200">
                    Ruolo
                  </p>

                  {filteredSeats
                    .sort((a, b) => {
                      const rowA = a.row
                      const numberA = a.number
                      const rowB = b.row
                      const numberB = b.number
                      if (rowA === rowB) {
                        if (parseInt(numberA) > parseInt(numberB)) {
                          return 1
                        } else {
                          return -1
                        }
                      } else if (rowA.length > rowB.length) {
                        return 1
                      } else if (rowA.length < rowB.length) {
                        return -1
                      } else if (rowA > rowB) {
                        return 1
                      }
                      return -1
                    })
                    .map((seat, index) => {
                      return (
                        <Fragment key={index}>
                          <div className="border-t-2 border-gray-200 px-2 py-1">
                            {`${seat.row}${seat.number}`}
                          </div>
                          <div className="border-t-2 border-gray-200 px-2 py-1">
                            {seat.user.username}
                          </div>
                          <div className="border-t-2 border-gray-200 px-2 py-1">
                            {seat.user.email}
                          </div>
                          <div className="border-t-2 border-gray-200 px-2 py-1">
                            {seat.user.role}
                          </div>
                        </Fragment>
                      )
                    })}
                </div>
              </>
            )}
          </>
        ) : (
          <Loading />
        )}
      </div>
    </div>
  )
}

export default Showtime