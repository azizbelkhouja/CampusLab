import axios from 'axios'
import { useEffect, useState } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import DipLists from './DipLists'
import DateSelector from './DateSelector'
import Loading from './Loading'
import AulaShort from './AulaShort'

const AulaListsBySeminario = ({ seminari, selectedSeminarioIndex, setSelectedSeminarioIndex, auth }) => {
	const [selectedDate, setSelectedDate] = useState(
		(sessionStorage.getItem('selectedDate') && new Date(sessionStorage.getItem('selectedDate'))) || new Date()
	)
	const [aulas, setAulas] = useState([])
	const [isFetchingAulasDone, setIsFetchingAulasDone] = useState(false)
	const [selectedDipIndex, setSelectedDipIndex] = useState(
		parseInt(sessionStorage.getItem('selectedDipIndex'))
	)
	const [dips, setDips] = useState([])
	const [isFetchingDips, setIsFetchingDips] = useState(true)

	const fetchDips = async (data) => {
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

	useEffect(() => {
		fetchDips()
	}, [])

	const fetchAulas = async (data) => {
		try {
			setIsFetchingAulasDone(false)
			let response
			if (auth.role === 'admin') {
				response = await axios.get(
					`/aula/seminario/unreleased/${
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
					`/aula/seminario/${
						seminari[selectedSeminarioIndex]._id
					}/${selectedDate.toISOString()}/${new Date().getTimezoneOffset()}`
				)
			}
			setAulas(
				response.data.data.sort((a, b) => {
					if (a.dip.name > b.dip.name) return 1
					if (a.dip.name === b.dip.name && a.number > b.number) return 1
					return -1
				})
			)
			setIsFetchingAulasDone(true)
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		fetchAulas()
	}, [selectedSeminarioIndex, selectedDate])

	const props = {
		dips,
		selectedDipIndex,
		setSelectedDipIndex,
		fetchDips,
		auth,
		isFetchingDips
	}

	const filteredAulas = aulas.filter((aula) => {
		if (selectedDipIndex === 0 || !!selectedDipIndex) {
			return aula.dip?.name === dips[selectedDipIndex]?.name
		}
		return true
	})

	return (
		<>
			<DipLists {...props} />
			<div className="mx-4 h-fit border text-gray-900 sm:mx-8">
				<div className="flex flex-col gap-6 p-4 sm:p-6">

					<DateSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

					<div className="flex flex-col gap-4 border py-4">
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
					{isFetchingAulasDone ? (
						<div className="flex flex-col">
							{filteredAulas.map((aula, index) => {
								return (
									<div
										key={index}
										className={`flex flex-col ${
											index !== 0 &&
											filteredAulas[index - 1]?.dip.name !==
												filteredAulas[index].dip.name &&
											'mt-6'
										}`}
									>
										{filteredAulas[index - 1]?.dip.name !==
											filteredAulas[index].dip.name && (
											<div className="bg-black px-2 py-1.5 text-center text-2xl font-semibold text-white sm:py-2">
												<h2>{aula.dip.name}</h2>
											</div>
										)}
										<AulaShort
											aulaId={aula._id}
											seminari={seminari}
											selectedDate={selectedDate}
											filterSeminario={seminari[selectedSeminarioIndex]}
											rounded={
												index == filteredAulas.length ||
												filteredAulas[index + 1]?.dip.name !==
													filteredAulas[index].dip.name
											}
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
