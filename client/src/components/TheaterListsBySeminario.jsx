import axios from 'axios'
import { useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import LabLists from './LabLists'
import DateSelector from './DateSelector'
import Loading from './Loading'
import TheaterShort from './TheaterShort'

const TheaterListsBySeminario = ({ seminari, selectedSeminarioIndex, setSelectedSeminarioIndex, auth }) => {
	const [selectedDate, setSelectedDate] = useState(
		(sessionStorage.getItem('selectedDate') && new Date(sessionStorage.getItem('selectedDate'))) || new Date()
	)
	const [theaters, setTheaters] = useState([])
	const [isFetchingTheatersDone, setIsFetchingTheatersDone] = useState(false)
	const [selectedLabIndex, setSelectedLabIndex] = useState(
		parseInt(sessionStorage.getItem('selectedLabIndex'))
	)
	const [labs, setLabs] = useState([])
	const [isFetchingLabs, setIsFetchingLabs] = useState(true)

	const fetchLabs = async (data) => {
		try {
			setIsFetchingLabs(true)
			let response
			if (auth.role === 'admin') {
				response = await axios.get('/lab/unreleased', {
					headers: {
						Authorization: `Bearer ${auth.token}`
					}
				})
			} else {
				response = await axios.get('/lab')
			}
			// console.log(response.data.data)
			setLabs(response.data.data)
		} catch (error) {
			console.error(error)
		} finally {
			setIsFetchingLabs(false)
		}
	}

	useEffect(() => {
		fetchLabs()
	}, [])

	const fetchTheaters = async (data) => {
		try {
			setIsFetchingTheatersDone(false)
			let response
			if (auth.role === 'admin') {
				response = await axios.get(
					`/theater/seminario/unreleased/${
						seminari[selectedSeminarioIndex]._id
					}/${selectedDate.toISOString()}/${new Date().getTimezoneOffset()}`,
					{
						headers: {
							Authorization: `Bearer ${auth.token}`
						}
					}
				)
			} else {
				response = await axios.get(
					`/theater/seminario/${
						seminari[selectedSeminarioIndex]._id
					}/${selectedDate.toISOString()}/${new Date().getTimezoneOffset()}`
				)
			}
			setTheaters(
				response.data.data.sort((a, b) => {
					if (a.lab.name > b.lab.name) return 1
					if (a.lab.name === b.lab.name && a.number > b.number) return 1
					return -1
				})
			)
			setIsFetchingTheatersDone(true)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		fetchTheaters()
	}, [selectedSeminarioIndex, selectedDate])

	const props = {
		labs,
		selectedLabIndex,
		setSelectedLabIndex,
		fetchLabs,
		auth,
		isFetchingLabs
	}

	const filteredTheaters = theaters.filter((theater) => {
		if (selectedLabIndex === 0 || !!selectedLabIndex) {
			return theater.lab?.name === labs[selectedLabIndex]?.name
		}
		return true
	})

	return (
		<>
			<LabLists {...props} />
			<div className="mx-4 h-fit rounded-md bg-gradient-to-br from-indigo-200 to-blue-100 text-gray-900 drop-shadow-md sm:mx-8">
				<div className="flex flex-col gap-6 p-4 sm:p-6">
					<DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
					<div className="flex flex-col gap-4 rounded-md bg-gradient-to-br from-indigo-100 to-white py-4">
						<div className="flex items-center">
							<img src={seminari[selectedSeminarioIndex].img} className="w-32 px-4 drop-shadow-md" />
							<div>
								<h4 className="text-2xl font-semibold">{seminari[selectedSeminarioIndex].name}</h4>
								<p className="text-md font-medium">
									length : {seminari[selectedSeminarioIndex].length || '-'} min
								</p>
							</div>
						</div>
					</div>
					{isFetchingTheatersDone ? (
						<div className="flex flex-col">
							{filteredTheaters.map((theater, index) => {
								return (
									<div
										key={index}
										className={`flex flex-col ${
											index !== 0 &&
											filteredTheaters[index - 1]?.lab.name !==
												filteredTheaters[index].lab.name &&
											'mt-6'
										}`}
									>
										{filteredTheaters[index - 1]?.lab.name !==
											filteredTheaters[index].lab.name && (
											<div className="rounded-t-md bg-gradient-to-br from-indigo-800 to-blue-700 px-2 py-1.5 text-center text-2xl font-semibold text-white sm:py-2">
												<h2>{theater.lab.name}</h2>
											</div>
										)}
										<TheaterShort
											theaterId={theater._id}
											seminari={seminari}
											selectedDate={selectedDate}
											filterSeminario={seminari[selectedSeminarioIndex]}
											rounded={
												index == filteredTheaters.length ||
												filteredTheaters[index + 1]?.lab.name !==
													filteredTheaters[index].lab.name
											}
										/>
									</div>
								)
							})}
							{filteredTheaters.length === 0 && (
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

export default TheaterListsBySeminario
